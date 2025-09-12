// 图标配置文件
export const icons = {
  // TabBar 图标
  tabBar: {
    home: {
      normal: '/static/icons/home.svg',
      active: '/static/icons/home-active.svg'
    },
    dining: {
      normal: '/static/icons/dining.svg',
      active: '/static/icons/dining-active.svg'
    },
    reservation: {
      normal: '/static/icons/reservation.svg',
      active: '/static/icons/reservation-active.svg'
    },
    profile: {
      normal: '/static/icons/profile.svg',
      active: '/static/icons/profile-active.svg'
    }
  },
  
  // 功能模块图标
  functions: {
    dining: '🍽️',
    special: '📅',
    reservation: '🏸',
    verification: '✅'
  },
  
  // 统计图标
  stats: {
    dining: '🍽️',
    reservation: '🏸',
    verification: '✅',
    menu: '📋'
  },
  
  // 活动图标
  activities: {
    dining: '🍽️',
    reservation: '🏸',
    verification: '✅',
    system: '⚙️'
  }
}

// 获取TabBar图标
export function getTabBarIcon(name, isActive = false) {
  const icon = icons.tabBar[name]
  if (!icon) return ''
  return isActive ? icon.active : icon.normal
}

// 获取功能图标
export function getFunctionIcon(name) {
  return icons.functions[name] || '📋'
}

// 获取统计图标
export function getStatsIcon(name) {
  return icons.stats[name] || '📊'
}

// 获取活动图标
export function getActivityIcon(name) {
  return icons.activities[name] || '📋'
}
