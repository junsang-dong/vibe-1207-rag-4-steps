import { useState, useEffect } from 'react'
import apiClient from '../utils/axios'
import './StepContent.css'

function EmbeddingStep({
  chunks,
  embeddings,
  setEmbeddings,
  vectorStore,
  setVectorStore,
  onNext,
  onBack,
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    if (chunks.length > 0 && embeddings.length === 0) {
      handleEmbedding()
    }
  }, [chunks])

  const addLog = (message) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const handleEmbedding = async () => {
    if (chunks.length === 0) return

    setIsProcessing(true)
    setLogs([])
    addLog('임베딩 프로세스를 시작합니다...')

    try {
      addLog(`${chunks.length}개의 청크에 대해 임베딩을 생성합니다...`)

      const response = await apiClient.post('/api/embed', {
        chunks,
      })

      setEmbeddings(response.data.embeddings)
      
      // 벡터 스토어 생성 (메모리 기반)
      const store = chunks.map((chunk, index) => ({
        id: index,
        text: chunk,
        embedding: response.data.embeddings[index],
      }))

      setVectorStore(store)
      addLog(`✓ ${response.data.embeddings.length}개의 임베딩이 생성되었습니다.`)
      addLog(`✓ 벡터 스토어가 메모리에 저장되었습니다.`)
      setIsProcessing(false)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || '알 수 없는 오류가 발생했습니다.'
      addLog(`✗ 오류 발생: ${errorMessage}`)
      if (err.response?.data?.details) {
        addLog(`상세 정보: ${err.response.data.details}`)
      }
      setIsProcessing(false)
      console.error('Embedding error:', err)
      console.error('Error response:', err.response?.data)
    }
  }

  return (
    <div className="step-content">
      <h2>③ Embedding (벡터화)</h2>
      <p className="step-description">
        각 청크를 벡터로 변환하여 의미 기반 검색이 가능하도록 합니다.
      </p>

      {isProcessing && (
        <div className="loading">
          <div className="spinner"></div>
          <p>임베딩을 생성하는 중...</p>
        </div>
      )}

      {embeddings.length > 0 && (
        <>
          <div className="result-box">
            <div className="result-title">✓ 임베딩 완료</div>
            <div className="result-content">
              <p>생성된 임베딩 수: {embeddings.length}개</p>
              <p>임베딩 차원: {embeddings[0]?.length || 0}차원</p>
              <p>벡터 스토어 크기: {vectorStore?.length || 0}개 항목</p>
            </div>
          </div>

          {chunks.length > 0 && embeddings.length > 0 && (
            <div className="embedding-example-box">
              <div className="result-title">📊 임베딩 예시</div>
              <div className="embedding-example-content">
                <div className="embedding-example-item">
                  <div className="embedding-example-label">청크 #1 텍스트:</div>
                  <div className="embedding-example-text">{chunks[0]}</div>
                </div>
                <div className="embedding-example-item">
                  <div className="embedding-example-label">청크 #1 임베딩 값:</div>
                  <div className="embedding-example-embedding">
                    {(() => {
                      const embeddingArray = embeddings[0] || []
                      
                      if (embeddingArray.length === 0) {
                        return '임베딩 값이 없습니다.'
                      }
                      
                      // 최대 100개까지만 표시
                      const maxDisplay = 100
                      const displayArray = embeddingArray.slice(0, maxDisplay)
                      const isTruncated = embeddingArray.length > maxDisplay
                      
                      // 임베딩 값을 포맷팅하여 표시 (한 줄에 10개씩)
                      const formatEmbedding = (arr) => {
                        const itemsPerLine = 10
                        const lines = []
                        
                        for (let i = 0; i < arr.length; i += itemsPerLine) {
                          const line = arr.slice(i, i + itemsPerLine)
                            .map(val => val.toFixed(6))
                            .join(', ')
                          lines.push(line)
                        }
                        
                        return `[${lines.join(',\n ')}]`
                      }
                      
                      // 최대 100개까지 표시 (줄바꿈 포함)
                      let result = formatEmbedding(displayArray)
                      if (isTruncated) {
                        result += `\n... (총 ${embeddingArray.length}개 요소 중 ${maxDisplay}개만 표시)`
                      }
                      return result
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {logs.length > 0 && (
        <div className="log-area">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}

      <div className="controls">
        <button className="btn btn-secondary" onClick={onBack}>
          ← 이전
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={vectorStore === null || vectorStore.length === 0 || isProcessing}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}

export default EmbeddingStep
