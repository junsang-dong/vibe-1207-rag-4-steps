# 📚 바이브코딩 RAG 웹앱 - 단계별 문서 이해 도우미

TXT, PDF, MD 파일을 업로드하면 GPT API와 임베딩 API를 활용해 RAG(Retrieval-Augmented Generation) 파이프라인을 실습할 수 있는 웹 애플리케이션입니다.

**리포지토리**: [https://github.com/junsang-dong/vibe-1207-rag-4-steps](https://github.com/junsang-dong/vibe-1207-rag-4-steps)

JUN.VIBE & Cursor / 25.11.26

## 🌟 주요 기능

1. **API 키 입력 및 검증**: OpenAI API 키를 안전하게 입력하고 검증
2. **① 업로드**: TXT, PDF, MD 파일 업로드 및 텍스트 추출
3. **② Chunking**: 문서를 작은 청크로 분할 (크기/중첩 조정 가능)
4. **③ Embedding**: 각 청크를 벡터로 변환
5. **④ Retrieval 테스트**: 질문을 입력하면 관련 청크를 찾아 GPT가 답변 생성

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- OpenAI API 키

### 설치 및 실행

1. **프로젝트 클론**
```bash
git clone https://github.com/junsang-dong/vibe-1207-rag-4-steps.git
cd vibe-1207-rag-4-steps
```

2. **프론트엔드 설정**
```bash
cd frontend
npm install
```

3. **백엔드 설정**
```bash
cd ../backend
npm install
```

4. **환경 변수 설정** (선택사항)

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가할 수 있습니다 (선택사항):

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

> **참고**: 웹앱에서 직접 API 키를 입력할 수 있으므로 환경 변수 설정은 선택사항입니다.

5. **개발 서버 실행**

터미널 1 - 백엔드 서버:
```bash
cd backend
npm run dev
```

터미널 2 - 프론트엔드 서버:
```bash
cd frontend
npm run dev
```

6. **브라우저에서 접속**
- 프론트엔드: http://localhost:5176
- 백엔드 API: http://localhost:3001

## 📁 프로젝트 구조

```
vibe-1207-rag-4-steps/
├── frontend/              # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/    # 컴포넌트들
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── UploadStep.jsx
│   │   │   ├── ChunkingStep.jsx
│   │   │   ├── EmbeddingStep.jsx
│   │   │   └── RetrievalStep.jsx
│   │   ├── utils/         # 유틸리티
│   │   │   ├── apiKey.js  # API 키 관리
│   │   │   └── axios.js   # API 클라이언트
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js    # Vite 설정 (포트: 5176)
│   └── package.json
├── backend/               # Express 백엔드
│   ├── server.js         # API 서버
│   ├── .env              # 환경 변수 (선택사항)
│   └── package.json
├── vercel.json           # Vercel 배포 설정
├── VERCEL_DEPLOY.md      # Vercel 배포 가이드
├── DEPLOYMENT.md         # 배포 가이드
└── README.md
```

## 🔧 기술 스택

### 프론트엔드
- React 19
- Vite
- Axios

### 백엔드
- Express.js
- Multer (파일 업로드)
- pdf-parse (PDF 텍스트 추출)
- OpenAI API (GPT & Embedding)

## 📖 사용 방법

1. **API 키 입력**: 웹앱 시작 시 OpenAI API 키를 입력하고 검증합니다
2. **파일 업로드**: TXT, PDF 또는 MD 파일을 드래그 앤 드롭하거나 클릭하여 업로드
3. **Chunking 설정**: 슬라이더를 사용하여 청크 크기와 중첩 값을 조정하고 결과 확인
4. **Embedding 생성**: 자동으로 임베딩이 생성되고 벡터 스토어가 메모리에 저장됨
5. **검색 및 답변**: 질문을 입력하면 유사한 청크를 찾아 GPT가 답변을 생성

## 🌐 배포

### 로컬 개발 환경

개발 시에는 프론트엔드와 백엔드를 별도로 실행하세요:

**터미널 1 - 백엔드:**
```bash
cd backend
npm install
npm run dev
```

**터미널 2 - 프론트엔드:**
```bash
cd frontend
npm install
npm run dev
```

### Vercel 배포 (권장)

프론트엔드와 백엔드를 함께 Vercel에 배포할 수 있습니다. `vercel.json` 파일에 배포 설정이 포함되어 있습니다.

#### 빠른 배포 방법

1. **Vercel 대시보드에서 배포**
   - [Vercel 대시보드](https://vercel.com/dashboard) 접속
   - "Add New..." → "Project" 클릭
   - GitHub 리포지토리 `junsang-dong/vibe-1207-rag-4-steps` 선택
   - 프로젝트 설정:
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Output Directory**: `frontend/dist`
   - "Deploy" 클릭

2. **Vercel CLI로 배포**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

#### 상세 배포 가이드

자세한 배포 방법과 설정은 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) 파일을 참고하세요.

#### 주요 특징

- 프론트엔드와 백엔드가 함께 배포됩니다
- `/api/*` 경로는 자동으로 서버리스 함수로 라우팅됩니다
- API 키는 클라이언트에서 입력받거나 Vercel 환경 변수로 설정할 수 있습니다

### 환경 변수 설정

**로컬 개발:**
- `backend/.env` 파일에 `OPENAI_API_KEY` 추가 (선택사항)
- 웹앱에서 직접 API 키를 입력할 수 있으므로 필수는 아닙니다

**Vercel 배포:**
- Vercel 대시보드 > Settings > Environment Variables에서 추가 (선택사항)
- `OPENAI_API_KEY`: OpenAI API 키 값
- 설정하지 않아도 클라이언트에서 API 키를 입력받을 수 있습니다

## 🔐 보안

- API 키는 클라이언트에서 입력받아 서버로 전송되며, 서버에서만 OpenAI API 호출에 사용됩니다
- API 키는 브라우저의 로컬 스토리지에 저장되며, 서버에 영구 저장되지 않습니다
- `.env` 파일은 Git에 포함되지 않습니다 (`.gitignore`에 추가됨)
- 프로덕션 환경에서는 HTTPS를 사용하여 API 키 전송을 보호합니다

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 📚 추가 문서

- [Vercel 배포 가이드](./VERCEL_DEPLOY.md) - 상세한 Vercel 배포 방법
- [배포 가이드](./DEPLOYMENT.md) - 다양한 배포 옵션
- [환경 설정 가이드](./ENV_SETUP.md) - 환경 변수 설정 방법

## 🤝 기여

이슈나 개선 사항이 있으면 언제든지 제안해주세요!

## 📝 변경 이력

- **2025.01.07**: 포트를 5176으로 변경, API 키 입력 및 검증 기능 추가, Vercel 배포 설정 업데이트
