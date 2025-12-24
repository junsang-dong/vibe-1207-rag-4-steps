import './StepIndicator.css'

function StepIndicator({ currentStep, onStepClick }) {
  const steps = [
    { number: 1, title: '업로드 & 파싱', description: '파일 업로드 및 텍스트 추출' },
    { number: 2, title: '청킹', description: '텍스트 분할 및 미리보기' },
    { number: 3, title: '임베딩', description: '벡터 변환 및 저장' },
    { number: 4, title: '검색 & 답변', description: '질의 및 RAG 답변' },
  ]

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'active'
    return 'inactive'
  }

  return (
    <div className="step-indicator">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`step-item ${getStepStatus(step.number)}`}
          onClick={() => step.number <= currentStep && onStepClick(step.number)}
        >
          <div className="step-number">{step.number}</div>
          <div className="step-content">
            <div className="step-title">{step.title}</div>
            <div className="step-description">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StepIndicator
