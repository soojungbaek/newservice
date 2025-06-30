# 레퍼럴 링크 생성기

앱 다운로드/설치를 위한 개인 레퍼럴 코드가 포함된 링크를 생성하고 관리하는 웹사이트입니다.

## 🚀 주요 기능

- **사용자 로그인/회원가입**: 이름과 4자리 비밀번호로 간편한 인증
- **레퍼럴 링크 생성**: 12자리 유니크한 레퍼럴 코드가 포함된 다운로드 링크 생성
- **링크 관리**: 기존 링크 조회, 복사, 삭제 기능
- **실적 추적**: 다운로드 수, 설치 수, 보상 금액 실시간 표시
- **소셜미디어 공유**: 유튜브, 인스타그램, 틱톡, 네이버블로그 등에 링크 공유

## 📋 사용자 시나리오

1. **웹사이트 접속**: 사용자가 웹사이트에 접속
2. **로그인**: 이름과 4자리 비밀번호 입력
3. **링크 생성**: 기존 링크가 없으면 새 레퍼럴 링크 생성
4. **링크 공유**: 생성된 링크를 소셜미디어에 공유
5. **실적 확인**: 다운로드 및 설치 실적에 따른 보상 확인

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **스토리지**: LocalStorage (임시), Google Sheets (실제 운영)
- **UI/UX**: 반응형 디자인, 모던 UI
- **아이콘**: Font Awesome

## 📁 프로젝트 구조

```
newservice/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 로직
└── README.md           # 프로젝트 설명서
```

## 🚀 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone [repository-url]
   cd newservice
   ```

2. **로컬 서버 실행**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # 또는 VS Code Live Server 확장 사용
   ```

3. **브라우저에서 접속**
   ```
   http://localhost:8000
   ```

## 📊 구글 스프레드시트 연동

실제 운영을 위해서는 Google Apps Script를 사용하여 구글 스프레드시트와 연동해야 합니다.

### 🚀 Google Apps Script 설정 단계

#### 1. Google Apps Script 프로젝트 생성
1. [Google Apps Script](https://script.google.com/)에 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "레퍼럴 링크 생성기"로 설정

#### 2. 코드 붙여넣기
1. `google-apps-script-example.js` 파일의 내용을 복사
2. Google Apps Script 편집기에 붙여넣기
3. 저장 (Ctrl+S)

#### 3. 스프레드시트 연결
1. Google Sheets에서 새 스프레드시트 생성
2. 스프레드시트 URL 복사
3. Google Apps Script에서 `setupSpreadsheet()` 함수 실행
4. 스프레드시트 ID 입력하여 연결

#### 4. 웹 앱 배포
1. "배포" > "새 배포" 클릭
2. 유형: "웹 앱" 선택
3. 설명: "레퍼럴 링크 생성기 API" 입력
4. 실행: "나" 선택
5. 액세스 권한: "모든 사용자" 선택
6. "배포" 클릭

#### 5. 웹 앱 URL 복사
배포 후 생성된 URL을 복사하여 `script.js`의 `SPREADSHEET_CONFIG.baseUrl`에 설정

### 스프레드시트 구조

#### 1. 사용자 정보 시트 (userdata)
| 컬럼 | 설명 |
|------|------|
| A | 사용자명 |
| B | 비밀번호 (4자리) |
| C | 사용자 ID |
| D | 생성일시 |

#### 2. 링크 정보 시트 (linkdata)
| 컬럼 | 설명 |
|------|------|
| A | 링크 ID |
| B | 사용자 ID |
| C | 레퍼럴 코드 |
| D | 다운로드 URL |
| E | 상태 (active/deleted) |
| F | 다운로드 수 |
| G | 설치 수 |
| H | 보상 금액 |
| I | 생성일시 |

### 🔧 문제 해결

#### "Invalid action" 오류
- Google Apps Script 코드가 올바르게 배포되었는지 확인
- `setupSpreadsheet()` 함수가 실행되었는지 확인
- 스프레드시트가 올바르게 연결되었는지 확인

#### CORS 오류
- Google Apps Script에서 CORS 헤더가 설정되었는지 확인
- 웹 앱 배포 시 액세스 권한이 "모든 사용자"로 설정되었는지 확인

#### API 호출 실패
- 네트워크 연결 확인
- Google Apps Script 할당량 초과 여부 확인
- 스프레드시트 권한 설정 확인

### 📝 테스트 방법

1. **스프레드시트 설정 확인**
   ```javascript
   checkSpreadsheetSetup()
   ```

2. **웹 앱 테스트**
   ```javascript
   testWebApp()
   ```

3. **API 테스트**
   ```javascript
   testAPI()
   ```

### Google Apps Script 설정

```javascript
const SPREADSHEET_CONFIG = {
    baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    useLocalStorage: false  // 실제 운영 시 false로 변경
};
```

## 🎨 주요 화면

### 1. 로그인 화면
- 이름과 4자리 비밀번호 입력
- 새 사용자는 자동으로 회원가입 처리
- 모던하고 직관적인 UI

### 2. 대시보드 화면
- 사용자 정보 표시
- 기존 링크가 있으면 링크 정보 표시
- 링크가 없으면 새 링크 생성 버튼 제공
- 실적 통계 (다운로드, 설치, 보상)

### 3. 링크 관리
- 레퍼럴 코드 표시
- 다운로드 링크 복사 기능
- 링크 삭제 기능 (상태만 'deleted'로 변경)

## 🔧 커스터마이징

### 도메인 변경
`script.js` 파일에서 도메인을 변경할 수 있습니다:

```javascript
const downloadUrl = `www.yourdomain.com/download/${referralCode}`;
```

### 레퍼럴 코드 형식 변경
`generateReferralCode()` 함수를 수정하여 코드 형식을 변경할 수 있습니다.

### UI 테마 변경
`styles.css` 파일에서 색상과 스타일을 수정할 수 있습니다.

## 📱 반응형 디자인

- **데스크톱**: 최적화된 레이아웃
- **태블릿**: 중간 화면에 맞춘 조정
- **모바일**: 터치 친화적 인터페이스

## 🔒 보안 고려사항

- 실제 운영 시에는 HTTPS 사용 필수
- 비밀번호 암호화 처리 필요
- API 키 보안 관리
- CORS 설정 확인

## 🚀 배포

### GitHub Pages
1. GitHub 저장소에 코드 푸시
2. Settings > Pages에서 배포 설정
3. `https://username.github.io/repository-name`으로 접속 가능

### Netlify
1. Netlify에 GitHub 저장소 연결
2. 자동 배포 설정
3. 커스텀 도메인 연결 가능

### Vercel
1. Vercel에 GitHub 저장소 연결
2. 자동 배포 및 CDN 제공
3. 커스텀 도메인 지원

## 📞 지원

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 