/**
 * API工具函数
 */

// API配置
const API_CONFIG = {
  // 生产环境地址
  PROD_BASE_URL: 'https://uauotggfeiao.sealosbja.site',
  // 开发环境地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 请求超时时间
  TIMEOUT: 10000
}

/**
 * 获取当前环境的基础URL
 * @returns {string} 基础URL
 */
export function getBaseUrl() {
  // 检查是否为开发环境
  const isDev = process.env.NODE_ENV === 'development' ||
                process.env.UNI_PLATFORM === 'h5' ||
                process.env.UNI_PLATFORM === 'app-plus'

  // 通过URL判断（简单有效）
  const currentUrl = window.location?.href || ''
  const isLocalhost = currentUrl.includes('localhost') ||
                     currentUrl.includes('127.0.0.1') ||
                     currentUrl.includes('192.168.') ||
                     currentUrl.includes('10.0.') ||
                     currentUrl.includes('172.')

  // 优先使用本地判断，如果本地开发则使用开发服务器
  if (isLocalhost) {
    console.log('当前为开发环境，使用本地开发服务器:', API_CONFIG.DEV_BASE_URL)
    return API_CONFIG.DEV_BASE_URL
  }

  // 默认使用生产环境
  console.log('当前为生产环境，使用生产服务器:', API_CONFIG.PROD_BASE_URL)
  return API_CONFIG.PROD_BASE_URL
}

/**
 * 构建完整的API URL
 * @param {string} path API路径
 * @returns {string} 完整的API URL
 */
export function buildApiUrl(path) {
  return getBaseUrl() + path
}

/**
 * 构建静态文件URL
 * @param {string} filePath 文件路径
 * @returns {string} 完整的静态文件URL
 */
export function buildStaticUrl(filePath) {
  if (!filePath) return ''
  
  // 如果已经是完整URL，直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  // 如果是相对路径，添加API前缀
  if (filePath.startsWith('/uploads/')) {
    return `${getBaseUrl()}/api/static${filePath}`
  }
  
  // 其他情况，直接拼接
  return `${getBaseUrl()}${filePath}`
}
