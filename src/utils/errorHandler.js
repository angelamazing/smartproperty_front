/**
 * 错误处理工具类
 * 统一处理各种错误类型，提供用户友好的错误信息
 * 
 * 这个类遵循单一职责原则，只负责错误处理
 * 不会让调用者困惑，错误信息清晰明确
 */

export const ErrorTypes = {
  TIME_INVALID: 'TIME_INVALID',           // 时间不在就餐时间内
  ALREADY_CONFIRMED: 'ALREADY_CONFIRMED', // 已确认就餐
  ORDER_CANCELLED: 'ORDER_CANCELLED',     // 订单已取消
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',     // 订单不存在
  PERMISSION_DENIED: 'PERMISSION_DENIED', // 权限不足
  NETWORK_ERROR: 'NETWORK_ERROR',         // 网络错误
  SERVER_ERROR: 'SERVER_ERROR',           // 服务器错误
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',       // 需要登录
  INVALID_PARAMS: 'INVALID_PARAMS'        // 参数无效
}

export class DiningError extends Error {
  constructor(message, type, details = null) {
    super(message)
    this.name = 'DiningError'
    this.type = type
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

class ErrorHandler {
  /**
   * 处理就餐相关错误
   * @param {Error} error - 原始错误
   * @returns {DiningError} 处理后的错误
   */
  handleDiningError(error) {
    const message = error.message || '未知错误'
    const details = error.details || {}
    const response = error.response || {}
    
    // 检查服务器返回的详细错误信息
    const serverMessage = response.message || details.message || ''
    const serverCode = response.code || details.code || ''
    
    // 时间相关错误 - 扩展匹配规则
    if (message.includes('时间不在') || message.includes('不在就餐时间内') || 
        message.includes('不在当前时间') || message.includes('时间限制') ||
        serverMessage.includes('时间不在') || serverMessage.includes('不在就餐时间内') ||
        serverMessage.includes('不在当前时间') || serverMessage.includes('时间限制') ||
        serverCode === 'TIME_INVALID' || serverCode === 'TIME_LIMIT') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.TIME_INVALID, details)
    }
    
    // 已确认错误
    if (message.includes('已确认') || message.includes('already confirmed') ||
        serverMessage.includes('已确认') || serverMessage.includes('already confirmed') ||
        serverCode === 'ALREADY_CONFIRMED') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.ALREADY_CONFIRMED, details)
    }
    
    // 订单取消错误
    if (message.includes('已取消') || message.includes('cancelled') ||
        serverMessage.includes('已取消') || serverMessage.includes('cancelled') ||
        serverCode === 'ORDER_CANCELLED') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.ORDER_CANCELLED, details)
    }
    
    // 订单不存在错误
    if (message.includes('不存在') || message.includes('not found') ||
        serverMessage.includes('不存在') || serverMessage.includes('not found') ||
        serverCode === 'ORDER_NOT_FOUND') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.ORDER_NOT_FOUND, details)
    }
    
    // 权限错误
    if (message.includes('权限') || message.includes('permission') || message.includes('unauthorized') ||
        serverMessage.includes('权限') || serverMessage.includes('permission') || serverMessage.includes('unauthorized') ||
        serverCode === 'PERMISSION_DENIED') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.PERMISSION_DENIED, details)
    }
    
    // 登录错误
    if (message.includes('登录') || message.includes('login') || message.includes('token') ||
        serverMessage.includes('登录') || serverMessage.includes('login') || serverMessage.includes('token') ||
        serverCode === 'LOGIN_REQUIRED') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.LOGIN_REQUIRED, details)
    }
    
    // 参数错误
    if (message.includes('参数') || message.includes('parameter') || message.includes('invalid') ||
        serverMessage.includes('参数') || serverMessage.includes('parameter') || serverMessage.includes('invalid') ||
        serverCode === 'INVALID_PARAMS') {
      return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.INVALID_PARAMS, details)
    }
    
    // 网络错误
    if (error.errMsg && (error.errMsg.includes('timeout') || error.errMsg.includes('fail'))) {
      return new DiningError('网络连接失败，请检查网络后重试', ErrorTypes.NETWORK_ERROR, details)
    }
    
    // 服务器错误
    return new DiningError(this.buildDetailedMessage(message, serverMessage, details), ErrorTypes.SERVER_ERROR, details)
  }

  /**
   * 构建详细的错误信息
   * @param {string} baseMessage - 基础错误信息
   * @param {string} serverMessage - 服务器错误信息
   * @param {Object} details - 错误详情
   * @returns {string} 详细的错误信息
   */
  buildDetailedMessage(baseMessage, serverMessage, details) {
    let message = baseMessage
    
    // 如果服务器有更详细的信息，使用服务器的信息
    if (serverMessage && serverMessage !== baseMessage) {
      message = serverMessage
    }
    
    // 添加时间信息（如果是时间相关错误）
    if (details.currentTime || details.mealTime) {
      const timeInfo = []
      if (details.currentTime) {
        timeInfo.push(`当前时间: ${details.currentTime}`)
      }
      if (details.mealTime) {
        timeInfo.push(`就餐时间: ${details.mealTime}`)
      }
      if (timeInfo.length > 0) {
        message += ` (${timeInfo.join(', ')})`
      }
    }
    
    // 添加餐次信息
    if (details.mealType || details.mealName) {
      const mealInfo = []
      if (details.mealType) {
        mealInfo.push(`餐次: ${details.mealType}`)
      }
      if (details.mealName) {
        mealInfo.push(`餐名: ${details.mealName}`)
      }
      if (mealInfo.length > 0) {
        message += ` (${mealInfo.join(', ')})`
      }
    }
    
    return message
  }

  /**
   * 获取错误图标
   * @param {string} errorType - 错误类型
   * @returns {string} 错误图标
   */
  getErrorIcon(errorType) {
    const iconMap = {
      [ErrorTypes.TIME_INVALID]: '⏰',
      [ErrorTypes.ALREADY_CONFIRMED]: '✅',
      [ErrorTypes.ORDER_CANCELLED]: '❌',
      [ErrorTypes.ORDER_NOT_FOUND]: '❓',
      [ErrorTypes.PERMISSION_DENIED]: '🔒',
      [ErrorTypes.NETWORK_ERROR]: '📶',
      [ErrorTypes.SERVER_ERROR]: '⚠️',
      [ErrorTypes.LOGIN_REQUIRED]: '🔐',
      [ErrorTypes.INVALID_PARAMS]: '📝'
    }
    return iconMap[errorType] || '⚠️'
  }

  /**
   * 获取错误标题
   * @param {string} errorType - 错误类型
   * @returns {string} 错误标题
   */
  getErrorTitle(errorType) {
    const titleMap = {
      [ErrorTypes.TIME_INVALID]: '时间限制',
      [ErrorTypes.ALREADY_CONFIRMED]: '已确认',
      [ErrorTypes.ORDER_CANCELLED]: '订单取消',
      [ErrorTypes.ORDER_NOT_FOUND]: '订单不存在',
      [ErrorTypes.PERMISSION_DENIED]: '权限不足',
      [ErrorTypes.NETWORK_ERROR]: '网络错误',
      [ErrorTypes.SERVER_ERROR]: '服务器错误',
      [ErrorTypes.LOGIN_REQUIRED]: '需要登录',
      [ErrorTypes.INVALID_PARAMS]: '参数错误'
    }
    return titleMap[errorType] || '操作失败'
  }

  /**
   * 获取用户友好的错误信息
   * @param {DiningError} error - 错误对象
   * @returns {string} 用户友好的错误信息
   */
  getUserFriendlyMessage(error) {
    // 如果错误信息已经包含详细信息，直接使用
    if (error.message && (error.message.includes('当前时间') || error.message.includes('就餐时间') || 
        error.message.includes('餐次') || error.message.includes('餐名'))) {
      return error.message
    }
    
    const messageMap = {
      [ErrorTypes.TIME_INVALID]: '当前时间不在就餐时间内，请稍后再试',
      [ErrorTypes.ALREADY_CONFIRMED]: '该餐次已确认就餐，无需重复确认',
      [ErrorTypes.ORDER_CANCELLED]: '该订单已取消，无法确认就餐',
      [ErrorTypes.ORDER_NOT_FOUND]: '未找到相关订单，请检查后重试',
      [ErrorTypes.PERMISSION_DENIED]: '权限不足，请联系管理员',
      [ErrorTypes.NETWORK_ERROR]: '网络连接失败，请检查网络后重试',
      [ErrorTypes.SERVER_ERROR]: '服务器繁忙，请稍后重试',
      [ErrorTypes.LOGIN_REQUIRED]: '请先登录后再进行操作',
      [ErrorTypes.INVALID_PARAMS]: '参数错误，请检查输入信息'
    }
    
    return messageMap[error.type] || error.message
  }

  /**
   * 检查是否可重试
   * @param {string} errorType - 错误类型
   * @returns {boolean} 是否可重试
   */
  isRetryable(errorType) {
    const retryableTypes = [
      ErrorTypes.NETWORK_ERROR,
      ErrorTypes.SERVER_ERROR
    ]
    return retryableTypes.includes(errorType)
  }

  /**
   * 显示错误提示
   * @param {DiningError} error - 错误对象
   * @param {Object} options - 显示选项
   */
  showErrorToast(error, options = {}) {
    const message = this.getUserFriendlyMessage(error)
    const duration = options.duration || 3000
    const icon = options.icon || 'error'
    
    uni.showToast({
      title: message,
      icon,
      duration
    })
  }

  /**
   * 显示错误对话框
   * @param {DiningError} error - 错误对象
   * @param {Object} options - 显示选项
   * @returns {Promise<boolean>} 用户是否选择重试
   */
  showErrorDialog(error, options = {}) {
    return new Promise((resolve) => {
      const title = this.getErrorTitle(error.type)
      const message = this.getUserFriendlyMessage(error)
      const showCancel = this.isRetryable(error.type)
      
      uni.showModal({
        title,
        content: message,
        showCancel,
        cancelText: '取消',
        confirmText: showCancel ? '重试' : '确定',
        success: (res) => {
          if (showCancel) {
            resolve(res.confirm)
          } else {
            resolve(false)
          }
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  /**
   * 记录错误日志
   * @param {DiningError} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  logError(error, context = {}) {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        type: error.type,
        timestamp: error.timestamp,
        stack: error.stack
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location?.href
    }
    
    console.error('Dining Error:', logData)
    
    // 这里可以发送到错误监控服务
    // this.sendToErrorService(logData)
  }

  /**
   * 处理并显示错误
   * @param {Error} error - 原始错误
   * @param {Object} options - 处理选项
   * @returns {Promise<boolean>} 是否重试
   */
  async handleAndShowError(error, options = {}) {
    const diningError = this.handleDiningError(error)
    
    // 记录错误日志
    this.logError(diningError, options.context)
    
    // 显示错误提示
    if (options.showDialog) {
      return await this.showErrorDialog(diningError, options)
    } else {
      this.showErrorToast(diningError, options)
      return false
    }
  }
}

// 导出单例实例
export default new ErrorHandler()
