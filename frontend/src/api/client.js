import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const computeInventory = (safetyBuffer = 0.20) =>
  api.post('/compute', { safety_buffer: safetyBuffer })

export const uploadStock = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload-stock', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const resetStock = () => api.post('/reset-stock')

export const getMLBenchmarks = () => api.get('/ml-benchmarks')

export const getRelatedProducts = (itemId, storeId, limit = 5) =>
  api.get('/related-products', {
    params: { item_id: itemId, store_id: storeId, limit },
  })

export const getForecastInfo = () => api.get('/forecast-info')

export const downloadCSV = () => api.get('/download/csv', { responseType: 'blob' })

export const downloadTemplate = () => api.get('/download/template', { responseType: 'blob' })

export const downloadParquet = () => api.get('/download/parquet', { responseType: 'blob' })

export default api
