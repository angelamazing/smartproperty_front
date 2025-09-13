/**
 * uniapp 二维码生成器
 * 基于 uniapp 原生方式生成二维码，避免依赖问题
 * 参考：https://blog.csdn.net/yehaocheng520/article/details/133020626
 */

// 固定的二维码标识
const FIXED_QR_CODE_ID = 'DINING_CONFIRM_FIXED_001'

/**
 * 检查是否在微信小程序环境
 */
const isWechatMiniProgram = () => {
  return typeof wx !== 'undefined' && wx.getSystemInfoSync
}

/**
 * 检查是否在 uniapp 环境
 */
const isUniApp = () => {
  return typeof uni !== 'undefined'
}

/**
 * 生成固定就餐确认二维码
 * @param {Object} options - 生成选项
 * @returns {Promise<Object>} 二维码信息
 */
export const generateFixedDiningQRCode = async (options = {}) => {
  try {
    const {
      width = 400,
      margin = 2,
      baseURL = ''
    } = options
    
    // 生成固定的二维码内容
    const timestamp = Date.now()
    const qrContent = `${FIXED_QR_CODE_ID}_${timestamp}`
    
    // 在 uniapp 环境中，使用原生方式生成二维码
    if (isUniApp()) {
      console.log('uniapp环境，生成固定二维码内容:', qrContent)
      return {
        success: true,
        data: {
          qrCodeImage: qrContent, // 在 uniapp 中，内容就是二维码
          content: qrContent,
          qrCodeId: FIXED_QR_CODE_ID,
          timestamp: timestamp,
          type: 'fixed_dining_confirm',
          platform: 'uniapp',
          canvasId: `qrcode_${timestamp}`, // 用于 canvas 渲染
          size: `${width}rpx`,
          options: {
            useDynamicSize: false,
            errorCorrectLevel: 'Q',
            margin: margin,
            areaColor: "#fff",
            // 可以添加 logo
            // foregroundImageSrc: require('static/image/logo.png')
          }
        }
      }
    }
    
    // 在微信小程序环境中，直接返回内容
    if (isWechatMiniProgram()) {
      console.log('微信小程序环境，生成固定二维码内容:', qrContent)
      return {
        success: true,
        data: {
          qrCodeImage: qrContent,
          content: qrContent,
          qrCodeId: FIXED_QR_CODE_ID,
          timestamp: timestamp,
          type: 'fixed_dining_confirm',
          platform: 'wechat_miniprogram',
          fallback: true
        }
      }
    }
    
    // 在Web环境中，尝试生成真正的二维码图片
    try {
      const qrGenerator = await import('./qrGenerator.js')
      const dataURL = await qrGenerator.generateQRCodeDataURL(qrContent, { width, margin })
      
      return {
        success: true,
        data: {
          qrCodeImage: dataURL,
          content: qrContent,
          qrCodeId: FIXED_QR_CODE_ID,
          timestamp: timestamp,
          type: 'fixed_dining_confirm',
          platform: 'web'
        }
      }
    } catch (error) {
      console.warn('Web环境二维码生成失败，使用简化方案:', error)
      return {
        success: true,
        data: {
          qrCodeImage: qrContent,
          content: qrContent,
          qrCodeId: FIXED_QR_CODE_ID,
          timestamp: timestamp,
          type: 'fixed_dining_confirm',
          platform: 'web',
          fallback: true
        }
      }
    }
    
  } catch (error) {
    console.error('生成固定二维码失败:', error)
    return {
      success: false,
      message: '生成固定二维码失败: ' + error.message,
      data: null
    }
  }
}

/**
 * 生成场景令牌
 */
export const generateSceneToken = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `dining_${timestamp}_${random}`
}

/**
 * 生成就餐确认URL
 */
