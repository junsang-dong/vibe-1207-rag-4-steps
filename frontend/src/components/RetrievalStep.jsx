import { useState, useEffect } from 'react'
import apiClient from '../utils/axios'
import './StepContent.css'

function RetrievalStep({ vectorStore, chunks, file, text, chunkConfig, embeddings, onBack }) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [answer, setAnswer] = useState('')
  const [keywords, setKeywords] = useState([])
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false)

  const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  const handleSearch = async () => {
    if (!query.trim() || !vectorStore || vectorStore.length === 0) return

    setIsSearching(true)
    setSearchResults(null)
    setAnswer('')

    try {
      // 쿼리 임베딩 생성
      const queryEmbeddingResponse = await apiClient.post('/api/embed', {
        chunks: [query],
      })

      const queryEmbedding = queryEmbeddingResponse.data.embeddings[0]

      // 유사도 계산
      const similarities = vectorStore.map((item) => ({
        ...item,
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }))

      // 유사도 순으로 정렬
      similarities.sort((a, b) => b.similarity - a.similarity)

      // 상위 3개 선택
      const topChunks = similarities.slice(0, 3)
      setSearchResults(topChunks)

      // GPT API를 통해 답변 생성
      const context = topChunks.map((chunk) => chunk.text).join('\n\n')

      const answerResponse = await apiClient.post('/api/query', {
        query,
        context,
      })

      setAnswer(answerResponse.data.answer)
      setIsSearching(false)
    } catch (err) {
      console.error('Search error:', err)
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  // 키워드 추출
  useEffect(() => {
    const extractKeywords = async () => {
      if (!chunks || chunks.length === 0) return

      setIsLoadingKeywords(true)
      try {
        const response = await apiClient.post('/api/extract-keywords', {
          chunks,
        })
        setKeywords(response.data.keywords || [])
      } catch (err) {
        console.error('Keyword extraction error:', err)
        setKeywords([])
      } finally {
        setIsLoadingKeywords(false)
      }
    }

    extractKeywords()
  }, [chunks])

  const handleKeywordClick = (keyword) => {
    setQuery(keyword)
  }

  const generateReport = () => {
    const report = []
    
    // 헤더
    report.push('# RAG 프로세스 보고서\n')
    report.push(`**생성 일시**: ${new Date().toLocaleString('ko-KR')}\n`)
    report.push('---\n')
    
    // 1단계: 업로드 & 파싱
    report.push('## ① 업로드 & 파싱\n')
    if (file) {
      report.push(`**파일명**: ${file.name}`)
      report.push(`**파일 크기**: ${(file.size / 1024).toFixed(2)} KB\n`)
    }
    if (text) {
      report.push(`**추출된 텍스트 길이**: ${text.length.toLocaleString()}자\n`)
      report.push('**추출된 텍스트 미리보기**:\n')
      report.push('```')
      report.push(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
      report.push('```\n')
    }
    report.push('---\n')
    
    // 2단계: 청킹
    report.push('## ② 청킹\n')
    if (chunkConfig) {
      report.push(`**청크 크기**: ${chunkConfig.chunkSize}자`)
      report.push(`**중첩 크기**: ${chunkConfig.overlap}자\n`)
    }
    if (chunks && chunks.length > 0) {
      report.push(`**생성된 청크 수**: ${chunks.length}개\n`)
      report.push('**청크 목록**:\n')
      chunks.forEach((chunk, index) => {
        report.push(`### 청크 #${index + 1}`)
        report.push(`**길이**: ${chunk.length}자`)
        report.push(`**내용**:`)
        report.push('```')
        report.push(chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''))
        report.push('```\n')
      })
    }
    report.push('---\n')
    
    // 3단계: 임베딩
    report.push('## ③ 임베딩\n')
    if (embeddings && embeddings.length > 0) {
      report.push(`**임베딩 수**: ${embeddings.length}개`)
      report.push(`**임베딩 차원**: ${embeddings[0]?.length || 0}차원`)
      report.push(`**벡터 스토어 크기**: ${vectorStore?.length || 0}개 항목\n`)
    }
    report.push('---\n')
    
    // 4단계: 검색 및 답변
    report.push('## ④ 검색 및 답변\n')
    if (query) {
      report.push(`**질문**: ${query}\n`)
    }
    if (searchResults && searchResults.length > 0) {
      report.push('### 검색 결과\n')
      searchResults.forEach((result, index) => {
        report.push(`#### 검색 결과 #${index + 1}`)
        report.push(`**유사도**: ${(result.similarity * 100).toFixed(2)}%`)
        report.push(`**청크 ID**: ${result.id}`)
        report.push(`**내용**:`)
        report.push('```')
        report.push(result.text)
        report.push('```\n')
      })
    }
    if (answer) {
      report.push('### GPT 답변\n')
      report.push(answer)
      report.push('\n')
    }
    report.push('---\n')
    
    // 푸터
    report.push('**보고서 생성**: RAG Studio')
    
    return report.join('\n')
  }

  const handleDownloadReport = () => {
    const reportContent = generateReport()
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rag-report-${new Date().toISOString().split('T')[0]}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="step-content">
      <h2>④ Retrieval 테스트 (검색 및 답변)</h2>
      <p className="step-description">
        질문을 입력하면 관련된 청크를 찾아 GPT가 답변을 생성합니다.
      </p>

      {keywords.length > 0 && (
        <div className="keywords-section">
          <p className="keywords-label">💡 추천 키워드:</p>
          <div className="keywords-list">
            {keywords.map((keyword, index) => (
              <button
                key={index}
                className="keyword-tag"
                onClick={() => handleKeywordClick(keyword)}
                type="button"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="query-section">
        <textarea
          className="query-input"
          placeholder="문서에 대해 궁금한 것을 질문해보세요..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
        >
          {isSearching ? '검색 중...' : '검색'}
        </button>
      </div>

      {isSearching && (
        <div className="loading">
          <div className="spinner"></div>
          <p>검색 및 답변 생성 중...</p>
        </div>
      )}

      {searchResults && (
        <div className="result-section">
          <div className="result-box">
            <div className="result-title">🔍 검색 결과 (상위 {searchResults.length}개)</div>
            {searchResults.map((result, index) => (
              <div key={result.id} className="chunk-item" style={{ marginBottom: '15px' }}>
                <div className="chunk-header">
                  <span className="chunk-index">#{index + 1}</span>
                  <span className="chunk-size">
                    유사도: {(result.similarity * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="chunk-text">{result.text}</div>
              </div>
            ))}
          </div>

          {answer && (
            <div className="result-box">
              <div className="result-title">💡 GPT 답변</div>
              <div className="result-content">{answer}</div>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadReport}
                >
                  📄 RAG 보고서 다운로드 (.md)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="controls">
        <button className="btn btn-secondary" onClick={onBack}>
          ← 이전
        </button>
        <div></div>
      </div>
    </div>
  )
}

export default RetrievalStep
