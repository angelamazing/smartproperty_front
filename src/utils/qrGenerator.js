/**
 * 前端二维码生成工具
 * 支持多种二维码生成方式，无需依赖后端接口
 */

// 微信小程序环境下的二维码生成工具
// 由于微信小程序不支持Node.js的qrcode库，我们使用简化方案

// 检查是否在微信小程序环境
const isWechatMiniProgram = () => {
  return typeof wx !== 'undefined' && wx.getSystemInfoSync
}

// 生成简单的二维码内容（用于调试）
const generateSimpleQRContent = (content) => {
  return {
    success: true,
    data: content,
    type: 'text',
    platform: 'wechat_miniprogram'
  }
}

/**
 * 生成场景令牌
 * @returns {string} 场景令牌
 */
export const generateSceneToken = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `dining_${timestamp}_${random}`
}

/**
 * 生成就餐确认URL
 * @param {string} sceneToken - 场景令牌
 * @param {string} baseURL - 基础URL
 * @returns {string} 完整的确认URL
 */
export const generateDiningConfirmURL = (sceneToken, baseURL = '') => {
  const base = baseURL || window.location.origin
  return `${base}/pages/dining/external-scan?scene_token=${sceneToken}`
}

/**
 * 生成微信小程序码参数
 * @param {string} sceneToken - 场景令牌
 * @returns {string} 小程序码参数
 */
export const generateWechatMiniProgramParams = (sceneToken) => {
  return `scene_token=${sceneToken}`
}

/**
 * 生成二维码数据URL
 * @param {string} content - 二维码内容
 * @param {Object} options - 生成选项
 * @returns {Promise<string>} 二维码数据URL
 */
export const generateQRCodeDataURL = async (content, options = {}) => {
  try {
    // 在微信小程序环境中，直接返回内容
    if (isWechatMiniProgram()) {
      console.log('微信小程序环境，返回二维码内容:', content)
      return content
    }
    
    // 尝试使用qrcode库（如果可用）
    try {
      const qrcodeModule = await import('qrcode')
      const QRCode = qrcodeModule.default || qrcodeModule
      
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }
      
      const finalOptions = { ...defaultOptions, ...options }
      const dataURL = await QRCode.toDataURL(content, finalOptions)
      return dataURL
    } catch (importError) {
      console.warn('qrcode库不可用，使用简化方案:', importError)
      return content
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    // 返回原始内容作为备用方案
    return content
  }
}

/**
 * 生成二维码SVG
 * @param {string} content - 二维码内容
 * @param {Object} options - 生成选项
 * @returns {Promise<string>} 二维码SVG字符串
 */
export const generateQRCodeSVG = async (content, options = {}) => {
  try {
    // 在微信小程序环境中，返回简单的内容
    if (isWechatMiniProgram()) {
      return content
    }
    
    // 尝试使用qrcode库
    try {
      const qrcodeModule = await import('qrcode')
      const QRCode = qrcodeModule.default || qrcodeModule
      
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }
      
      const finalOptions = { ...defaultOptions, ...options }
      const svgString = await QRCode.toString(content, { type: 'svg', ...finalOptions })
      return svgString
    } catch (importError) {
      console.warn('qrcode库不可用，返回原始内容:', importError)
      return content
    }
  } catch (error) {
    console.error('生成二维码SVG失败:', error)
    return content
  }
}

/**
 * 生成就餐确认二维码
 * @param {Object} options - 生成选项
 * @returns {Promise<Object>} 二维码信息
 */
export const generateDiningConfirmQRCode = async (options = {}) => {
  try {
    const {
      sceneToken = generateSceneToken(),
      baseURL = '',
      width = 300,
      margin = 2,
      includeURL = true
    } = options
    
    let content
    if (includeURL) {
      // 生成包含完整URL的二维码
      content = generateDiningConfirmURL(sceneToken, baseURL)
    } else {
      // 生成只包含scene_token的二维码
      content = sceneToken
    }
    
    const dataURL = await generateQRCodeDataURL(content, { width, margin })
    
    return {
      success: true,
      data: {
        qrCodeImage: dataURL,
        content: content,
        sceneToken: sceneToken,
        type: includeURL ? 'url' : 'token',
        platform: isWechatMiniProgram() ? 'wechat_miniprogram' : 'web'
      }
    }
  } catch (error) {
    console.error('生成就餐确认二维码失败:', error)
    return {
      success: false,
      message: error.message,
      data: null
    }
  }
}

