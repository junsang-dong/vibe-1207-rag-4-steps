import { useState, useRef, useEffect } from 'react'
import apiClient from '../utils/axios'
import { getApiKey, setApiKey } from '../utils/apiKey'
import './StepContent.css'

function UploadStep({ file, setFile, text, setText, onNext }) {
  const [apiKey, setApiKeyState] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [isValidKey, setIsValidKey] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // 저장된 API 키 불러오기
  useEffect(() => {
    const savedApiKey = getApiKey()
    if (savedApiKey) {
      setApiKeyState(savedApiKey)
    }
  }, [])

  // API 키 저장
  const handleApiKeyChange = (e) => {
    const value = e.target.value.trim()
    setApiKeyState(value)
    setApiKey(value)
    // 키가 변경되면 검증 결과 초기화
    setValidationMessage('')
    setIsValidKey(false)
  }

  // API 키 유효성 검증
  const handleValidateKey = async () => {
    if (!apiKey || apiKey.trim() === '') {
      setValidationMessage('API 키를 먼저 입력해주세요.')
      setIsValidKey(false)
      return
    }

    setIsValidating(true)
    setValidationMessage('')
    setError('')

    try {
      const response = await apiClient.post('/api/validate-key', {
        apiKey: apiKey,
      })

      if (response.data.valid) {
        setValidationMessage('유효한 키입니다.')
        setIsValidKey(true)
      } else {
        setValidationMessage(response.data.message || '유효하지 않은 키입니다.')
        setIsValidKey(false)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'API 키 검증 중 오류가 발생했습니다.'
      setValidationMessage(errorMessage)
      setIsValidKey(false)
      console.error('Validation error:', err)
    } finally {
      setIsValidating(false)
    }
  }

  // Enter 키로 검증 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidateKey()
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      await handleFileUpload(droppedFile)
    }
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      await handleFileUpload(selectedFile)
    }
  }

  const handleFileUpload = async (uploadedFile) => {
    setError('')
    
    // API 키 검증
    if (!apiKey || apiKey.trim() === '') {
      setError('OpenAI API 키를 먼저 입력해주세요.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setFile(uploadedFile)
      setText(response.data.text)
      setIsUploading(false)
    } catch (err) {
      const errorMessage = err.response?.data?.error || '파일 업로드에 실패했습니다. 다시 시도해주세요.'
      setError(errorMessage)
      setIsUploading(false)
      console.error('Upload error:', err)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="step-content">
      <h2>① 파일 업로드</h2>
      <p className="step-description">
        TXT 또는 PDF 파일을 업로드하여 문서를 분석할 준비를 합니다.
      </p>

      <div className="api-key-section">
        <label htmlFor="api-key" className="api-key-label">
          OpenAI API 키
        </label>
        <div className="api-key-input-wrapper">
          <input
            id="api-key"
            type="password"
            className="api-key-input"
            placeholder="sk-..."
            value={apiKey}
            onChange={handleApiKeyChange}
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            className="btn btn-validate"
            onClick={handleValidateKey}
            disabled={!apiKey || isValidating}
          >
            {isValidating ? '확인 중...' : '확인'}
          </button>
        </div>
        {validationMessage && (
          <p className={`api-key-validation-message ${isValidKey ? 'valid' : 'invalid'}`}>
            {validationMessage}
          </p>
        )}
        <p className="api-key-hint">
          API 키 값은 사용자의 브라우저에만 저장됩니다.
        </p>
      </div>

      <div
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📄</div>
        <h3>파일을 드래그하여 업로드</h3>
        <p>또는 클릭하여 파일 선택</p>
        <p className="upload-hint">지원 형식: TXT, PDF</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf"
        onChange={handleFileSelect}
        className="file-input"
      />

      {isUploading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>파일을 업로드하고 텍스트를 추출하는 중...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {file && (
        <div className="file-info">
          <div>
            <div className="file-name">✓ {file.name}</div>
            <div className="file-size">{formatFileSize(file.size)}</div>
          </div>
          <div>
            <div className="text-preview">
              추출된 텍스트: {text.length.toLocaleString()}자
            </div>
          </div>
        </div>
      )}

      <div className="controls">
        <div></div>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!text || isUploading || !apiKey}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}

export default UploadStep
