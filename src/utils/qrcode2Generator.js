/**
 * 基于 qrcode2 的二维码生成器
 * 解决长字符串显示模糊和报错问题
 * 参考：https://www.cnblogs.com/whkl-m/p/10797776.html
 */

// 动态导入 qrcode2
let QRCode = null

// 初始化 QRCode2 库
const initQRCode2 = async () => {
  if (!QRCode) {
    try {
      // 在 uniapp 中使用动态导入
      const qrcode2Module = await import('qrcode2')
      QRCode = qrcode2Module.default || qrcode2Module
    } catch (error) {
      console.error('QRCode2库加载失败:', error)
      throw new Error('二维码生成库加载失败')
    }
  }
  return QRCode
}

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
 * 检查是否在 Web 环境
 */
const isWeb = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
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
      baseURL = '',
      scale = 5 // 放大倍数，解决模糊问题
    } = options
    
    // 生成固定的二维码内容
    const timestamp = Date.now()
    const qrContent = `${FIXED_QR_CODE_ID}_${timestamp}`
    
    // 在 Web 环境中，使用 qrcode2 生成高质量二维码
    if (isWeb()) {
      try {
        const QRCode = await initQRCode2()
        
        // 创建临时容器
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        document.body.appendChild(tempContainer)
        
        // 生成二维码（放大5倍解决模糊问题）
        const qrCode = new QRCode(tempContainer, {
          text: qrContent,
          width: width * scale,
          height: width * scale,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.Q // 使用 Q 级别避免长字符串报错
        })
        
        // 等待二维码生成完成
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
        
        // 获取 canvas 元素
        const canvas = tempContainer.querySelector('canvas')
        const dataURL = canvas.toDataURL('image/png')
        
        // 清理临时容器
        document.body.removeChild(tempContainer)
        
        return {
          success: true,
          data: {
            qrCodeImage: dataURL,
            content: qrContent,
            qrCodeId: FIXED_QR_CODE_ID,
            timestamp: timestamp,
            type: 'fixed_dining_confirm',
            platform: 'web',
            scale: scale,
            originalWidth: width,
            originalHeight: width,
            actualWidth: width * scale,
            actualHeight: width * scale
          }
        }
      } catch (error) {
        console.warn('qrcode2 生成失败，使用简化方案:', error)
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
    }
    
    // 在 uniapp 环境中，使用原生方式
    if (isUniApp()) {
      console.log('uniapp环境，生成固定二维码内容:', qrContent)
      return {
        success: true,
        data: {
          qrCodeImage: qrContent,
          content: qrContent,
          qrCodeId: FIXED_QR_CODE_ID,
          timestamp: timestamp,
          type: 'fixed_dining_confirm',
          platform: 'uniapp',
          canvasId: `qrcode_${timestamp}`,
          size: `${width}rpx`,
          options: {
            useDynamicSize: false,
            errorCorrectLevel: 'Q',
            margin: margin,
            areaColor: "#fff"
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
    
    // 默认返回内容
    return {
      success: true,
      data: {
        qrCodeImage: qrContent,
        content: qrContent,
        qrCodeId: FIXED_QR_CODE_ID,
        timestamp: timestamp,
        type: 'fixed_dining_confirm',
        platform: 'unknown',
        fallback: true
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
 * 生成二维码数据URL（qrcode2版本）
 */
export const generateQRCodeDataURL = async (content, options = {}) => {
  try {
    const {
      width = 300,
      height = 300,
      scale = 5,
      correctLevel = 'Q'
    } = options
    
    // 在 Web 环境中，使用 qrcode2 生成高质量二维码
    if (isWeb()) {
      try {
        const QRCode = await initQRCode2()
        
        // 创建临时容器
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        document.body.appendChild(tempContainer)
        
        // 生成二维码（放大解决模糊问题）
        const qrCode = new QRCode(tempContainer, {
          text: content,
          width: width * scale,
          height: height * scale,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel[correctLevel] || QRCode.CorrectLevel.Q
        })
        
        // 等待二维码生成完成
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
        
        // 获取 canvas 元素
        const canvas = tempContainer.querySelector('canvas')
        const dataURL = canvas.toDataURL('image/png')
        
        // 清理临时容器
        document.body.removeChild(tempContainer)
        
        return dataURL
      } catch (error) {
        console.warn('qrcode2 生成失败，返回原始内容:', error)
        return content
      }
    }
    
    // 在 uniapp 环境中，返回内容用于 canvas 渲染
    if (isUniApp()) {
      console.log('uniapp环境，返回二维码内容用于canvas渲染:', content)
      return {
        content: content,
        canvasId: `qrcode_${Date.now()}`,
        size: `${width}rpx`,
        options: {
          useDynamicSize: false,
          errorCorrectLevel: correctLevel,
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
    
    // 默认返回内容
    return content
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
      height = 300,
      margin = 2,
      scale = 5,
      includeURL = true
    } = options
    
    let content
    if (includeURL) {
      content = generateDiningConfirmURL(sceneToken, baseURL)
    } else {
      content = sceneToken
    }
    
    const qrData = await generateQRCodeDataURL(content, { 
      width, 
      height, 
      margin, 
      scale 
    })
    
    return {
      success: true,
      data: {
        qrCodeImage: qrData,
        content: content,
        sceneToken: sceneToken,
        type: includeURL ? 'url' : 'token',
        platform: isWeb() ? 'web' : (isUniApp() ? 'uniapp' : (isWechatMiniProgram() ? 'wechat_miniprogram' : 'unknown')),
        scale: scale
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
      height = 300,
      margin = 2,
      scale = 5
    } = options
    
    const content = generateWechatMiniProgramParams(sceneToken)
    const qrData = await generateQRCodeDataURL(content, { 
      width, 
      height, 
      margin, 
      scale 
    })
    
    return {
      success: true,
      data: {
        qrCodeImage: qrData,
        content: content,
        sceneToken: sceneToken,
        type: 'wechat_miniprogram',
        platform: isWeb() ? 'web' : (isUniApp() ? 'uniapp' : (isWechatMiniProgram() ? 'wechat_miniprogram' : 'unknown')),
        scale: scale
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
    if (!isWeb()) {
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
