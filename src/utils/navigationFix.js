/**
 * 导航修复工具
 * 用于检测和修复 navigateTo 跳转到 tabbar 页面的问题
 */

// TabBar 页面列表
const TABBAR_PAGES = [
  '/pages/index/index',
  '/pages/dining/dining',
  '/pages/reservation/reservation',
  '/pages/profile/profile'
]

/**
 * 检查是否为 TabBar 页面
 * @param {string} url 页面路径
 * @returns {boolean} 是否为 TabBar 页面
 */
function isTabBarPage(url) {
  if (!url) return false
  
  // 去除查询参数
  const pathWithoutQuery = url.split('?')[0]
  
  return TABBAR_PAGES.includes(pathWithoutQuery)
}

/**
 * 安全的页面跳转
 * @param {string} url 目标页面路径
 * @param {string} method 跳转方法 (navigateTo|switchTab|redirectTo|reLaunch)
 * @param {Object} options 跳转选项
 * @returns {Promise} 跳转结果
 */
function safeNavigate(url, method = 'navigateTo', options = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!url) {
        reject(new Error('URL不能为空'))
        return
      }

      // 检查是否为 TabBar 页面
      if (isTabBarPage(url) && method === 'navigateTo') {
        console.warn(`检测到使用 navigateTo 跳转到 TabBar 页面: ${url}，自动修正为 switchTab`)
        method = 'switchTab'
        
        // TabBar 页面不支持查询参数，需要去除
        url = url.split('?')[0]
      }

      const config = {
        url,
        success: (res) => {
          console.log(`页面跳转成功: ${method} -> ${url}`)
          resolve(res)
        },
        fail: (err) => {
          console.error(`页面跳转失败: ${method} -> ${url}`, err)
          
          // 如果是 navigateTo 失败且目标是 TabBar 页面，尝试使用 switchTab
          if (method === 'navigateTo' && isTabBarPage(url)) {
            console.log('尝试使用 switchTab 重新跳转...')
            uni.switchTab({
              url: url.split('?')[0],
              success: resolve,
              fail: reject
            })
          } else {
            reject(err)
          }
        },
        ...options
      }

      // 执行跳转
      switch (method) {
        case 'switchTab':
          uni.switchTab(config)
          break
        case 'redirectTo':
          uni.redirectTo(config)
          break
        case 'reLaunch':
          uni.reLaunch(config)
          break
        case 'navigateBack':
          uni.navigateBack(config)
          break
        default:
          uni.navigateTo(config)
          break
      }
    } catch (error) {
      console.error('页面跳转异常:', error)
      reject(error)
    }
  })
}

/**
 * 拦截原始的 uni.navigateTo 方法
 */
function interceptNavigateTo() {
  if (typeof uni !== 'undefined' && uni.navigateTo) {
    const originalNavigateTo = uni.navigateTo
    
    uni.navigateTo = function(options = {}) {
      const { url } = options
      
      if (isTabBarPage(url)) {
        console.warn(`拦截到 navigateTo 跳转 TabBar 页面: ${url}，自动使用 switchTab`)
        const newOptions = {
          ...options,
          url: url.split('?')[0] // 去除查询参数
        }
        return uni.switchTab(newOptions)
      }
      
      return originalNavigateTo.call(this, options)
    }
    
    console.log('已拦截 uni.navigateTo 方法，自动修复 TabBar 页面跳转问题')
  }
}

/**
 * 初始化导航修复
 */
function initNavigationFix() {
  try {
    interceptNavigateTo()
    console.log('导航修复工具初始化成功')
  } catch (error) {
    console.error('导航修复工具初始化失败:', error)
  }
}

export {
  safeNavigate,
  isTabBarPage,
  interceptNavigateTo,
  initNavigationFix,
  TABBAR_PAGES
}

export default {
  safeNavigate,
  isTabBarPage,
  interceptNavigateTo,
  initNavigationFix,
  TABBAR_PAGES
}
