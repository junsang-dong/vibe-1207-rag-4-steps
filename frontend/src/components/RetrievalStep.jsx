import { useState } from 'react'
import axios from 'axios'
import './StepContent.css'

function RetrievalStep({ vectorStore, chunks, onBack }) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [answer, setAnswer] = useState('')

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
      const queryEmbeddingResponse = await axios.post('/api/embed', {
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

      const answerResponse = await axios.post('/api/query', {
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

  return (
    <div className="step-content">
      <h2>④ Retrieval 테스트 (검색 및 답변)</h2>
      <p className="step-description">
        질문을 입력하면 관련된 청크를 찾아 GPT가 답변을 생성합니다.
      </p>

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
