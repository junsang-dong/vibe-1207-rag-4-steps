import { useState } from 'react'
import './App.css'
import StepIndicator from './components/StepIndicator'
import UploadStep from './components/UploadStep'
import ChunkingStep from './components/ChunkingStep'
import EmbeddingStep from './components/EmbeddingStep'
import RetrievalStep from './components/RetrievalStep'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [chunks, setChunks] = useState([])
  const [chunkConfig, setChunkConfig] = useState({ chunkSize: 500, overlap: 100 })
  const [embeddings, setEmbeddings] = useState([])
  const [vectorStore, setVectorStore] = useState(null)

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetToStep = (step) => {
    setCurrentStep(step)
    if (step === 1) {
      setFile(null)
      setText('')
      setChunks([])
      setEmbeddings([])
      setVectorStore(null)
    } else if (step === 2) {
      setChunks([])
      setEmbeddings([])
      setVectorStore(null)
    } else if (step === 3) {
      setEmbeddings([])
      setVectorStore(null)
    }
  }

  const handleExportSession = () => {
    const sessionData = {
      file: file ? { name: file.name, size: file.size } : null,
      text: text,
      chunks: chunks,
      chunkConfig: chunkConfig,
      embeddings: embeddings,
      vectorStore: vectorStore,
      currentStep: currentStep
    }
    const dataStr = JSON.stringify(sessionData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rag-session-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleResetSession = () => {
    if (window.confirm('세션을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
      setCurrentStep(1)
      setFile(null)
      setText('')
      setChunks([])
      setEmbeddings([])
      setVectorStore(null)
      setChunkConfig({ chunkSize: 500, overlap: 100 })
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1>RAG Studio</h1>
            <p className="header-description">
              RAG의 작동 방식을 Chunking, Embedding, Retrieval 단계별로 보여주는 교육용앱
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-header" onClick={handleExportSession}>
              세션 내보내기
            </button>
            <button className="btn-header btn-header-danger" onClick={handleResetSession}>
              세션 초기화
            </button>
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside className="app-sidebar">
          <StepIndicator 
            currentStep={currentStep} 
            onStepClick={resetToStep}
          />
        </aside>

        <main className="app-main">
          {currentStep === 1 && (
            <UploadStep
              file={file}
              setFile={setFile}
              text={text}
              setText={setText}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <ChunkingStep
              text={text}
              chunks={chunks}
              setChunks={setChunks}
              chunkConfig={chunkConfig}
              setChunkConfig={setChunkConfig}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <EmbeddingStep
              chunks={chunks}
              embeddings={embeddings}
              setEmbeddings={setEmbeddings}
              vectorStore={vectorStore}
              setVectorStore={setVectorStore}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <RetrievalStep
              vectorStore={vectorStore}
              chunks={chunks}
              file={file}
              text={text}
              chunkConfig={chunkConfig}
              embeddings={embeddings}
              onBack={handleBack}
            />
          )}
        </main>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <ul className="footer-list">
            <li>교육 목적의 기능 제한 버전</li>
            <li>기술 스택: React, Vite, Node.js, Express, OpenAI API (GPT-4o-mini, text-embedding-3-small)</li>
            <li>개발자 정보: JUN / naebon@naver.com / www.nextplatform.net</li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default App