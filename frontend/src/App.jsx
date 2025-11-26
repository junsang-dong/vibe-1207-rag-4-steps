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
        <h1>📚 바이브코딩 RAG 웹앱</h1>
        <p>단계별 문서 이해 도우미</p>
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
    </div>
  )
}

export default App