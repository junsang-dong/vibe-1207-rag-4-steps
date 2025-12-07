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

  return (
    <div className="app">
      <header className="app-header">
        <h1>RAG 4 Steps</h1>
        <p>RAG(Retrieval-Augmented Generation)의 작동 방식을 단계별로 이해할 수 있어요.</p>
      </header>

      <StepIndicator 
        currentStep={currentStep} 
        onStepClick={resetToStep}
      />

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
            onBack={handleBack}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>기술 스택</h3>
            <div className="tech-stack">
              <div className="tech-category">
                <span className="tech-label">Frontend:</span>
                <span className="tech-items">React, Vite, Axios</span>
              </div>
              <div className="tech-category">
                <span className="tech-label">Backend:</span>
                <span className="tech-items">Node.js, Express, Multer</span>
              </div>
              <div className="tech-category">
                <span className="tech-label">AI:</span>
                <span className="tech-items">OpenAI API (GPT-4o-mini, text-embedding-3-small)</span>
              </div>
            </div>
          </div>
          <div className="footer-section">
            <h3>개발자 정보</h3>
            <div className="developer-info">
              <p>동준상 · 넥스트플랫폼</p>
              <p>
                <a href="http://www.nextpaltform.net" target="_blank" rel="noopener noreferrer">
                  www.nextpaltform.net
                </a>
              </p>
              <p>
                <a href="mailto:naebon@nave.com">naebon@nave.com</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App