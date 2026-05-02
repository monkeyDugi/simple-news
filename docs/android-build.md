# Android 빌드 가이드

## 환경 전제조건

| 항목 | 확인 명령 | 비고 |
|---|---|---|
| Android SDK | `ls ~/Library/Android/sdk` | 없으면 아래 CLI 설치 참고 |
| adb | `which adb` | platform-tools에 포함 |
| NEXT_PUBLIC_API_BASE_URL | `grep NEXT_PUBLIC_API_BASE_URL .env.local` | Vercel 도메인이어야 함 (localhost X) |

---

## 최초 1회 설정

### 1. Android SDK CLI 설치

```bash
brew install --cask android-commandlinetools

export ANDROID_HOME=$HOME/Library/Android/sdk

sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-35" "build-tools;35.0.0"
sdkmanager --sdk_root=$ANDROID_HOME --licenses
```

`~/.zshrc`에도 추가:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### 2. local.properties 확인

`android/local.properties` 파일에 아래 내용이 있어야 함:
```
sdk.dir=/Users/monkey/Library/Android/sdk
```

없으면 직접 생성.

### 3. android/ 폴더 생성

```bash
npx cap add android   # android/ 폴더가 없을 때만
```

---

## 빌드 & 설치

```bash
# 1. 정적 빌드 + android 자산 동기화
npm run cap:sync

# 2. APK 빌드
cd android
./gradlew assembleDebug

# APK 위치: android/app/build/outputs/apk/debug/app-debug.apk

# 3. 실기기 설치 (USB 연결 + USB 디버깅 ON)
adb devices
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 주의사항

### CORS
`next.config.ts`에 `/api/*` CORS 헤더(`Access-Control-Allow-Origin: *`) 설정됨.
Capacitor 웹뷰는 `https://localhost` origin으로 API를 호출하기 때문에 필요.
이 API는 인증 없는 공개 데이터라 `*` 와일드카드 사용이 적절함.

### 배포 흐름
- **UI/로직/API 변경** → `git push` → Vercel 자동 배포만으로 앱에 반영됨
- **APK 재빌드가 필요한 경우**: Capacitor 플러그인 추가, `android/` 네이티브 설정 변경

### .env.local API URL
정적 빌드 시점에 URL이 JS 번들에 박힘. 빌드 전 반드시 Vercel 프로덕션 도메인으로 설정되어 있어야 함.
