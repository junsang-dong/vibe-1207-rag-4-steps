# 📚 바이브코딩 RAG 웹앱 - 단계별 문서 이해 도우미

TXT, PDF 파일을 업로드하면 GPT API와 임베딩 API를 활용해 RAG(Retrieval-Augmented Generation) 파이프라인을 실습할 수 있는 웹 애플리케이션입니다.
JUN.VIBE & Cursor / 25.11.26

## 🌟 주요 기능

1. **① 업로드**: TXT, PDF 파일 업로드 및 텍스트 추출
2. **② Chunking**: 문서를 작은 청크로 분할 (크기/중첩 조정 가능)
3. **③ Embedding**: 각 청크를 벡터로 변환
4. **④ Retrieval 테스트**: 질문을 입력하면 관련 청크를 찾아 GPT가 답변 생성

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- OpenAI API 키

### 설치 및 실행

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd vibe-1126-goorm-rag
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
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

## 📁 프로젝트 구조

```
vibe-1126-goorm-rag/
├── frontend/              # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/    # 컴포넌트들
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── UploadStep.jsx
│   │   │   ├── ChunkingStep.jsx
│   │   │   ├── EmbeddingStep.jsx
│   │   │   └── RetrievalStep.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/               # Express 백엔드
│   ├── server.js         # API 서버
│   ├── .env              # 환경 변수 (생성 필요)
│   └── package.json
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

1. **파일 업로드**: TXT 또는 PDF 파일을 드래그 앤 드롭하거나 클릭하여 업로드
2. **Chunking 설정**: 슬라이더를 사용하여 청크 크기와 중첩 값을 조정하고 결과 확인
3. **Embedding 생성**: 자동으로 임베딩이 생성되고 벡터 스토어가 메모리에 저장됨
4. **검색 및 답변**: 질문을 입력하면 유사한 청크를 찾아 GPT가 답변을 생성

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

#### 방법 1: 프론트엔드만 Vercel에 배포 + 백엔드는 별도 서버

1. **프론트엔드 배포**
   - Vercel에 GitHub 저장소 연결
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: 없음 (백엔드에서 처리)

2. **백엔드 배포** (Railway, Render, Heroku 등)
   - 별도 서버에 Express 앱 배포
   - 환경 변수: `OPENAI_API_KEY` 설정
   - 프론트엔드의 `vite.config.js`에서 프록시 URL 변경

#### 방법 2: Vercel 서버리스 함수 사용

Vercel의 서버리스 함수를 사용하려면 `backend/server.js`를 `api/` 폴더의 함수들로 변환해야 합니다.

더 자세한 내용은 [Vercel 문서](https://vercel.com/docs)를 참고하세요.

### 환경 변수 설정

**로컬 개발:**
- `backend/.env` 파일에 `OPENAI_API_KEY` 추가

**Vercel 배포:**
- Vercel 대시보드 > Settings > Environment Variables에서 추가
- `OPENAI_API_KEY`: OpenAI API 키 값

## 🔐 보안

- API 키는 서버에서만 사용되며 클라이언트에 노출되지 않습니다
- `.env` 파일은 Git에 포함되지 않습니다 (`.gitignore`에 추가됨)

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🤝 기여

이슈나 개선 사항이 있으면 언제든지 제안해주세요!
