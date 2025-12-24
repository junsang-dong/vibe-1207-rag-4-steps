# 📚 RAG Studio - RAG(Retrieval-Augmented Generation) 교육용 웹 애플리케이션

RAG의 작동 방식을 Chunking, Embedding, Retrieval 단계별로 보여주는 교육용앱입니다.

TXT, PDF, MD 파일을 업로드하면 GPT API와 임베딩 API를 활용해 RAG(Retrieval-Augmented Generation) 파이프라인을 실습할 수 있는 웹 애플리케이션입니다.

**리포지토리**: [https://github.com/junsang-dong/vibe_1224_rag_studio_edu](https://github.com/junsang-dong/vibe_1224_rag_studio_edu)

## 🌟 주요 기능

1. **① 업로드 & 파싱**: TXT, PDF, MD 파일 업로드 및 텍스트 추출
2. **② 청킹**: 문서를 작은 청크로 분할 (크기/중첩 조정 가능)
3. **③ 임베딩**: 각 청크를 벡터로 변환하여 벡터 스토어 생성
4. **④ 검색 & 답변**: 질문을 입력하면 관련 청크를 찾아 GPT가 답변 생성
5. **RAG 보고서 다운로드**: 전체 프로세스를 마크다운 형식으로 다운로드

## 🎨 디자인 특징

- **스플릿 뷰 레이아웃**: 왼쪽 사이드바 네비게이션 + 오른쪽 메인 콘텐츠 영역
- **네이비 블루 테마**: 일관된 네이비 블루 컬러 스킴 적용
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **세션 관리**: 세션 내보내기 및 초기화 기능

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

4. **환경 변수 설정**

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

> **중요**: API 키는 서버 레벨에서 관리됩니다. `.env` 파일에 설정된 API 키가 사용됩니다.

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
- 프론트엔드: http://localhost:5183
- 백엔드 API: http://localhost:3001

## 📁 프로젝트 구조

```
vibe_1224_rag_studio1/
├── frontend/              # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/    # 컴포넌트들
│   │   │   ├── StepIndicator.jsx    # 단계별 네비게이션
│   │   │   ├── UploadStep.jsx       # 파일 업로드
│   │   │   ├── ChunkingStep.jsx     # 텍스트 청킹
│   │   │   ├── EmbeddingStep.jsx    # 임베딩 생성
│   │   │   └── RetrievalStep.jsx    # 검색 및 답변
│   │   ├── utils/         # 유틸리티
│   │   │   └── axios.js  # API 클라이언트
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js    # Vite 설정 (포트: 5183)
│   └── package.json
├── backend/               # Express 백엔드 (로컬 개발용)
│   ├── server.js         # API 서버
│   ├── .env              # 환경 변수
│   └── package.json
├── api/                   # Vercel 서버리스 함수
│   └── index.js          # API 엔드포인트
├── vercel.json           # Vercel 배포 설정
├── VERCEL_DEPLOY.md      # Vercel 배포 가이드
├── DEPLOYMENT.md         # 배포 가이드
├── ENV_SETUP.md          # 환경 변수 설정 가이드
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

1. **파일 업로드**: TXT, PDF 또는 MD 파일을 드래그 앤 드롭하거나 클릭하여 업로드
2. **청킹 설정**: 슬라이더를 사용하여 청크 크기와 중첩 값을 조정하고 결과 확인
3. **임베딩 생성**: 자동으로 임베딩이 생성되고 벡터 스토어가 메모리에 저장됨
4. **검색 및 답변**: 질문을 입력하면 유사한 청크를 찾아 GPT가 답변을 생성
5. **보고서 다운로드**: GPT 답변 아래의 "RAG 보고서 다운로드" 버튼을 클릭하여 전체 프로세스를 마크다운 형식으로 다운로드

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
   - GitHub 리포지토리 `junsang-dong/vibe_1224_rag_studio_edu` 선택
   - 프로젝트 설정:
     - **Framework Preset**: Vite (자동 감지)
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Output Directory**: `frontend/dist`
     - **Install Command**: `npm install && cd frontend && npm install && cd ../backend && npm install`
   - 환경 변수 설정:
     - `OPENAI_API_KEY`: OpenAI API 키 값
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
- `/api/*` 경로는 자동으로 서버리스 함수(`api/index.js`)로 라우팅됩니다
- API 키는 Vercel 환경 변수로 설정하여 서버에서 관리됩니다
- 서버리스 함수 최대 실행 시간: 60초 (Pro 플랜)

### 환경 변수 설정

**로컬 개발:**
- `backend/.env` 파일에 `OPENAI_API_KEY` 추가 (필수)
- `PORT=3001` (기본값: 3001)

**Vercel 배포:**
- Vercel 대시보드 > Settings > Environment Variables에서 추가 (필수)
- `OPENAI_API_KEY`: OpenAI API 키 값
- 프로덕션, 프리뷰, 개발 환경 모두에 설정

## 🔐 보안

- **서버 레벨 API 키 관리**: API 키는 서버의 환경 변수에서 관리되며, 클라이언트에 노출되지 않습니다
- `.env` 파일은 Git에 포함되지 않습니다 (`.gitignore`에 추가됨)
- 프로덕션 환경에서는 HTTPS를 사용하여 통신을 보호합니다
- 모든 API 요청은 서버를 통해 처리되며, 클라이언트는 직접 OpenAI API를 호출하지 않습니다

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 📚 추가 문서

- [Vercel 배포 가이드](./VERCEL_DEPLOY.md) - 상세한 Vercel 배포 방법
- [배포 가이드](./DEPLOYMENT.md) - 다양한 배포 옵션
- [환경 설정 가이드](./ENV_SETUP.md) - 환경 변수 설정 방법

## 📝 변경 이력

- **2024.12.24**: 
  - 스플릿 뷰 레이아웃 및 네이비 블루 테마 적용
  - 서버 레벨 API 키 관리로 변경 (클라이언트 입력 UI 제거)
  - 세션 내보내기/초기화 기능 추가
  - RAG 보고서 다운로드 기능 추가 (.md 형식)
  - 포트 변경 (5183)
  - 반응형 디자인 개선
