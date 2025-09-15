/**
 * 全局通知管理器
 * 统一管理各种通知的显示、存储和状态
 */

class NotificationManager {
  constructor() {
    this.notifications = []
    this.maxNotifications = 10
    this.autoHideDelay = 5000
    this.isInitialized = false
    this.listeners = []
  }

  /**
   * 初始化通知管理器
   */
  init() {
    if (this.isInitialized) return
    
    this.loadNotifications()
    this.setupAutoCleanup()
    this.isInitialized = true
    
    console.log('通知管理器已初始化')
  }

  /**
   * 添加通知
   */
  addNotification(notification) {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      priority: 1,
      time: new Date().toISOString(),
      read: false,
      autoHide: true,
      actions: [],
      ...notification
    }

    // 添加到列表开头
    this.notifications.unshift(newNotification)

    // 限制最大数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    // 保存到本地存储
    this.saveNotifications()

    // 触发事件
    this.emit('notification-added', newNotification)

    // 自动隐藏
    if (newNotification.autoHide) {
      setTimeout(() => {
        this.removeNotification(id)
      }, this.autoHideDelay)
    }

    return newNotification
  }

  /**
   * 移除通知
   */
  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = this.notifications[index]
      this.notifications.splice(index, 1)
      this.saveNotifications()
      this.emit('notification-removed', notification)
    }
  }

  /**
   * 标记通知为已读
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      this.saveNotifications()
      this.emit('notification-read', notification)
    }
  }

  /**
   * 标记所有通知为已读
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
      }
    })
    this.saveNotifications()
    this.emit('all-notifications-read')
  }

  /**
   * 清除所有通知
   */
  clearAll() {
    this.notifications = []
    this.saveNotifications()
    this.emit('notifications-cleared')
  }

  /**
   * 获取未读通知数量
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  /**
   * 获取所有通知
   */
  getAllNotifications() {
    return [...this.notifications]
  }

  /**
   * 获取未读通知
   */
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read)
  }

  /**
   * 显示系统公告
   */
  showSystemNotice(notice) {
    return this.addNotification({
      type: notice.type || 'info',
      title: notice.title || '系统公告',
      content: notice.content,
      time: notice.time,
      priority: notice.priority || 1,
      actions: [
        {
          id: 'refresh',
          text: '刷新',
          type: 'primary',
          closeAfterAction: false
        },
        {
          id: 'close',
          text: '关闭',
          type: 'default',
          closeAfterAction: true
        }
      ]
    })
  }

  /**
   * 显示成功通知
   */
  showSuccess(title, content, options = {}) {
    return this.addNotification({
      type: 'success',
      title,
      content,
      priority: 1,
      ...options
    })
  }

  /**
   * 显示错误通知
   */
  showError(title, content, options = {}) {
    return this.addNotification({
      type: 'error',
      title,
      content,
      priority: 3,
      ...options
    })
  }

  /**
   * 显示警告通知
   */
  showWarning(title, content, options = {}) {
    return this.addNotification({
      type: 'warning',
      title,
      content,
      priority: 2,
      ...options
    })
  }

  /**
   * 显示信息通知
   */
  showInfo(title, content, options = {}) {
    return this.addNotification({
      type: 'info',
      title,
      content,
      priority: 1,
      ...options
    })
  }

  /**
   * 显示业务通知
   */
  showBusinessNotification(type, title, content, options = {}) {
    return this.addNotification({
      type,
      title,
      content,
      priority: 2,
      ...options
    })
  }

  /**
   * 保存通知到本地存储
   */
  saveNotifications() {
    try {
      uni.setStorageSync('notifications', this.notifications)
    } catch (error) {
      console.error('保存通知失败:', error)
    }
  }

  /**
   * 从本地存储加载通知
   */
  loadNotifications() {
    try {
      const saved = uni.getStorageSync('notifications')
      if (saved && Array.isArray(saved)) {
        this.notifications = saved
      }
    } catch (error) {
      console.error('加载通知失败:', error)
      this.notifications = []
    }
  }

  /**
   * 设置自动清理
   */
  setupAutoCleanup() {
    // 每天清理超过7天的通知
    setInterval(() => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      this.notifications = this.notifications.filter(n => 
        new Date(n.time.replace ? n.time.replace(/-/g, '/') : n.time) > sevenDaysAgo
      )
      this.saveNotifications()
    }, 24 * 60 * 60 * 1000) // 24小时
  }

  /**
   * 添加事件监听器
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback)
      if (index > -1) {
        this.listeners[event].splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('通知事件回调错误:', error)
        }
      })
    }
  }

  /**
   * 获取通知统计
   */
  getStats() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return {
      total: this.notifications.length,
      unread: this.getUnreadCount(),
      today: this.notifications.filter(n => 
        new Date(n.time.replace ? n.time.replace(/-/g, '/') : n.time) >= today
      ).length,
      byType: this.notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {})
    }
  }

  /**
   * 导出通知数据
   */
  exportNotifications() {
    return {
      notifications: this.notifications,
      stats: this.getStats(),
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 导入通知数据
   */
  importNotifications(data) {
    if (data && data.notifications && Array.isArray(data.notifications)) {
      this.notifications = data.notifications
      this.saveNotifications()
      this.emit('notifications-imported', data)
      return true
    }
    return false
  }
}

// 创建全局实例
const notificationManager = new NotificationManager()

// 自动初始化
notificationManager.init()

export default notificationManager
