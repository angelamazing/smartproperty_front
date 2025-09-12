/**
 * 二维码生成工具类
 * 基于 qrcode.js 库实现前端二维码生成
 */

import QRCode from 'qrcode'

/**
 * 二维码生成配置
 */
const DEFAULT_OPTIONS = {
  // 二维码尺寸
  width: 256,
  height: 256,
  // 容错级别
  errorCorrectionLevel: 'M',
  // 边距
  margin: 2,
  // 颜色配置
  color: {
    dark: '#000000',  // 前景色（二维码颜色）
    light: '#FFFFFF'  // 背景色
  },
  // 输出格式
  type: 'image/png',
  // 质量
  quality: 0.92
}

/**
 * 二维码生成器类
 */
class QRCodeGenerator {
  constructor() {
    this.options = { ...DEFAULT_OPTIONS }
  }

  /**
   * 生成二维码
   * @param {string} text - 要编码的文本
   * @param {Object} options - 生成选项
   * @returns {Promise<string>} - 返回base64格式的图片数据
   */
  async generateQRCode(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('二维码内容不能为空')
      }

      const config = { ...this.options, ...options }
      
      // 生成二维码
      const qrCodeDataURL = await QRCode.toDataURL(text, config)
      
      return qrCodeDataURL
    } catch (error) {
      console.error('二维码生成失败:', error)
      throw new Error(`二维码生成失败: ${error.message}`)
    }
  }

  /**
   * 生成二维码并返回Canvas元素
   * @param {string} text - 要编码的文本
   * @param {Object} options - 生成选项
   * @returns {Promise<HTMLCanvasElement>} - 返回Canvas元素
   */
  async generateQRCodeCanvas(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('二维码内容不能为空')
      }

      const config = { ...this.options, ...options }
      
      // 创建Canvas元素
      const canvas = document.createElement('canvas')
      
      // 生成二维码到Canvas
      await QRCode.toCanvas(canvas, text, config)
      
      return canvas
    } catch (error) {
      console.error('二维码Canvas生成失败:', error)
      throw new Error(`二维码Canvas生成失败: ${error.message}`)
    }
  }

  /**
   * 生成SVG格式的二维码
   * @param {string} text - 要编码的文本
   * @param {Object} options - 生成选项
   * @returns {Promise<string>} - 返回SVG字符串
   */
  async generateQRCodeSVG(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('二维码内容不能为空')
      }

      const config = { ...this.options, ...options }
      
      // 生成SVG格式的二维码
      const qrCodeSVG = await QRCode.toString(text, { ...config, type: 'svg' })
      
      return qrCodeSVG
    } catch (error) {
      console.error('二维码SVG生成失败:', error)
      throw new Error(`二维码SVG生成失败: ${error.message}`)
    }
  }

  /**
   * 下载二维码图片
   * @param {string} dataURL - base64格式的图片数据
   * @param {string} filename - 文件名
   */
  downloadQRCode(dataURL, filename = 'qrcode.png') {
    try {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = dataURL
      link.download = filename
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log(`二维码已下载: ${filename}`)
    } catch (error) {
      console.error('二维码下载失败:', error)
      throw new Error(`二维码下载失败: ${error.message}`)
    }
  }

  /**
   * 设置默认配置
   * @param {Object} options - 配置选项
   */
  setOptions(options) {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取默认配置
   * @returns {Object} - 当前配置
   */
  getOptions() {
    return { ...this.options }
  }

  /**
   * 重置为默认配置
   */
  resetOptions() {
    this.options = { ...DEFAULT_OPTIONS }
  }

  /**
   * 预设样式配置
   */
  static getPresetStyles() {
    return {
      // 默认样式
      default: {
        color: { dark: '#000000', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 蓝色主题
      blue: {
        color: { dark: '#2196F3', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 绿色主题
      green: {
        color: { dark: '#4CAF50', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 红色主题
      red: {
        color: { dark: '#f44336', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 橙色主题
      orange: {
        color: { dark: '#FF9800', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 紫色主题
      purple: {
        color: { dark: '#9C27B0', light: '#FFFFFF' },
        width: 256,
        height: 256
      },
      
      // 大尺寸
      large: {
        width: 512,
        height: 512,
        margin: 4
      },
      
      // 小尺寸
      small: {
        width: 128,
        height: 128,
        margin: 1
      },
      
      // 高容错
      highErrorCorrection: {
        errorCorrectionLevel: 'H',
        margin: 4
      },
      
      // 低容错
      lowErrorCorrection: {
        errorCorrectionLevel: 'L',
        margin: 1
      }
    }
  }

  /**
   * 应用预设样式
   * @param {string} styleName - 样式名称
   */
  applyPresetStyle(styleName) {
    const presets = QRCodeGenerator.getPresetStyles()
    if (presets[styleName]) {
      this.setOptions(presets[styleName])
      return true
    }
    return false
  }

  /**
   * 验证二维码内容
   * @param {string} text - 要验证的文本
   * @returns {Object} - 验证结果
   */
  validateQRCodeContent(text) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    if (!text) {
      result.isValid = false
      result.errors.push('二维码内容不能为空')
      return result
    }

    if (typeof text !== 'string') {
      result.isValid = false
      result.errors.push('二维码内容必须是字符串')
      return result
    }

    // 检查长度
    if (text.length > 2953) {
      result.warnings.push('二维码内容过长，可能影响识别效果')
    }

    // 检查特殊字符
    if (/[^\x00-\x7F]/.test(text)) {
      result.warnings.push('包含非ASCII字符，建议使用UTF-8编码')
    }

    return result
  }

  /**
   * 批量生成二维码
   * @param {Array} items - 二维码项目数组
   * @param {Object} options - 生成选项
   * @returns {Promise<Array>} - 返回生成结果数组
   */
  async generateBatchQRCodes(items, options = {}) {
    try {
      const results = []
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const result = {
          index: i,
          text: item.text,
          filename: item.filename || `qrcode_${i + 1}.png`,
          success: false,
          dataURL: null,
          error: null
        }

        try {
          result.dataURL = await this.generateQRCode(item.text, options)
          result.success = true
        } catch (error) {
          result.error = error.message
        }

        results.push(result)
      }

      return results
    } catch (error) {
      console.error('批量生成二维码失败:', error)
      throw new Error(`批量生成二维码失败: ${error.message}`)
    }
  }
}

// 创建默认实例
const qrCodeGenerator = new QRCodeGenerator()

// 导出实例和类
export default qrCodeGenerator
export { QRCodeGenerator }

// 导出便捷方法
export const generateQRCode = (text, options) => qrCodeGenerator.generateQRCode(text, options)
export const generateQRCodeCanvas = (text, options) => qrCodeGenerator.generateQRCodeCanvas(text, options)
export const generateQRCodeSVG = (text, options) => qrCodeGenerator.generateQRCodeSVG(text, options)
export const downloadQRCode = (dataURL, filename) => qrCodeGenerator.downloadQRCode(dataURL, filename)
export const getPresetStyles = () => QRCodeGenerator.getPresetStyles()
