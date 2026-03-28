import API from './client'

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)
export const saveApiKey = (key) => API.put('/auth/api-key', { openai_api_key: key })

export const getAgents = () => API.get('/agents/')
export const createAgent = (data) => API.post('/agents/', data)
export const getAgent = (id) => API.get(`/agents/${id}`)
export const updateAgent = (id, data) => API.put(`/agents/${id}`, data)
export const deleteAgent = (id) => API.delete(`/agents/${id}`)
export const publishAgent = (id) => API.post(`/agents/${id}/publish`)

export const uploadFile = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/agents/${id}/files`, form)
}
export const getFiles = (id) => API.get(`/agents/${id}/files`)
export const deleteFile = (id, fid) => API.delete(`/agents/${id}/files/${fid}`)

export const studioChat = (id, data) => API.post(`/agents/${id}/chat`, data)
export const widgetChat = (token, data) => API.post(`/widget/${token}/chat`, data)