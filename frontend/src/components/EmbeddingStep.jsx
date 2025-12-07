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
      addLog(`✗ 오류 발생: ${err.message}`)
      setIsProcessing(false)
      console.error('Embedding error:', err)
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
                      const chunkTextLength = chunks[0]?.length || 0
                      const embeddingArray = embeddings[0] || []
                      
                      // 청크 텍스트 길이를 기준으로 표시할 임베딩 요소 수 계산
                      // 평균적으로 각 숫자가 약 8-10자 (예: -0.012345)로 가정
                      const charsPerNumber = 10
                      const maxNumbers = Math.max(1, Math.floor(chunkTextLength / charsPerNumber))
                      
                      if (embeddingArray.length <= maxNumbers) {
                        // 전체 배열 표시
                        return JSON.stringify(embeddingArray)
                      } else {
                        // 일부만 표시
                        const partialArray = embeddingArray.slice(0, maxNumbers)
                        return JSON.stringify(partialArray) + ` ... (총 ${embeddingArray.length}개 요소 중 ${maxNumbers}개만 표시)`
                      }
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
