import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import fs from 'fs/promises'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env 파일 경로 명시적으로 지정
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001

// OpenAI 클라이언트 생성 헬퍼 함수
const createOpenAIClient = (apiKey) => {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  })
}

// 기본 OpenAI 클라이언트 (환경 변수에서)
const defaultOpenAI = createOpenAIClient()

// 미들웨어 설정
app.use(cors())
app.use(express.json({ limit: '50mb' })) // 큰 문서 처리 위해 크기 제한 증가
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'text/plain',
      'application/pdf',
      'text/markdown',
      'text/x-markdown',
      'application/octet-stream' // 일부 브라우저에서 MD 파일을 이 타입으로 보낼 수 있음
    ]
    const allowedExtensions = ['.txt', '.pdf', '.md']
    const fileName = file.originalname.toLowerCase()
    
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype)
    
    // 디버깅을 위한 로그
    console.log('File upload attempt:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      hasValidExtension,
      hasValidMimeType
    })
    
    // 확장자 체크를 우선시 (MIME 타입이 부정확할 수 있음)
    if (hasValidExtension) {
      cb(null, true)
    } else if (hasValidMimeType) {
      cb(null, true)
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. TXT, PDF 또는 MD만 가능합니다.'))
    }
  },
})

// 파일 업로드 및 텍스트 추출
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' })
    }

    let text = ''
    const fileName = req.file.originalname.toLowerCase()
    const isMarkdown = fileName.endsWith('.md') || 
                      req.file.mimetype === 'text/markdown' || 
                      req.file.mimetype === 'text/x-markdown' ||
                      (req.file.mimetype === 'application/octet-stream' && fileName.endsWith('.md'))

    // 확장자 기반으로 파일 타입 판단 (MIME 타입이 부정확할 수 있음)
    if (fileName.endsWith('.pdf')) {
      // PDF 파일 처리
      const pdfData = await pdfParse(req.file.buffer)
      text = pdfData.text
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || 
               req.file.mimetype === 'text/plain' || isMarkdown) {
      // TXT 또는 MD 파일 처리
      text = req.file.buffer.toString('utf-8')
    } else {
      return res.status(400).json({ error: '지원하지 않는 파일 형식입니다. TXT, PDF 또는 MD만 가능합니다.' })
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '파일에서 텍스트를 추출할 수 없습니다.' })
    }

    // 텍스트 크기 제한 (10MB)
    const maxTextLength = 10 * 1024 * 1024
    if (text.length > maxTextLength) {
      return res.status(400).json({ 
        error: `파일이 너무 큽니다. 최대 ${(maxTextLength / 1024 / 1024).toFixed(1)}MB까지 지원됩니다. 현재 크기: ${(text.length / 1024 / 1024).toFixed(2)}MB` 
      })
    }

    res.json({ text })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message || '파일 처리 중 오류가 발생했습니다.' })
  }
})

