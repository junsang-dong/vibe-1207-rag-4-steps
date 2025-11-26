import { useState, useEffect } from 'react'
import apiClient from '../utils/axios'
import './StepContent.css'

function ChunkingStep({
  text,
  chunks,
  setChunks,
  chunkConfig,
  setChunkConfig,
  onNext,
  onBack,
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // 초기 로드 시 청킹 실행
  useEffect(() => {
    if (text && chunks.length === 0 && !isInitialized) {
      handleChunking()
      setIsInitialized(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // 청크 설정 변경 시 재청킹
  useEffect(() => {
    if (text && isInitialized) {
      handleChunking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkConfig.chunkSize, chunkConfig.overlap])

  const handleChunking = async () => {
    if (!text) return

    setIsProcessing(true)
    setError('')
    try {
      const response = await apiClient.post('/api/chunk', {
        text,
        chunkSize: chunkConfig.chunkSize,
        overlap: chunkConfig.overlap,
      })

      if (response.data && response.data.chunks) {
        setChunks(response.data.chunks)
        setError('')
      } else {
        throw new Error('청킹 결과를 받을 수 없습니다.')
      }
      setIsProcessing(false)
    } catch (err) {
      console.error('Chunking error:', err)
      const errorMessage = err.response?.data?.error || err.message || '청킹 중 오류가 발생했습니다.'
      setError(errorMessage)
      setIsProcessing(false)
      // 기존 청크가 있다면 유지
      if (chunks.length === 0) {
        setChunks([])
      }
    }
  }

  const handleChunkSizeChange = (e) => {
    setChunkConfig({
      ...chunkConfig,
      chunkSize: parseInt(e.target.value),
    })
  }

  const handleOverlapChange = (e) => {
    setChunkConfig({
      ...chunkConfig,
      overlap: parseInt(e.target.value),
    })
  }

  return (
    <div className="step-content">
      <h2>② Chunking (문서 분할)</h2>
      <p className="step-description">
        문서를 작은 청크로 나누어 임베딩하기 쉽게 준비합니다. 청크 크기와 중첩 값을 조정해보세요.
      </p>

      <div className="config-panel">
        <div className="config-item">
          <label>
            청크 크기 (문자 수): <span className="config-value">{chunkConfig.chunkSize}</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={chunkConfig.chunkSize}
            onChange={handleChunkSizeChange}
          />
          <input
            type="number"
            min="100"
            max="2000"
            value={chunkConfig.chunkSize}
            onChange={(e) =>
              setChunkConfig({ ...chunkConfig, chunkSize: parseInt(e.target.value) || 500 })
            }
          />
        </div>

        <div className="config-item">
          <label>
            중첩 (문자 수): <span className="config-value">{chunkConfig.overlap}</span>
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="25"
            value={chunkConfig.overlap}
            onChange={handleOverlapChange}
          />
          <input
            type="number"
            min="0"
            max="500"
            value={chunkConfig.overlap}
            onChange={(e) =>
              setChunkConfig({ ...chunkConfig, overlap: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {isProcessing && (
        <div className="loading">
          <div className="spinner"></div>
          <p>문서를 청크로 나누는 중...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {chunks.length > 0 && (
        <div className="chunks-preview">
          <h3>청크 결과 ({chunks.length}개)</h3>
          {chunks.map((chunk, index) => (
            <div key={index} className="chunk-item">
              <div className="chunk-header">
                <span className="chunk-index">청크 #{index + 1}</span>
                <span className="chunk-size">{chunk.length}자</span>
              </div>
              <div className="chunk-text">
                {chunk.substring(0, 200)}
                {chunk.length > 200 ? '...' : ''}
              </div>
            </div>
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
          disabled={chunks.length === 0 || isProcessing}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}

export default ChunkingStep
