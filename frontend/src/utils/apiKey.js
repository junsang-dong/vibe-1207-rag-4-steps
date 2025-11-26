const API_KEY_STORAGE_KEY = 'openai_api_key'

export const getApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || ''
}

export const setApiKey = (apiKey) => {
  if (apiKey) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  }
}

export const clearApiKey = () => {
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}
