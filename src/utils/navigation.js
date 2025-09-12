/**
 * 统一导航工具函数
 * 自动判断页面类型并使用正确的导航方法
 */

// TabBar 页面列表
const TABBAR_PAGES = [
  '/pages/index/index',
  '/pages/dining/dining',
  '/pages/reservation/reservation',
  '/pages/profile/profile'
]

/**
 * 智能导航函数
 * @param {string} url 目标页面路径
 * @param {Object} options 导航选项
 * @returns {Promise} 导航结果
 */
export function smartNavigate(url, options = {}) {
  // 检查是否为 TabBar 页面
  if (TABBAR_PAGES.includes(url)) {
    return uni.switchTab({
      url,
      ...options
    })
  } else {
    return uni.navigateTo({
      url,
      ...options
    })
  }
}

/**
 * 重定向到指定页面
 * @param {string} url 目标页面路径
 * @param {Object} options 重定向选项
 * @returns {Promise} 重定向结果
 */
export function smartRedirect(url, options = {}) {
  // 检查是否为 TabBar 页面
  if (TABBAR_PAGES.includes(url)) {
    return uni.reLaunch({
      url,
      ...options
    })
  } else {
    return uni.redirectTo({
      url,
      ...options
    })
  }
}

/**
 * 重启应用到指定页面
 * @param {string} url 目标页面路径
 * @param {Object} options 重启选项
 * @returns {Promise} 重启结果
 */
export function smartReload(url, options = {}) {
  return uni.reLaunch({
    url,
    ...options
  })
}

/**
 * 检查页面是否为 TabBar 页面
 * @param {string} url 页面路径
 * @returns {boolean} 是否为 TabBar 页面
 */
export function isTabBarPage(url) {
  return TABBAR_PAGES.includes(url)
}

/**
 * 获取正确的导航方法
 * @param {string} url 页面路径
 * @returns {string} 导航方法名称
 */
export function getNavigationMethod(url) {
  return isTabBarPage(url) ? 'switchTab' : 'navigateTo'
}

export default {
  smartNavigate,
  smartRedirect,
  smartReload,
  isTabBarPage,
  getNavigationMethod
}
