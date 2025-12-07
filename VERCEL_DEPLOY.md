# Vercel 배포 가이드

이 가이드는 RAG 웹앱을 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

1. [Vercel](https://vercel.com) 계정 생성 (GitHub 계정으로 로그인 권장)
2. GitHub 리포지토리에 코드가 푸시되어 있어야 합니다

## 배포 방법

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - "Add New..." → "Project" 클릭

2. **GitHub 리포지토리 연결**
   - "Import Git Repository"에서 `junsang-dong/vibe-1207-rag-4-steps` 선택
   - 또는 리포지토리 URL 입력: `https://github.com/junsang-dong/vibe-1207-rag-4-steps`

3. **프로젝트 설정**
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `./` (루트 디렉토리)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm run install:all` (또는 자동 감지)

4. **환경 변수 설정** (선택사항)
   - Vercel 대시보드의 "Settings" → "Environment Variables"에서 설정
   - `OPENAI_API_KEY`: OpenAI API 키 (백엔드에서 사용, 선택사항)
   - 참고: 클라이언트에서 API 키를 입력받는 방식이므로 필수는 아닙니다

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포가 완료되면 자동으로 URL이 생성됩니다 (예: `https://your-app.vercel.app`)

### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **프로젝트 디렉토리에서 배포**
   ```bash
   cd /Users/junsangdong/Desktop/vibe-1207-rag-4-steps
   vercel
   ```

3. **CLI 질문에 답변**
   - "Set up and deploy?": Y
   - "Which scope?": 본인의 계정 선택
   - "Link to existing project?": N (새 프로젝트)
   - "What's your project's name?": 원하는 프로젝트 이름 입력
   - "In which directory is your code located?": `./`
   - "Want to override the settings?": Y
     - Build Command: `cd frontend && npm install && npm run build`
     - Output Directory: `frontend/dist`
     - Install Command: `npm run install:all`

4. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## 배포 후 확인사항

### 1. 프론트엔드 확인
- 배포된 URL로 접속하여 웹앱이 정상적으로 로드되는지 확인
- 예: `https://your-app.vercel.app`

### 2. API 엔드포인트 확인
- Vercel은 자동으로 `/api/*` 경로를 백엔드 서버리스 함수로 라우팅합니다
- 헬스 체크: `https://your-app.vercel.app/api/health`
- 정상 응답: `{"status":"ok"}`

### 3. 기능 테스트
- API 키 입력 및 검증
- 파일 업로드
- 청킹, 임베딩, 검색 기능 테스트

## Vercel 설정 상세

### vercel.json 구조

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

### 라우팅 설명

- `/api/*`: 모든 API 요청은 `backend/server.js`로 라우팅되어 서버리스 함수로 실행됩니다
- `/*`: 그 외 모든 요청은 프론트엔드 빌드 결과물(`frontend/dist`)에서 제공됩니다

## 주의사항

### 1. 서버리스 함수 제한
- Vercel의 서버리스 함수는 실행 시간 제한이 있습니다 (무료 플랜: 10초, Pro: 60초)
- 큰 파일 처리나 긴 작업은 타임아웃이 발생할 수 있습니다
- 필요시 Vercel Pro 플랜 업그레이드 고려

### 2. 환경 변수
- `OPENAI_API_KEY`는 Vercel 환경 변수로 설정할 수 있지만, 현재 앱은 클라이언트에서 입력받는 방식을 사용합니다
- 서버에서 기본 API 키를 사용하려면 Vercel 환경 변수에 설정하세요

### 3. 파일 크기 제한
- Vercel 서버리스 함수의 요청 크기 제한: 4.5MB (무료 플랜)
- 현재 앱의 파일 업로드 제한: 10MB
- 큰 파일 업로드 시 문제가 발생할 수 있으므로, 필요시 파일 크기 제한을 조정하세요

### 4. CORS 설정
- 백엔드의 CORS 설정이 모든 origin을 허용하도록 되어 있습니다
- 프로덕션에서는 특정 도메인만 허용하도록 수정하는 것을 권장합니다

## 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   - Vercel 대시보드의 "Deployments" 탭에서 빌드 로그 확인
   - 에러 메시지 확인 및 수정

2. **의존성 문제**
   ```bash
   # 로컬에서 빌드 테스트
   cd frontend
   npm install
   npm run build
   ```

3. **경로 문제**
   - `vercel.json`의 경로 설정 확인
   - `outputDirectory`가 올바른지 확인

### API 요청 실패 시

1. **서버리스 함수 로그 확인**
   - Vercel 대시보드의 "Functions" 탭에서 로그 확인

2. **환경 변수 확인**
   - Vercel 대시보드의 "Settings" → "Environment Variables" 확인

3. **네트워크 확인**
   - 브라우저 개발자 도구의 Network 탭에서 요청 상태 확인

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel 서버리스 함수 가이드](https://vercel.com/docs/functions)
- [Vite + Vercel 배포 가이드](https://vercel.com/guides/deploying-vite)

## 업데이트 배포

코드를 수정한 후 다시 배포하려면:

1. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "업데이트 내용"
   git push origin main
   ```

2. **자동 배포**
   - Vercel이 GitHub와 연결되어 있으면 자동으로 재배포됩니다
   - 또는 Vercel 대시보드에서 "Redeploy" 클릭

3. **수동 배포 (CLI)**
   ```bash
   vercel --prod
   ```

