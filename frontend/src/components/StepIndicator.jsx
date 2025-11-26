import './StepIndicator.css'

function StepIndicator({ currentStep, onStepClick }) {
  const steps = [
    { number: 1, label: '업로드' },
    { number: 2, label: 'Chunking' },
    { number: 3, label: 'Embedding' },
    { number: 4, label: 'Retrieval 테스트' },
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
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StepIndicator
