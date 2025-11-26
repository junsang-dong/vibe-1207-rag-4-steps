# 배포 가이드

## 빠른 시작 (로컬 개발)

### 1. 저장소 클론 및 설치

```bash
git clone <repository-url>
cd vibe-1126-goorm-rag

# 모든 패키지 설치
npm run install:all
```

### 2. 환경 변수 설정

`backend/.env` 파일 생성:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 3. 개발 서버 실행

**터미널 1 - 백엔드:**
```bash
cd backend
npm run dev
```

**터미널 2 - 프론트엔드:**
```bash
cd frontend
npm run dev
```

### 4. 브라우저에서 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

## Vercel 배포

### 프론트엔드만 Vercel에 배포

1. **Vercel 프로젝트 생성**
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

2. **프로젝트 설정**
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **환경 변수**
   - Vercel 대시보드에서 환경 변수 설정 불필요 (프론트엔드만 배포하는 경우)

### 백엔드 배포 옵션

#### 옵션 1: Railway (권장)

1. [Railway](https://railway.app)에 가입
2. New Project > Deploy from GitHub repo
3. `backend` 폴더 선택
4. 환경 변수 추가:
   - `OPENAI_API_KEY`: your_key
   - `PORT`: 3001
5. 배포 완료 후 URL 확인 (예: `https://your-app.railway.app`)

#### 옵션 2: Render

1. [Render](https://render.com)에 가입
2. New > Web Service
3. GitHub 저장소 연결
4. 설정:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 환경 변수 추가:
   - `OPENAI_API_KEY`: your_key

#### 옵션 3: Heroku

1. [Heroku](https://heroku.com)에 가입
2. New App 생성
3. GitHub 연결 또는 Git 배포
4. 환경 변수 설정:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   ```

### 프론트엔드와 백엔드 연결

백엔드가 별도 URL로 배포된 경우, 프론트엔드의 `vite.config.js`를 수정:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://your-backend-url.railway.app', // 배포된 백엔드 URL
        changeOrigin: true,
      },
    },
  },
})
```

**프로덕션 빌드 시:**

환경 변수를 사용하여 API URL을 동적으로 설정하거나, 빌드 시 백엔드 URL을 하드코딩해야 합니다.

## 환경 변수 체크리스트

### 로컬 개발
- [ ] `backend/.env` 파일 생성
- [ ] `OPENAI_API_KEY` 설정
- [ ] `PORT` 설정 (선택사항, 기본값: 3001)

### 프로덕션 배포
- [ ] 백엔드 서버 환경 변수 설정
  - [ ] `OPENAI_API_KEY`
  - [ ] `PORT` (선택사항)
- [ ] 프론트엔드에서 백엔드 URL 확인
  - [ ] 개발: `http://localhost:3001`
  - [ ] 프로덕션: 배포된 백엔드 URL

## 문제 해결

### "OpenAI API 키가 설정되지 않았습니다" 오류

- `backend/.env` 파일이 올바른 위치에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`OPENAI_API_KEY`)
- 백엔드 서버를 재시작

### CORS 오류

백엔드 서버의 `server.js`에서 CORS 설정 확인:
```javascript
app.use(cors()) // 모든 origin 허용 (프로덕션에서는 특정 origin만 허용 권장)
```

### 파일 업로드 실패

- 파일 크기 제한 확인 (현재 10MB)
- 파일 형식 확인 (TXT, PDF만 지원)
- 백엔드 서버 로그 확인

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
