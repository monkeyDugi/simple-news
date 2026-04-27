---
name: new-scraper
description: "Simple News에 새 뉴스 소스 스크래퍼를 추가한다. '새 사이트 스크래퍼', '소스 추가', 'cheerio로 X 사이트 긁기' 요청 시 트리거. 페이지 분석 → 셀렉터 매핑 → 본문 정제 → 인터페이스 준수 → docs/scraping-guide.md 갱신까지 일관된 절차."
---

# new-scraper — 새 뉴스 스크래퍼 추가 절차

## 목적

`Scraper` 인터페이스를 구현하는 새 어댑터를 안전하게 추가한다. 봇 차단을 피하고 셀렉터 변경에 대비한다.

## 절차

### 1. 페이지 구조 실측

- WebFetch 또는 직접 브라우저 DevTools로 페이지를 열어 HTML 구조 파악
- 두 가지 페이지 분석:
  - **목록 페이지** (섹션 페이지) → 기사 카드들의 link, title, publisher, publishedAt
  - **상세 페이지** (개별 기사) → content(본문), author, thumbnail
- 각각의 CSS 셀렉터를 적어둠

### 2. 파일 추가

- `lib/scrapers/<source-name>.ts` (예: `naver-finance.ts`, `hankyung.ts`)
- 인터페이스 준수: `lib/scrapers/types.ts`의 `Scraper`
  - `name: string` (예: `"naver-general"`)
  - `fetchList(section: Section): Promise<ScrapedListItem[]>`
  - `fetchDetail(item: ScrapedListItem): Promise<ScrapedArticle>`

### 3. cheerio 셀렉터 매핑

```ts
import * as cheerio from 'cheerio';

const $ = cheerio.load(html);
const articles = $('ul.newsList > li').map((_, el) => {
  const $el = $(el);
  return {
    title: $el.find('a.title').text().trim(),
    link: absoluteUrl($el.find('a.title').attr('href')),
    publisher: $el.find('span.press').text().trim(),
    publishedAt: parseKstToUtc($el.find('span.wdate').text()),
  };
}).get();
```

### 4. 본문 정제

```ts
import { cleanContent } from './shared';

const $ = cheerio.load(detailHtml);
const rawContent = $('#dic_area').html() ?? '';
const content = cleanContent(rawContent);  // script, style, ad 제거
```

### 5. User-Agent / 요청 정책

- 공통 헤더: `lib/scrapers/shared.ts`의 `defaultHeaders`
- 요청 간격 500ms (모듈 내부에서 sleep)
- 섹션 간 병렬 OK, 섹션 안에서는 순차

### 6. 에러 처리

- 네트워크 에러: 1회 재시도 후 다음 섹션
- 셀렉터 매치 실패: 해당 기사만 스킵 + 로그 (전체 중단 X)
- 본문 추출 실패: 그 기사는 article_template에 안 들어감

### 7. 등록

- `lib/scrapers/index.ts`에 새 스크래퍼 등록
- Cron 라우트(`/api/cron/scrape`)에서 모든 등록된 스크래퍼 순회

### 8. 문서 동기화

`@docs/scraping-guide.md`에 추가:
- 사이트 이름 / URL
- 목록 페이지 셀렉터 표
- 상세 페이지 셀렉터 표
- 특수 정제 규칙 (광고/저작권 영역 등)
- 알려진 차단 사례 history

### 9. 검증

```bash
tsx scripts/test-scraper.ts <source-name> <section>
```

- 콘솔에 N건 추출 확인
- 셀렉터 깨졌는지 (NULL 필드 발생) 체크
- 본문 길이 평균 확인

## 사용자 타이핑 체크포인트

- 스크래퍼 .ts 파일 → 사용자 타이핑
- 일회성 테스트 스크립트 → 사용자 타이핑
- `docs/scraping-guide.md` 갱신 → Claude 직접 편집
- `TODO.md` 해당 항목 체크
