/**
 * 就餐API工具类
 * 提供统一的就餐相关接口调用和错误处理
 * 
 * 这个类遵循单一职责原则，只负责API调用
 * 错误处理逻辑清晰，不会让调用者困惑
 */

class DiningApi {
  constructor() {
    this.baseURL = 'https://uauotggfeiao.sealosbja.site'
    this.timeout = 10000
  }

  /**
   * 获取请求头
   * @returns {Object} 请求头配置
   */
  getHeaders() {
    const token = uni.getStorageSync('userToken')
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * 统一的请求方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  async request(url, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      timeout: this.timeout,
      header: this.getHeaders(),
      ...options
    }

    try {
      console.log('发起请求:', config.url, config.method || 'GET')
      const response = await uni.request(config)
      
      console.log('请求响应:', response.data)
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || '请求失败'}`)
      }
    } catch (error) {
      console.error('请求失败:', error)
      throw this.handleRequestError(error)
    }
  }

  /**
   * 处理请求错误
   * @param {Error} error - 原始错误
   * @returns {Error} 处理后的错误
   */
  handleRequestError(error) {
    // 网络错误
    if (error.errMsg && error.errMsg.includes('timeout')) {
      return new Error('请求超时，请检查网络连接')
    }
    
    if (error.errMsg && error.errMsg.includes('fail')) {
      return new Error('网络请求失败，请检查网络连接')
    }
    
    // 业务错误
    if (error.message) {
      return error
    }
    
    // 未知错误
    return new Error('未知错误，请重试')
  }

  /**
   * 确认就餐
   * @param {string} orderId - 订单ID
   * @param {Object} options - 可选参数
   * @returns {Promise} 确认结果
   */
  async confirmDining(orderId, options = {}) {
    if (!orderId) {
      throw new Error('订单ID不能为空')
    }

    const data = {
      confirmationType: 'manual',
      ...options
    }

    return await this.request(`/api/dining-confirmation/manual/${orderId}`, {
      method: 'POST',
      data
    })
  }

  /**
   * 获取就餐状态
   * @param {string} date - 日期 (YYYY-MM-DD)，默认为今天
   * @returns {Promise} 就餐状态数据
   */
  async getDiningStatus(date = null) {
    const params = {}
    if (date) {
      params.date = date
    }

    const queryString = Object.keys(params).length > 0 
      ? '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
      : ''

    return await this.request(`/api/dining-confirmation/status${queryString}`, {
      method: 'GET'
    })
  }

  /**
   * 微信扫码确认就餐
   * @param {string} qrCode - 二维码标识
   * @param {string} scanTime - 扫码时间
   * @returns {Promise} 确认结果
   */
  async wechatScanConfirm(qrCode, scanTime) {
    if (!qrCode) {
      throw new Error('二维码标识不能为空')
    }

    const data = {
      qrCode,
      scanTime: scanTime || TimeUtils.getCurrentTime()
    }

    return await this.request('/api/qr-scan/wechat-scan', {
      method: 'POST',
      data
    })
  }

  /**
   * 获取用户今日餐次信息
   * @returns {Promise} 今日餐次数据
   */
  async getTodayMeals() {
    const today = TimeUtils.getCurrentDate() // YYYY-MM-DD
    return await this.getDiningStatus(today)
  }

  /**
   * 批量确认就餐
   * @param {Array} orderIds - 订单ID数组
   * @returns {Promise} 批量确认结果
   */
  async batchConfirmDining(orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('订单ID列表不能为空')
    }

    const promises = orderIds.map(orderId => this.confirmDining(orderId))
    return await Promise.allSettled(promises)
  }
}

// 导出单例实例
export default new DiningApi()
