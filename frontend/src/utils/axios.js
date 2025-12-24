import axios from 'axios'

// axios 인스턴스 생성
// API 키는 서버의 환경 변수에서 관리됩니다
const apiClient = axios.create()

export default apiClient
