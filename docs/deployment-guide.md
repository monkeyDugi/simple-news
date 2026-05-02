# 배포 가이드

## 구조 요약

```
코드 변경 → git push → Vercel 자동 배포 → 웹 + 앱 동시 반영
```

- **웹**: Vercel이 자동으로 빌드/배포
- **앱(Android 웹뷰)**: Vercel 배포만으로 반영됨 — APK 재빌드 불필요
- **APK 재빌드 필요한 경우**: Capacitor 플러그인 추가, `android/` 네이티브 설정 변경

---

## 환경변수 구조

| 파일 | 용도 | Git |
|---|---|---|
| `.env.local` | 로컬 dev (`npm run dev`) | 제외 |
| `.env.production` | Android/프로덕션 빌드 (`npm run cap:sync`) | 제외 |
| Vercel 대시보드 | Vercel 서버 빌드 | — |

**규칙**: 두 파일 모두 gitignore. 시크릿은 절대 커밋 금지.

```
# .env.local (로컬 dev)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
OPENAI_API_KEY=...
CRON_SECRET=...

# .env.production (Android/프로덕션 빌드)
# .env.local 과 동일하되 API URL만 다름
NEXT_PUBLIC_API_BASE_URL=https://news.flowpick.org
NEXT_PUBLIC_SUPABASE_URL=...
# ... 나머지 동일
```

---

## Vercel 배포

```bash
git push origin main   # 자동 배포
```

최초 1회 Vercel 대시보드에서 환경변수 등록 필요:
- `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`, `SUMMARIZE_BATCH_SIZE`

---

## Android 빌드

### 환경 전제조건 (최초 1회)

```bash
# Android SDK 설치
brew install --cask android-commandlinetools
export ANDROID_HOME=$HOME/Library/Android/sdk
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-35" "build-tools;35.0.0"
sdkmanager --sdk_root=$ANDROID_HOME --licenses

# ~/.zshrc 에 추가
export ANDROID_HOME=$HOME/Library/Android/sdk
```

`android/local.properties` 확인 (없으면 생성):
```
sdk.dir=/Users/monkey/Library/Android/sdk
```

### 디버그 APK (테스트용)

```bash
npm run cap:sync                            # 정적 빌드 + 자산 동기화
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 릴리즈 AAB (Play Store 제출용)

**서명 키 설정 (최초 1회)**

```bash
# 키스토어 생성
keytool -genkey -v -keystore simple-news-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias simple-news
```

`android/key.properties` 생성 (gitignore됨):
```
storePassword=키스토어_비밀번호
keyPassword=키_비밀번호
keyAlias=simple-news
storeFile=../simple-news-release.jks
```

> ⚠️ `simple-news-release.jks` 분실 시 앱 업데이트 불가. 반드시 별도 백업.

**빌드**

```bash
npm run cap:sync
cd android && ./gradlew bundleRelease
# AAB 위치: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Play Store 제출

1. `play.google.com/console` → 개발자 등록 ($25 1회)
2. 앱 만들기 → **출시 → 내부 테스트** → AAB 업로드
3. 스토어 등록정보 입력 (제목, 설명, 스크린샷 최소 2장)
4. 내부 테스트로 검증 → 프로덕션 출시

---

## 업데이트 흐름

### 일반 업데이트 (UI/API/기사 로직)
```bash
git push origin main   # 끝
```

### Capacitor 관련 변경 시 (플러그인 추가 등)
```bash
npm run cap:sync
cd android && ./gradlew bundleRelease
# Play Console에 새 AAB 업로드
```
