/**
 * 现代化系统信息工具类
 * 替代过时的 wx.getSystemInfoSync API
 * 使用新的分类API：wx.getSystemSetting、wx.getDeviceInfo、wx.getWindowInfo、wx.getAppBaseInfo
 * 
 * @author Linus Torvalds Style Implementation
 * @date 2024-12-19
 */

/**
 * 系统信息缓存
 * 避免重复调用API，提升性能
 */
let systemInfoCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

/**
 * 检查是否为微信小程序环境
 * 使用更可靠的检测方法
 */
export function isWechatMiniProgram() {
  try {
    // 检查微信小程序特有的全局对象和API
    return typeof wx !== 'undefined' && 
           typeof wx.getAppBaseInfo === 'function' &&
           typeof wx.getDeviceInfo === 'function'
  } catch (error) {
    console.warn('[SystemInfo] 微信小程序环境检测失败:', error)
    return false
  }
}

/**
 * 检查是否为uni-app环境
 */
export function isUniAppEnvironment() {
  try {
    return typeof uni !== 'undefined' && 
           typeof uni.getSystemInfoSync === 'function'
  } catch (error) {
    console.warn('[SystemInfo] uni-app环境检测失败:', error)
    return false
  }
}

/**
 * 获取设备信息
 * 替代 wx.getSystemInfoSync() 中的设备相关信息
 */
export function getDeviceInfo() {
  if (!isWechatMiniProgram()) {
    console.warn('[SystemInfo] 非微信小程序环境，无法获取设备信息')
    return null
  }

  try {
    return wx.getDeviceInfo()
  } catch (error) {
    console.error('[SystemInfo] 获取设备信息失败:', error)
    // 兜底方案：尝试使用旧API
    try {
      const oldInfo = wx.getSystemInfoSync()
      return {
        platform: oldInfo.platform,
        system: oldInfo.system,
        devicePixelRatio: oldInfo.devicePixelRatio,
        benchmarkLevel: oldInfo.benchmarkLevel || -1
      }
    } catch (fallbackError) {
      console.error('[SystemInfo] 兜底方案也失败:', fallbackError)
      return null
    }
  }
}

/**
 * 获取窗口信息
 * 替代 wx.getSystemInfoSync() 中的窗口相关信息
 */
export function getWindowInfo() {
  if (!isWechatMiniProgram()) {
    console.warn('[SystemInfo] 非微信小程序环境，无法获取窗口信息')
    return null
  }

  try {
    return wx.getWindowInfo()
  } catch (error) {
    console.error('[SystemInfo] 获取窗口信息失败:', error)
    // 兜底方案：尝试使用旧API
    try {
      const oldInfo = wx.getSystemInfoSync()
      return {
        windowWidth: oldInfo.windowWidth,
        windowHeight: oldInfo.windowHeight,
        screenWidth: oldInfo.screenWidth,
        screenHeight: oldInfo.screenHeight,
        statusBarHeight: oldInfo.statusBarHeight,
        safeArea: oldInfo.safeArea
      }
    } catch (fallbackError) {
      console.error('[SystemInfo] 兜底方案也失败:', fallbackError)
      return null
    }
  }
}

/**
 * 获取应用基础信息
 * 替代 wx.getSystemInfoSync() 中的应用相关信息
 */
export function getAppBaseInfo() {
  if (!isWechatMiniProgram()) {
    console.warn('[SystemInfo] 非微信小程序环境，无法获取应用信息')
    return null
  }

  try {
    return wx.getAppBaseInfo()
  } catch (error) {
    console.error('[SystemInfo] 获取应用信息失败:', error)
    // 兜底方案：尝试使用旧API
    try {
      const oldInfo = wx.getSystemInfoSync()
      return {
        SDKVersion: oldInfo.SDKVersion,
        version: oldInfo.version,
        language: oldInfo.language,
        theme: oldInfo.theme
      }
    } catch (fallbackError) {
      console.error('[SystemInfo] 兜底方案也失败:', fallbackError)
      return null
    }
  }
}

/**
 * 获取系统设置信息
 * 替代 wx.getSystemInfoSync() 中的系统设置相关信息
 */
export function getSystemSetting() {
  if (!isWechatMiniProgram()) {
    console.warn('[SystemInfo] 非微信小程序环境，无法获取系统设置')
    return null
  }

  try {
    return wx.getSystemSetting()
  } catch (error) {
    console.error('[SystemInfo] 获取系统设置失败:', error)
    // 兜底方案：返回默认设置
    return {
      bluetoothEnabled: false,
      locationEnabled: false,
      wifiEnabled: false,
      deviceOrientation: 'portrait'
    }
  }
}

/**
 * 获取完整的系统信息
 * 整合所有新API的信息，提供与旧API相似的接口
 */
