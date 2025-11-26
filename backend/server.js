import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import fs from 'fs/promises'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

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
    if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. TXT 또는 PDF만 가능합니다.'))
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

    if (req.file.mimetype === 'text/plain') {
      // TXT 파일 처리
      text = req.file.buffer.toString('utf-8')
    } else if (req.file.mimetype === 'application/pdf') {
      // PDF 파일 처리
      const pdfData = await pdfParse(req.file.buffer)
      text = pdfData.text
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
    const errorMessage = error.message || '임베딩 생성 중 오류가 발생했습니다.'
    
    // API 키 관련 에러 처리
    if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
      return res.status(401).json({ error: '유효하지 않은 OpenAI API 키입니다. API 키를 확인해주세요.' })
    }
    
    res.status(500).json({ error: errorMessage })
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
