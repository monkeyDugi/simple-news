# Notification Guide — Simple News

> **상태**: V1 미구현, V2 우선순위 1번. 본 문서는 **V2 로드맵**을 미리 정리한 설계 문서.
>
> 이유: V1은 단순함이 핵심 가치. 알림 정책을 처음부터 잡아두면 나중에 V2 진입 시 바로 구현 가능.

---

## V1: 알림 없음

- 푸시 알림 발송 없음
- FCM 토큰 수집 없음
- 알림 설정 UI 없음

V1 시점에는 사용자가 앱을 직접 열어서 본다.

---

## V2: 데일리 다이제스트 푸시 (기본)

### 정의

매일 KST **07:30** (사용자 변경 가능 — 4개 프리셋), AI가 7섹션에서 **"오늘 출근길에 알아야 할 5건"**을 뽑아 푸시 알림 1개 발송.

### 트리거

```
매일 KST 07:00에 Vercel Cron 실행
  → 전날 0:00 ~ 당일 07:00 사이 수집된 기사들 대상
  → AI에게 "이 중 출근길에 가장 알 가치 있는 5건" 뽑게 함
  → 사용자별 발송 시각 (07:30, 06:30, 08:30, 22:00 중 1) 도래 시 푸시
```

### 푸시 페이로드

```json
{
  "notification": {
    "title": "오늘의 5분 브리핑",
    "body": "{{titleTheme1}} · {{titleTheme2}} · {{titleTheme3}}..."
  },
  "data": {
    "deeplink": "/digest/2026-04-27"
  }
}
```

탭하면 앱 안의 다이제스트 화면(`/digest/{date}`)으로 이동. 5건 카드가 미리 정렬되어 있음.

### 사용자 설정

V2 진입 시 새로 만들 화면:

```
┌──────────────────────────┐
│ 알림 설정                │
├──────────────────────────┤
│                          │
│ 데일리 다이제스트         │
│ ●━━━━━━○ ON              │
│                          │
│ 발송 시간                │
│ ○ 06:30                  │
│ ● 07:30                  │
│ ○ 08:30                  │
│ ○ 22:00 (전날 정리용)    │
│                          │
└──────────────────────────┘
```

---

## V2 인프라

### Capacitor + FCM

```
@capacitor/push-notifications
@capacitor-firebase/messaging
```

설치 후:

1. Firebase 프로젝트 생성 (Cloud Messaging 활성화)
2. `google-services.json` 안드로이드 모듈에 배치
3. 앱 시작 시 FCM 토큰 발급 → `POST /api/devices` 로 등록

### DB 추가 (V2 마이그레이션)

```sql
CREATE TABLE device (
  id              BIGSERIAL PRIMARY KEY,
  fcm_token       VARCHAR(500) UNIQUE NOT NULL,
  preferred_time  CHAR(5) NOT NULL DEFAULT '07:30',  -- '06:30'/'07:30'/'08:30'/'22:00'
  digest_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  installed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_preferred_time
  ON device (preferred_time) WHERE digest_enabled = TRUE;
```

### Cron 추가

```json
{
  "crons": [
    { "path": "/api/cron/digest/build", "schedule": "0 22 * * *" },
    { "path": "/api/cron/digest/send-0630", "schedule": "30 21 * * *" },
    { "path": "/api/cron/digest/send-0730", "schedule": "30 22 * * *" },
    { "path": "/api/cron/digest/send-0830", "schedule": "30 23 * * *" },
    { "path": "/api/cron/digest/send-2200", "schedule": "0 13 * * *" }
  ]
}
```

> Vercel Cron은 UTC 기준. KST 07:30 = UTC 22:30 (하루 빠른 날짜).

### API 추가

| 메서드 | 경로 | 용도 |
|---|---|---|
| POST | `/api/devices` | FCM 토큰 등록 |
| PATCH | `/api/devices/{id}` | 발송 시간/ON·OFF 변경 |
| POST | `/api/cron/digest/build` | 다음 날 다이제스트 5건 사전 생성 |
| POST | `/api/cron/digest/send-{HHMM}` | 시간대별 일괄 푸시 |

---

## V2 추가 후보 (우선순위)

### 1. 속보 푸시 (보류)

- 트리거: FOMC, CPI, 금리 키워드 매칭 / 환율 폭락
- 문제: "중요"의 정의가 어렵고 알림 피로 누적 가능
- → V2에서 일단 보류. V3에서 데이터 축적 후 결정.

### 2. 마켓 마감 요약 (보류)

- 트리거: 미국장 마감 후 (KST 07:00)
- 콘텐츠: 다우/S&P/나스닥 + 절대 변동 큰 종목
- 문제: 별도 시세 데이터 소스 필요 (Yahoo Finance API 등)
- → V3 이후

### 3. 관심종목 키워드 (V3)

- 사용자가 "삼성전자, 엔비디아" 등 등록
- 매칭 시 즉시 푸시
- 문제: 로그인이 필요해짐 (디바이스 단위 vs 사용자 단위)
- → V3

---

## 알림 윤리 가이드

- **하루 최대 1건** (다이제스트만)
- 사용자가 OFF하면 즉시 발송 중단
- 콘텐츠는 절대 광고/프로모션 안 섞음
- 푸시 텍스트에 부정·자극적 표현 자제 (예: "충격", "경악" 금지)

---

## 변경 이력

- **2026-04-26**: V2 로드맵 초안 (V1 시점에 미리 정리)
