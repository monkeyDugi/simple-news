# Scraping Guide — Simple News

> 네이버 뉴스에서 7개 섹션을 스크래핑하기 위한 셀렉터 매핑과 운영 가이드.

## 흐름 (flowpick CollectNews 패턴)

한 cron 호출은 다음 3단계를 순차 처리한다 (`lib/cron/scrape-runner.ts`):

```
1) Collect:    7섹션 페이지 fetch → NewsListItem 메타만 (본문 X)
   - scraper.getNewsList(section) 호출
2) Filter:     fetchExistingArticleSourceIds(...) 로 article 테이블 비교
   - 이미 있는 source_article_id 제외 → 신규만 남김
3) Scrape&Save: 신규에 한해서만 scrapeArticle(item) (본문 fetch) → insertArticleTemplate
   - 호출 사이 REQUEST_DELAY_MS sleep (네이버 봇 보호 회피)
```

핵심: **본문 fetch 가 신규 건수만큼만**. 항상 7×30 호출하던 구버전 대비 cron 부담/네이버 부하/429 위험 모두 감소.

## 공통 정책

### User-Agent + 헤더

`lib/scrapers/shared.ts` 의 `BASE_HEADERS` 참조. 최신 Chrome 132 (macOS) UA + Referer/sec-ch-ua/Sec-Fetch-* 가 박혀있다 (Vercel/AWS IP 봇 감지 회피용 보강 — flowpick 보다 보수적).

### 요청 정책

- 본문 fetch 사이 **`REQUEST_DELAY_MS = 1500ms`** sleep
- 섹션 간 / 본문 간 모두 순차 (병렬 X)
- 한 기사 실패는 다음으로 넘어감 (전체 cron 안 막음)

### HTML 정제 (공통)

```ts
function cleanContent(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, .ad, .advert, .copyright, .reporter_area').remove();
  return $.root().html() ?? '';
}
```

### 타임존 처리

네이버는 KST(`Asia/Seoul`)로 표시. 저장은 UTC.

```ts
function parseKstToUtc(kstString: string): Date {
  // 예: "2026.04.26. 오전 10:23"
  // → "2026-04-26T10:23:00+09:00" → toUTC
  // 정규식 + Date 생성자 사용 (date-fns-tz 권장)
}
```

---

## Source: NaverGeneral (정치/경제/사회/생활문화/세계/IT)

### 목록 페이지 URL

```
https://news.naver.com/section/{naverSectionId}
```

| 우리 섹션 코드 | 네이버 섹션 ID |
|---|---|
| `POLITICS` | `100` |
| `ECONOMY` | `101` |
| `SOCIETY` | `102` |
| `LIFE` | `103` |
| `WORLD` | `104` |
| `IT` | `105` |

### 목록 페이지 셀렉터

> ⚠️ 네이버는 가끔 클래스명이 변경됨. 다음은 2026-04 기준. 깨지면 DevTools로 재확인.

| 필드 | 셀렉터 |
|---|---|
| 기사 카드 컨테이너 | `.sa_list .sa_item` (또는 유사) |
| 제목 | `.sa_text_title` (텍스트) |
| 링크 | `.sa_text_title` (`href` 속성) |
| 짧은 요약 | `.sa_text_lede` |
| 썸네일 | `.sa_thumb_inner img` (data-src 또는 src) |
| 언론사 | `.sa_text_press` (또는 `meta[property='og:article:author']` fallback) |

> 한 페이지에서 ~100건 가져오기. 네이버는 무한스크롤이라 첫 로드만 처리해도 충분 (V1).

### 상세 페이지 셀렉터

| 필드 | 셀렉터 |
|---|---|
| 본문 HTML | `#dic_area` |
| 언론사 (재확인) | `.media_end_head_top_logo img[alt]` |
| 기자 | `.media_end_head_journalist_name` 첫 줄 |
| 게시 시각 | `.media_end_head_info_datestamp_time` (datetime 속성) |

### source_article_id 추출

URL에서 정규식으로:
```
https://n.news.naver.com/.../{sourcePublisherId}/{sourceArticleId}
→ 예: /00001/0000123456
sourcePublisherId = 00001
sourceArticleId   = 0000123456
```

---

## Source: NaverFinance (해외증시)

### 목록 페이지 URL

```
https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=403
```

> 해외증시는 "경제 → 증권 → 해외증시" 3차 분류. 다른 카테고리와 URL 구조 자체가 다르므로 별도 어댑터.

### 목록 페이지 셀렉터 (V1 시점 미확정)

> ⚠️ V1 7단계(스크래퍼 finance) 진입 시 사용자가 직접 페이지 열어 DevTools로 확정 후 이 표를 갱신.

추정 구조 (실측 후 확정):

| 필드 | 추정 셀렉터 |
|---|---|
| 기사 컨테이너 | `ul.newsList > li` |
| 제목 | `dt.articleSubject > a` |
| 링크 | `dt.articleSubject > a` (`href`) |
| 언론사 | `span.press` |
| 시간 | `span.wdate` |

### 상세 페이지 본문

추정: `div#news_read` 또는 `div.articleCont`

---

## 본문 추출 실패 처리

- 셀렉터 매치 0건 → 그 기사는 스킵 + 로그
- 본문 길이가 100자 미만 → 스킵 (광고/단신 의심)
- 한 섹션에서 50% 이상 실패 → 셀렉터 점검 알람 (V2에서 Sentry 연동)

---

## 차단 회피

### 정상 운영 가이드라인

- 6시간 주기 (cron `0 */6 * * *`) — 네이버에 부담 적음
- 섹션당 ~100건씩만 스크래핑 (전체 ~700건/주기)
- 동시성 = 7 (섹션 단위, 전체 병렬)
- 요청 간 500ms 슬립

### 차단 사례 발생 시 대응 (V2)

- User-Agent 다변화 (3~5개 풀에서 순환)
- 요청 간격 1초로 늘림
- IP 차단이면 Vercel Edge 다른 리전으로 우회 시도

### 차단 history (운영 중 갱신)

| 일자 | 증상 | 원인 추정 | 대응 |
|---|---|---|---|
| (없음) | — | — | — |

---

## 운영 메트릭 (V2에서 추가할 것)

- 섹션별 일일 신규 건수
- 본문 추출 실패율
- 평균 본문 길이
- 셀렉터 매치 실패 알람

---

## 변경 이력

- **2026-04-26**: V1 초기 가이드. NaverFinance 셀렉터는 7단계 구현 시 실측 후 갱신 예정.