// Chunking API
app.post('/api/chunk', async (req, res) => {
  try {
    const { text, chunkSize = 500, overlap = 100 } = req.body

    if (!text) {
      return res.status(400).json({ error: '텍스트가 제공되지 않았습니다.' })
    }

    // 텍스트 크기 검증
    if (typeof text !== 'string') {
      return res.status(400).json({ error: '텍스트 형식이 올바르지 않습니다.' })
    }

    const textLength = text.length
    if (textLength === 0) {
      return res.status(400).json({ error: '텍스트가 비어있습니다.' })
    }

    // 청크 크기와 중첩 값 검증
    const validChunkSize = Math.max(100, Math.min(2000, parseInt(chunkSize) || 500))
    const validOverlap = Math.max(0, Math.min(validChunkSize - 1, parseInt(overlap) || 100))

    // 메모리 효율적인 청킹
    const chunks = []
    let start = 0
    const maxChunks = 10000 // 최대 청크 수 제한 (메모리 보호)

    while (start < textLength && chunks.length < maxChunks) {
      const end = Math.min(start + validChunkSize, textLength)
      
      // slice()가 for 루프보다 훨씬 효율적
      const chunk = text.slice(start, end).trim()

      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      // 다음 청크 시작 위치 계산 (중첩 고려)
      const nextStart = end - validOverlap
      if (nextStart <= start) {
        // 무한 루프 방지: 중첩이 청크 크기보다 크거나 같은 경우
        start = end
      } else {
        start = nextStart
      }

      if (start >= textLength) break
    }

    if (chunks.length >= maxChunks) {
      console.warn(`청크 수가 최대값(${maxChunks})에 도달했습니다. 일부 텍스트가 누락되었을 수 있습니다.`)
    }

    res.json({ chunks })
  } catch (error) {
    console.error('Chunking error:', error)
    const errorMessage = error.message || '청킹 중 오류가 발생했습니다.'
    
    // 메모리 부족 에러인 경우 특별 처리
    if (errorMessage.includes('heap') || errorMessage.includes('memory')) {
      return res.status(500).json({ 
        error: '문서가 너무 큽니다. 더 작은 파일을 사용하거나 청크 크기를 줄여주세요.' 
      })
    }
    
    res.status(500).json({ error: errorMessage })
  }
})

// Embedding API
app.post('/api/embed', async (req, res) => {
  try {
    const { chunks } = req.body

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: '청크가 제공되지 않았습니다.' })
    }

    // 헤더에서 API 키 가져오기 (클라이언트에서 보낸 키)
    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API 키가 제공되지 않았습니다. 1단계에서 API 키를 입력해주세요.' })
    }

    // 동적으로 OpenAI 클라이언트 생성
    const openaiClient = createOpenAIClient(apiKey)

    // OpenAI Embedding API 호출
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks,
    })

    const embeddings = response.data.map((item) => item.embedding)

    res.json({ embeddings })
  } catch (error) {
    console.error('Embedding error:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    })
    
    const errorMessage = error.message || '임베딩 생성 중 오류가 발생했습니다.'
    const errorStatus = error.status || error.response?.status || 500
    
    // API 키 관련 에러 처리
    if (errorMessage.toLowerCase().includes('api key') || 
        errorMessage.toLowerCase().includes('authentication') ||
        errorMessage.toLowerCase().includes('invalid') ||
        errorStatus === 401 || errorStatus === 403) {
      return res.status(401).json({ 
        error: '유효하지 않은 OpenAI API 키입니다. API 키를 확인해주세요.',
        details: errorMessage
      })
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data || error.message
    })
  }
})