export const generateDiningConfirmURL = (sceneToken, baseURL = '') => {
  const base = baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/pages/dining/external-scan?scene_token=${sceneToken}`
}

/**
 * 生成微信小程序码参数
 */
export const generateWechatMiniProgramParams = (sceneToken) => {
  return `scene_token=${sceneToken}`
}

/**
 * 生成二维码数据URL（uniapp版本）
 */
export const generateQRCodeDataURL = async (content, options = {}) => {
  try {
    // 在 uniapp 环境中，返回内容用于 canvas 渲染
    if (isUniApp()) {
      console.log('uniapp环境，返回二维码内容用于canvas渲染:', content)
      return {
        content: content,
        canvasId: `qrcode_${Date.now()}`,
        size: `${options.width || 300}rpx`,
        options: {
          useDynamicSize: false,
          errorCorrectLevel: 'Q',
          margin: options.margin || 2,
          areaColor: "#fff"
        }
      }
    }
    
    // 在微信小程序环境中，直接返回内容
    if (isWechatMiniProgram()) {
      console.log('微信小程序环境，返回二维码内容:', content)
      return content
    }
    
    // 在Web环境中，尝试使用qrcode库
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
      console.warn('qrcode库不可用，返回原始内容:', importError)
      return content
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    return content
  }
}

/**
 * 生成就餐确认二维码
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
      content = generateDiningConfirmURL(sceneToken, baseURL)
    } else {
      content = sceneToken
    }
    
    const qrData = await generateQRCodeDataURL(content, { width, margin })
    
    return {
      success: true,
      data: {
        qrCodeImage: qrData,
        content: content,
        sceneToken: sceneToken,
        type: includeURL ? 'url' : 'token',
        platform: isUniApp() ? 'uniapp' : (isWechatMiniProgram() ? 'wechat_miniprogram' : 'web')
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
 */
export const generateWechatMiniProgramQRCode = async (options = {}) => {
  try {
    const {
      sceneToken = generateSceneToken(),
      width = 300,
      margin = 2
    } = options
    
    const content = generateWechatMiniProgramParams(sceneToken)
    const qrData = await generateQRCodeDataURL(content, { width, margin })
    
    return {
      success: true,
      data: {
        qrCodeImage: qrData,
        content: content,
        sceneToken: sceneToken,
        type: 'wechat_miniprogram',
        platform: isUniApp() ? 'uniapp' : (isWechatMiniProgram() ? 'wechat_miniprogram' : 'web')
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
 * 保存二维码到相册（uniapp方式）
 */
export const saveQRCodeToAlbum = (canvasId, filename = 'qrcode.png') => {
  return new Promise((resolve, reject) => {
    if (!isUniApp()) {
      reject(new Error('当前环境不支持保存到相册'))
      return
    }
    
    // 将canvas转换为临时文件
    uni.canvasToTempFilePath({
      canvasId: canvasId,
      success: (res) => {
        // 保存到相册
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            console.log('二维码保存到相册成功')
            resolve({ success: true, filePath: res.tempFilePath })
          },
          fail: (error) => {
            console.error('保存到相册失败:', error)
            reject(new Error('保存到相册失败: ' + error.errMsg))
          }
        })
      },
      fail: (error) => {
        console.error('canvas转换失败:', error)
        reject(new Error('canvas转换失败: ' + error.errMsg))
      }
    })
  })
}

/**
 * 下载二维码（H5方式）
 */
export const downloadQRCode = (dataURL, filename = 'qrcode.png') => {
  try {
    if (typeof document === 'undefined') {
      throw new Error('当前环境不支持下载功能')
    }
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('二维码下载成功:', filename)
    return { success: true }
  } catch (error) {
    console.error('下载二维码失败:', error)
    throw new Error('下载失败: ' + error.message)
  }
}

export default {
  generateFixedDiningQRCode,
  generateSceneToken,
  generateDiningConfirmURL,
  generateWechatMiniProgramParams,
  generateQRCodeDataURL,
  generateDiningConfirmQRCode,
  generateWechatMiniProgramQRCode,
  saveQRCodeToAlbum,
  downloadQRCode
}
