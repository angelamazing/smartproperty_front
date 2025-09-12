/**
 * API缓存工具
 * 用于缓存API请求结果，减少重复请求
 */

class ApiCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 100 // 最大缓存条目数
    this.defaultTTL = 5 * 60 * 1000 // 默认5分钟过期
  }

  /**
   * 生成缓存键
   * @param {string} url 请求URL
   * @param {object} params 请求参数
   * @returns {string} 缓存键
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `${url}_${JSON.stringify(sortedParams)}`
  }

  /**
   * 获取缓存数据
   * @param {string} url 请求URL
   * @param {object} params 请求参数
   * @returns {any|null} 缓存数据或null
   */
  get(url, params = {}) {
    const key = this.generateKey(url, params)
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * 设置缓存数据
   * @param {string} url 请求URL
   * @param {object} params 请求参数
   * @param {any} data 要缓存的数据
   * @param {number} ttl 过期时间（毫秒）
   */
  set(url, params = {}, data, ttl = this.defaultTTL) {
    const key = this.generateKey(url, params)
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    })
  }

  /**
   * 删除缓存
   * @param {string} url 请求URL
   * @param {object} params 请求参数
   */
  delete(url, params = {}) {
    const key = this.generateKey(url, params)
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanExpired() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {object} 缓存统计
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let totalSize = 0

    for (const [key, value] of this.cache.entries()) {
      totalSize += JSON.stringify(value.data).length
      if (now > value.expiresAt) {
        expiredCount++
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      totalSize: totalSize,
      maxSize: this.maxSize
    }
  }
}

// 创建全局缓存实例
const apiCache = new ApiCache()

// 定期清理过期缓存
setInterval(() => {
  apiCache.cleanExpired()
}, 60000) // 每分钟清理一次

export default apiCache