export function getCompleteSystemInfo(useCache = true) {
  // 检查缓存
  if (useCache && systemInfoCache && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return systemInfoCache
  }

  let completeInfo = {}

  if (isWechatMiniProgram()) {
    // 使用新的分类API
    const deviceInfo = getDeviceInfo()
    const windowInfo = getWindowInfo()
    const appInfo = getAppBaseInfo()
    const systemSetting = getSystemSetting()

    completeInfo = {
      // 设备信息
      ...(deviceInfo || {}),
      // 窗口信息
      ...(windowInfo || {}),
      // 应用信息
      ...(appInfo || {}),
      // 系统设置
      ...(systemSetting || {}),
      // 元信息
      _source: 'modern-api',
      _timestamp: Date.now()
    }
  } else if (isUniAppEnvironment()) {
    // uni-app环境使用uni.getSystemInfoSync
    try {
      completeInfo = {
        ...uni.getSystemInfoSync(),
        _source: 'uni-app',
        _timestamp: Date.now()
      }
    } catch (error) {
      console.error('[SystemInfo] uni-app获取系统信息失败:', error)
      completeInfo = {
        _source: 'fallback',
        _timestamp: Date.now(),
        _error: error.message
      }
    }
  } else {
    // Web环境或其他环境
    completeInfo = {
      platform: 'web',
      system: navigator.userAgent || 'unknown',
      windowWidth: window.innerWidth || 375,
      windowHeight: window.innerHeight || 667,
      language: navigator.language || 'zh_CN',
      _source: 'web',
      _timestamp: Date.now()
    }
  }

  // 更新缓存
  if (useCache) {
    systemInfoCache = completeInfo
    cacheTimestamp = Date.now()
  }

  return completeInfo
}

/**
 * 检查是否为iOS平台
 * 提供向后兼容的方法
 */
export function isIOSPlatform() {
  try {
    if (isWechatMiniProgram()) {
      const deviceInfo = getDeviceInfo()
      return deviceInfo?.platform === 'ios'
    } else if (isUniAppEnvironment()) {
      const systemInfo = uni.getSystemInfoSync()
      return systemInfo.platform === 'ios'
    } else {
      // Web环境检测
      return /iPad|iPhone|iPod/.test(navigator.userAgent)
    }
  } catch (error) {
    console.error('[SystemInfo] iOS平台检测失败:', error)
    return false
  }
}

/**
 * 检查是否为Android平台
 */
export function isAndroidPlatform() {
  try {
    if (isWechatMiniProgram()) {
      const deviceInfo = getDeviceInfo()
      return deviceInfo?.platform === 'android'
    } else if (isUniAppEnvironment()) {
      const systemInfo = uni.getSystemInfoSync()
      return systemInfo.platform === 'android'
    } else {
      // Web环境检测
      return /Android/.test(navigator.userAgent)
    }
  } catch (error) {
    console.error('[SystemInfo] Android平台检测失败:', error)
    return false
  }
}

/**
 * 获取简化的环境信息字符串
 * 用于日志记录和调试
 */
export function getEnvironmentString() {
  try {
    const systemInfo = getCompleteSystemInfo()
    const platform = systemInfo.platform || 'unknown'
    const system = systemInfo.system || 'unknown'
    const source = systemInfo._source || 'unknown'
    
    return `${platform} ${system} (${source})`
  } catch (error) {
    console.error('[SystemInfo] 获取环境字符串失败:', error)
    return 'unknown environment'
  }
}

/**
 * 清除系统信息缓存
 * 在需要强制刷新系统信息时调用
 */
export function clearSystemInfoCache() {
  systemInfoCache = null
  cacheTimestamp = 0
}

/**
 * 获取性能基准信息
 * 用于判断设备性能等级
 */
export function getDevicePerformanceLevel() {
  try {
    if (isWechatMiniProgram()) {
      const deviceInfo = getDeviceInfo()
      return {
        benchmarkLevel: deviceInfo?.benchmarkLevel || -1,
        devicePixelRatio: deviceInfo?.devicePixelRatio || 1,
        isHighPerformance: (deviceInfo?.benchmarkLevel || 0) >= 50
      }
    } else {
      // 其他环境的性能检测
      const pixelRatio = window.devicePixelRatio || 1
      const memoryInfo = navigator.deviceMemory || 4
      
      return {
        benchmarkLevel: memoryInfo * 10, // 简单估算
        devicePixelRatio: pixelRatio,
        isHighPerformance: memoryInfo >= 4 && pixelRatio >= 2
      }
    }
  } catch (error) {
    console.error('[SystemInfo] 获取设备性能信息失败:', error)
    return {
      benchmarkLevel: -1,
      devicePixelRatio: 1,
      isHighPerformance: false
    }
  }
}

// 默认导出主要功能
export default {
  isWechatMiniProgram,
  isUniAppEnvironment,
  getDeviceInfo,
  getWindowInfo,
  getAppBaseInfo,
  getSystemSetting,
  getCompleteSystemInfo,
  isIOSPlatform,
  isAndroidPlatform,
  getEnvironmentString,
  clearSystemInfoCache,
  getDevicePerformanceLevel
}
