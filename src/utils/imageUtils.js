/**
 * 图片工具函数
 */

/**
 * 检测图片URL是否可访问
 * @param {string} url 图片URL
 * @returns {Promise<boolean>} 是否可访问
 */
export function checkImageUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => {
      console.log('图片URL可访问:', url)
      resolve(true)
    }
    img.onerror = () => {
      console.log('图片URL不可访问:', url)
      resolve(false)
    }
    
    // 设置超时
    const timeout = setTimeout(() => {
      console.log('图片URL检测超时:', url)
      resolve(false)
    }, 5000)
    
    img.onload = () => {
      clearTimeout(timeout)
      console.log('图片URL可访问:', url)
      resolve(true)
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      console.log('图片URL不可访问:', url)
      resolve(false)
    }
    
    img.src = url
  })
}

/**
 * 获取图片尺寸
 * @param {string} url 图片URL
 * @returns {Promise<{width: number, height: number}>} 图片尺寸
 */
export function getImageSize(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject(new Error('无效的图片URL'))
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}

/**
 * 格式化图片URL
 * @param {string} url 原始URL
 * @returns {string} 格式化后的URL
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }
  
  // 移除首尾空格
  url = url.trim()
  
  // 如果是相对路径，添加域名
  if (url.startsWith('/')) {
    // 这里可以根据实际环境配置域名
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : window.location.origin
    url = baseUrl + url
  }
  
  return url
}

/**
 * 验证图片URL格式
 * @param {string} url 图片URL
 * @returns {boolean} 是否为有效的图片URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  // 检查是否为有效的URL格式
  try {
    new URL(url)
  } catch {
    return false
  }
  
  // 检查是否为图片文件扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const lowerUrl = url.toLowerCase()
  return imageExtensions.some(ext => lowerUrl.includes(ext))
}
