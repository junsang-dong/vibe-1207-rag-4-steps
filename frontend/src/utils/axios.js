import axios from 'axios'
import { getApiKey } from './apiKey'

// axios 인스턴스 생성
const apiClient = axios.create()

// 요청 인터셉터: 모든 요청에 API 키 헤더 추가
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey()
    if (apiKey) {
      config.headers['X-OpenAI-API-Key'] = apiKey
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
