# 환경 변수 설정 가이드

## 백엔드 환경 변수 설정

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### OpenAI API 키 발급 방법

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴로 이동
4. "Create new secret key" 버튼 클릭
5. 생성된 키를 복사하여 `.env` 파일에 붙여넣기

**주의**: API 키는 절대 공개하지 마세요!

## Vercel 배포 시 환경 변수 설정

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Environment Variables 메뉴로 이동
3. 다음 환경 변수 추가:
   - `OPENAI_API_KEY`: OpenAI API 키 값

## 환경 변수 확인

백엔드 서버를 실행하면 콘솔에 API 키 설정 여부가 표시됩니다:

```
🚀 서버가 포트 3001에서 실행 중입니다.
📝 OpenAI API 키: 설정됨
```

또는

```
🚀 서버가 포트 3001에서 실행 중입니다.
📝 OpenAI API 키: 설정 안됨
```