// Query API (RAG)
app.post('/api/query', async (req, res) => {
  try {
    const { query, context } = req.body

    if (!query) {
      return res.status(400).json({ error: '질문이 제공되지 않았습니다.' })
    }

    if (!context) {
      return res.status(400).json({ error: '컨텍스트가 제공되지 않았습니다.' })
    }

    // 헤더에서 API 키 가져오기 (클라이언트에서 보낸 키)
    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API 키가 제공되지 않았습니다. 1단계에서 API 키를 입력해주세요.' })
    }

    // 동적으로 OpenAI 클라이언트 생성
    const openaiClient = createOpenAIClient(apiKey)

    // GPT API 호출 (RAG)
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 주어진 문서 내용을 바탕으로 질문에 답변하는 도우미입니다. 문서의 내용을 기반으로 정확하고 도움이 되는 답변을 제공하세요.',
        },
        {
          role: 'user',
          content: `다음 문서 내용을 참고하여 질문에 답변해주세요:\n\n문서 내용:\n${context}\n\n질문: ${query}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const answer = completion.choices[0].message.content

    res.json({ answer })
  } catch (error) {
    console.error('Query error:', error)
    const errorMessage = error.message || '답변 생성 중 오류가 발생했습니다.'
    
    // API 키 관련 에러 처리
    if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
      return res.status(401).json({ error: '유효하지 않은 OpenAI API 키입니다. API 키를 확인해주세요.' })
    }
    
    res.status(500).json({ error: errorMessage })
  }
})

// 키워드 추출 API
app.post('/api/extract-keywords', async (req, res) => {
  try {
    const { chunks } = req.body

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: '청크가 제공되지 않았습니다.' })
    }

    // 모든 청크를 하나의 텍스트로 합치기
    const fullText = chunks.join(' ').toLowerCase()

    // 한국어 불용어 목록
    const koreanStopWords = [
      '이', '가', '을', '를', '에', '의', '와', '과', '은', '는', '도', '로', '으로',
      '에서', '에게', '께', '한테', '더', '많이', '있다', '없다', '하다', '되다', '이다',
      '그', '그것', '이것', '저것', '그런', '이런', '저런', '그렇게', '이렇게', '저렇게',
      '때', '경우', '것', '수', '것', '등', '및', '또한', '또', '그리고', '하지만', '그러나'
    ]

    // 영어 불용어 목록
    const englishStopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
      'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there',
      'what', 'which', 'who', 'when', 'where', 'why', 'how', 'can', 'cannot'
    ]

    const allStopWords = [...koreanStopWords, ...englishStopWords]

    // 단어 추출 (한글, 영문, 숫자 포함, 최소 2글자 이상)
    const words = fullText.match(/[가-힣a-zA-Z0-9]{2,}/g) || []

    // 단어 빈도 계산
    const wordFreq = {}
    words.forEach(word => {
      if (!allStopWords.includes(word) && word.length >= 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })

    // 빈도순으로 정렬하고 상위 5개 선택
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)

    res.json({ keywords: sortedWords })
  } catch (error) {
    console.error('Keyword extraction error:', error)
    res.status(500).json({ error: error.message || '키워드 추출 중 오류가 발생했습니다.' })
  }
})

// API 키 유효성 검증
app.post('/api/validate-key', async (req, res) => {
  try {
    const apiKey = req.headers['x-openai-api-key'] || req.body.apiKey

    if (!apiKey) {
      return res.status(400).json({ 
        valid: false, 
        message: 'API 키가 제공되지 않았습니다.' 
      })
    }

    // 간단한 형식 검증
    if (!apiKey.startsWith('sk-')) {
      return res.json({ 
        valid: false, 
        message: 'API 키 형식이 올바르지 않습니다. (sk-로 시작해야 합니다)' 
      })
    }

    // 실제 OpenAI API 호출로 검증 (가장 가벼운 임베딩 요청)
    const openaiClient = createOpenAIClient(apiKey)
    
    try {
      // 매우 작은 텍스트로 임베딩 요청하여 API 키 검증
      await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'test',
      })
      
      res.json({ 
        valid: true, 
        message: '유효한 키입니다.' 
      })
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || ''
      const errorType = error.status || error.response?.status
      
      // 401, 403 등의 인증 오류
      if (errorType === 401 || errorType === 403) {
        return res.json({ 
          valid: false, 
          message: '유효하지 않은 API 키입니다.' 
        })
      }
      
      // API 키 관련 에러 메시지
      if (errorMessage.includes('api key') || 
          errorMessage.includes('authentication') || 
          errorMessage.includes('invalid') ||
          errorMessage.includes('incorrect')) {
        return res.json({ 
          valid: false, 
          message: '유효하지 않은 API 키입니다.' 
        })
      }
      
      // 기타 오류 (네트워크 오류 등)
      console.error('Validation API error:', error.message)
      return res.json({ 
        valid: false, 
        message: 'API 키 검증 중 오류가 발생했습니다. 네트워크를 확인해주세요.' 
      })
    }
  } catch (error) {
    console.error('Key validation error:', error)
    res.status(500).json({ 
      valid: false, 
      message: 'API 키 검증 중 오류가 발생했습니다.' 
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`📝 OpenAI API 키: ${process.env.OPENAI_API_KEY ? '환경 변수에서 설정됨 (클라이언트 API 키도 사용 가능)' : '환경 변수에 없음 (클라이언트에서 제공 필요)'}`)
})
