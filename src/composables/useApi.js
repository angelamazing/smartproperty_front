/**
 * API请求组合式API
 * 提供统一的API调用和错误处理
 * 
 * @author Linus (致敬内核之父的严谨风格)
 */

import { ref } from 'vue'

// 导入baseURL配置
const API_CONFIG = {
  // 生产环境地址
  PROD_BASE_URL: 'https://uauotggfeiao.sealosbja.site',
  // 开发环境地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 请求超时时间
  TIMEOUT: 10000
}

// 获取当前环境的基础URL
function getBaseUrl() {
  // 检查是否为开发环境
  const isDev = process.env.NODE_ENV === 'development'
  
  // 如果是开发模式，使用开发服务器
  if (isDev) {
    console.log('当前为开发环境，使用本地开发服务器:', API_CONFIG.DEV_BASE_URL)
    return API_CONFIG.DEV_BASE_URL
  }
  
  // 默认使用生产环境
  console.log('当前为生产环境，使用生产服务器:', API_CONFIG.PROD_BASE_URL)
  return API_CONFIG.PROD_BASE_URL
}

export function useApi() {
  const baseURL = ref(getBaseUrl())
  const timeout = ref(API_CONFIG.TIMEOUT)
  
  // 调试信息
  console.log('🔧 useApi 初始化，baseURL:', baseURL.value)
  
  // 请求拦截器
  const requestInterceptor = (config) => {
    // 添加时间戳防止缓存
    if (config.method === 'GET') {
      config.data = {
        ...config.data,
        _t: Date.now()
      }
    }
    
    // 添加请求头
    config.header = {
      'Content-Type': 'application/json',
      ...config.header
    }
    
    console.log(`🚀 API请求: ${config.method} ${config.url}`, config.data)
    return config
  }
  
  // 响应拦截器
  const responseInterceptor = (response) => {
    console.log(`✅ API响应: ${response.statusCode}`, response.data)
    return response
  }
  
  // 错误拦截器
  const errorInterceptor = (error) => {
    console.error(`❌ API错误:`, error)
    
    // 统一错误处理
    let errorMessage = '网络请求失败'
    
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '权限不足'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        default:
          errorMessage = `请求失败 (${error.statusCode})`
      }
    } else if (error.errMsg) {
      errorMessage = error.errMsg
    }
    
    // 显示错误提示
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
    
    return Promise.reject(new Error(errorMessage))
  }
  
  // 发起请求
  const request = (config) => {
    return new Promise((resolve, reject) => {
      // 应用请求拦截器
      const processedConfig = requestInterceptor({
        url: config.url.startsWith('http') ? config.url : `${baseURL.value}${config.url}`,
        method: config.method || 'GET',
        data: config.data || {},
        header: config.header || {},
        timeout: config.timeout || timeout.value,
        ...config
      })
      
      uni.request({
        ...processedConfig,
        success: (response) => {
          try {
            const processedResponse = responseInterceptor(response)
            
            // 检查业务状态码
            if (processedResponse.data && processedResponse.data.success === false) {
              const error = new Error(processedResponse.data.message || '请求失败')
              error.statusCode = processedResponse.statusCode
              error.data = processedResponse.data
              reject(error)
            } else {
              resolve(processedResponse.data)
            }
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          errorInterceptor(error)
          reject(error)
        }
      })
    })
  }
  
  // GET请求
  const get = (url, data = {}, config = {}) => {
    return request({
      url,
      method: 'GET',
      data,
      ...config
    })
  }
  
  // POST请求
  const post = (url, data = {}, config = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...config
    })
  }
  
  // PUT请求
  const put = (url, data = {}, config = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }
  
  // DELETE请求
  const del = (url, data = {}, config = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...config
    })
  }
  
  // 上传文件
  const upload = (url, filePath, formData = {}, config = {}) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: url.startsWith('http') ? url : `${baseURL.value}${url}`,
        filePath,
        name: 'file',
        formData,
        header: {
          'Content-Type': 'multipart/form-data',
          ...config.header
        },
        success: (response) => {
          try {
            const data = JSON.parse(response.data)
            if (data.success) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (error) => {
          errorInterceptor(error)
          reject(error)
        }
      })
    })
  }
  
  // 下载文件
  const download = (url, config = {}) => {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: url.startsWith('http') ? url : `${baseURL.value}${url}`,
        success: (response) => {
          if (response.statusCode === 200) {
            resolve(response)
          } else {
            reject(new Error(`下载失败: ${response.statusCode}`))
          }
        },
        fail: (error) => {
          errorInterceptor(error)
          reject(error)
        }
      })
    })
  }
  
  return {
    baseURL,
    timeout,
    request,
    get,
    post,
    put,
    delete: del,
    upload,
    download
  }
}
