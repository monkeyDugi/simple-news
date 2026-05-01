# Commit Convention — Simple News

> 이 프로젝트의 Git 커밋 메시지 규칙. Claude가 커밋을 만들 때 반드시 따른다.

---

## 1. 기본 형식

```
<type>: <한글 요약 50자 이내>

- 본문 불릿 1 (한글)
- 본문 불릿 2
- 본문 불릿 3

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### 규칙 요약

| 항목 | 규칙 |
|---|---|
| 제목 언어 | `type`은 영문 소문자, `요약`은 **한글** |
| 제목 길이 | 50자 이내 권장, 최대 72자 |
| 본문 언어 | **한글** |
| 본문 형식 | 불릿 리스트 (`- ` 시작), 각 줄 80자 이내 |
| 제목과 본문 사이 | **빈 줄 1줄** 필수 |
| 마침표 | 제목 끝에 **마침표 없음** |
| Co-Author | Claude가 만든 커밋에는 **항상** 포함 |

---

## 2. 타입 (Conventional Commits)

| type | 용도 | 예시 |
|---|---|---|
| `feat` | 새 기능 추가 | `feat: 네이버 finance 해외증시 스크래퍼 추가` |
| `fix` | 버그 수정 | `fix: cursor 페이지네이션 동시각 기사 누락 수정` |
| `chore` | 빌드/설정/초기화 등 비기능 작업 | `chore: Claude 아키텍처 초기 구축 (Part 1)` |
| `docs` | 문서만 변경 | `docs: api-spec에 cron 엔드포인트 추가` |
| `refactor` | 동작 변경 없는 구조 개선 | `refactor: Scraper 인터페이스로 추상화` |
| `test` | 테스트 추가/수정 | `test: 네이버 셀렉터 변경 회귀 테스트` |
| `style` | 포매팅, 세미콜론 등 (동작 무관) | `style: prettier 포매팅 일괄 적용` |
| `perf` | 성능 개선 | `perf: article 인덱스 추가로 페이지네이션 속도 개선` |
| `build` | 빌드 시스템/패키지 변경 | `build: Next.js 15로 버전 업` |
| `ci` | CI 설정 변경 | `ci: Vercel 프리뷰 배포 환경변수 추가` |

---

## 3. 좋은 예 / 나쁜 예

### ✅ 좋은 예

```
feat: 네이버 일반 6섹션 스크래퍼 추가

- lib/scrapers/naver-general.ts 신설
- cheerio로 #dic_area 본문 추출
- KST → UTC 변환 처리 (date-fns-tz)
- source_article_id UNIQUE 제약으로 중복 방지

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### ❌ 나쁜 예

```
update code                      ← 타입 없음, 의미 없는 요약
```

```
feat: Add scraper.               ← 영어 + 마침표
```

```
feat: 네이버 일반 6섹션 스크래퍼와 finance 스크래퍼 그리고 AI 요약까지 한꺼번에 추가  ← 너무 김 + 여러 기능 섞임
```

---

## 4. 제목 작성 체크리스트

커밋 전에 스스로 물어볼 것:

- [ ] `type:` 을 골랐는가? (feat / fix / chore / docs / refactor / test …)
- [ ] 요약이 **한글**이고 **50자 이내**인가?
- [ ] 제목 끝에 **마침표가 없는가**?
- [ ] 본문이 있다면 제목과 **빈 줄 1줄**로 분리했는가?
- [ ] 본문은 **무엇을 했는지**가 아니라 **왜 했는지**에 집중하는가?
- [ ] Claude가 만든 커밋이면 `Co-Authored-By` 가 있는가?

---

## 5. 특수 케이스

**5-1. WIP (작업 중) 커밋 금지**

`wip:`, `temp:` 등 임시 커밋 타입은 쓰지 않는다. 실험 브랜치에서만 허용되며 main 머지 전 `git rebase -i`로 정리한다.

**5-2. Breaking Change**

호환성을 깨는 변경은 제목 뒤에 `!` 표시 + 본문 하단에 `BREAKING CHANGE:` 블록 추가.

```
feat!: 기사 API 응답 구조 변경

- summary 필드를 별도 객체로 분리

BREAKING CHANGE: 기존 클라이언트는 summary.titleTheme 등을 못 찾음
```

**5-3. 여러 파일 변경**

관련 없는 변경은 **절대 한 커밋에 섞지 않는다**. 예를 들어 "DB 마이그레이션"과 "UI 버그 수정"은 반드시 분리.

**5-4. 단계별 커밋 (Simple News Part 2)**

TODO.md 13단계의 각 단계가 끝날 때마다 한 번씩 커밋한다. 예:

```
chore: 1단계 완료 — Next.js 스캐폴딩
chore: 2단계 완료 — Tailwind + shadcn/ui 세팅
feat: 3단계 — Supabase 스키마 + RLS 구축
feat: 6단계 — 네이버 일반 6섹션 스크래퍼
feat: 8단계 — Gemini 2.5 Flash AI 요약 파이프라인
```

한 단계 안에서도 논리적으로 구분되면 여러 커밋 가능.

---

## 6. Claude에게 커밋을 맡길 때의 동작

사용자가 "커밋해줘" 라고 하면 Claude는 다음 절차를 따른다:

1. `git status` 로 변경사항 확인
2. `git diff` 로 내용 검토
3. 이 문서의 규칙대로 메시지 작성
4. `git add <파일명 명시>` (절대 `git add .` 금지 — 의도치 않은 파일 방지)
5. `git commit -m "..."` 실행
6. 결과를 사용자에게 보고

사용자가 **명시적으로 커밋을 요청할 때만** 커밋한다. 자동으로 커밋을 만들지 않는다.

`.env.local`, `firebase-service-account*.json` 등 시크릿 파일은 절대 add 금지. `.gitignore`로 막혀있지만 이중 검증.
