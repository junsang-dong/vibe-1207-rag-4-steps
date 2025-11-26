import { useState, useRef } from 'react'
import axios from 'axios'
import './StepContent.css'

function UploadStep({ file, setFile, text, setText, onNext }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

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
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setFile(uploadedFile)
      setText(response.data.text)
      setIsUploading(false)
    } catch (err) {
      setError('파일 업로드에 실패했습니다. 다시 시도해주세요.')
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
          disabled={!text || isUploading}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}

export default UploadStep