/**
 * 生成微信小程序码参数二维码
 * @param {Object} options - 生成选项
 * @returns {Promise<Object>} 二维码信息
 */
export const generateWechatMiniProgramQRCode = async (options = {}) => {
  try {
    const {
      sceneToken = generateSceneToken(),
      width = 300,
      margin = 2
    } = options
    
    const content = generateWechatMiniProgramParams(sceneToken)
    const dataURL = await generateQRCodeDataURL(content, { width, margin })
    
    return {
      success: true,
      data: {
        qrCodeImage: dataURL,
        content: content,
        sceneToken: sceneToken,
        type: 'wechat_miniprogram',
        platform: isWechatMiniProgram() ? 'wechat_miniprogram' : 'web'
      }
    }
  } catch (error) {
    console.error('生成微信小程序码失败:', error)
    return {
      success: false,
      message: error.message,
      data: null
    }
  }
}

/**
 * 下载二维码图片
 * @param {string} dataURL - 二维码数据URL
 * @param {string} filename - 文件名
 */
export const downloadQRCode = (dataURL, filename = 'qrcode.png') => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('二维码下载成功:', filename)
  } catch (error) {
    console.error('下载二维码失败:', error)
    throw new Error('下载失败: ' + error.message)
  }
}

/**
 * 保存二维码到相册（uni-app环境）
 * @param {string} dataURL - 二维码数据URL
 * @param {string} filename - 文件名
 */
export const saveQRCodeToAlbum = (dataURL, filename = 'qrcode.png') => {
  return new Promise((resolve, reject) => {
    // 将dataURL转换为临时文件路径
    const base64 = dataURL.split(',')[1]
    
    // 保存到临时文件
    const fs = uni.getFileSystemManager()
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${filename}`
    
    fs.writeFile({
      filePath: tempFilePath,
      data: base64,
      encoding: 'base64',
      success: () => {
        // 保存到相册
        uni.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            console.log('二维码保存到相册成功')
            resolve({ success: true })
          },
          fail: (error) => {
            console.error('保存到相册失败:', error)
            reject(new Error('保存到相册失败: ' + error.errMsg))
          }
        })
      },
      fail: (error) => {
        console.error('写入临时文件失败:', error)
        reject(new Error('写入临时文件失败: ' + error.errMsg))
      }
    })
  })
}

/**
 * 分享二维码
 * @param {string} dataURL - 二维码数据URL
 * @param {string} title - 分享标题
 * @param {string} content - 分享内容
 */
export const shareQRCode = (dataURL, title = '就餐确认二维码', content = '扫描二维码确认就餐') => {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: ['保存到相册', '复制链接', '分享给朋友'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: // 保存到相册
            saveQRCodeToAlbum(dataURL)
              .then(resolve)
              .catch(reject)
            break
          case 1: // 复制链接
            uni.setClipboardData({
              data: dataURL,
              success: () => {
                uni.showToast({
                  title: '链接已复制',
                  icon: 'success'
                })
                resolve({ success: true })
              },
              fail: reject
            })
            break
          case 2: // 分享给朋友
            uni.share({
              provider: 'weixin',
              scene: 'WXSceneSession',
              type: 2,
              imageUrl: dataURL,
              title: title,
              summary: content,
              success: () => {
                uni.showToast({
                  title: '分享成功',
                  icon: 'success'
                })
                resolve({ success: true })
              },
              fail: reject
            })
            break
        }
      },
      fail: reject
    })
  })
}

export default {
  generateSceneToken,
  generateDiningConfirmURL,
  generateWechatMiniProgramParams,
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateDiningConfirmQRCode,
  generateWechatMiniProgramQRCode,
  downloadQRCode,
  saveQRCodeToAlbum,
  shareQRCode
}
