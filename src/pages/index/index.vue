<template>
  <view class="index-container">
    <!-- 顶部系统信息区域 -->
    <view class="system-header">
      <view class="header-content">
        <view class="logo-section">
          <image class="system-logo" src="/static/icon.png" mode="aspectFit"></image>
          <view class="logo-text">
            <text class="logo-title">湖北地质</text>
            <text class="logo-subtitle">HUBEI GEOLOGY</text>
          </view>
        </view>
        <view class="system-info">
          <text class="system-title">智慧物业管理系统</text>
          <text class="system-subtitle">湖北省地质局第三地质大队</text>
        </view>
      </view>
    </view>

    <!-- 顶部用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <!-- 使用    UserAvatar,组件 -->
        <UserAvatar 
          :user="userInfo" 
          size="large"
        />
        <view class="user-details">
          <text class="user-name">{{ userInfo.nickName || '未登录用户' }}</text>
          <text class="user-role">{{ getRoleText(userInfo.role) }}</text>
        </view>
      </view>
      <view class="user-actions">
        <button class="action-btn" @click="goToProfile">
          <text class="action-icon">👤</text>
        </button>
        <!-- 头像上传按钮 -->
        <button class="action-btn" @click="changeAvatar">
          <text class="action-icon">📷</text>
        </button>
      </view>
    </view>

    <!-- 系统概览统计 -->
    <view class="stats-section">
      <view class="stats-title">
        <text class="title-text">今日概览</text>
        <text class="title-date">{{ todayDate }}</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item" @click="goToDining">
          <view class="stat-icon dining">🍽️</view>
          <view class="stat-content">
            <text class="stat-number">{{ todayStats.diningCount || 0 }}</text>
            <text class="stat-label">今日报餐</text>
          </view>
        </view>
        <view class="stat-item" @click="goToReservation">
          <view class="stat-icon reservation">🏸</view>
          <view class="stat-content">
            <text class="stat-number">{{ todayStats.reservationCount || 0 }}</text>
            <text class="stat-label">今日预约</text>
          </view>
        </view>
        <view class="stat-item" @click="goToVerification">
          <view class="stat-icon verification">✅</view>
          <view class="stat-content">
            <text class="stat-number">{{ todayStats.verificationCount || 0 }}</text>
            <text class="stat-label">用餐验证</text>
          </view>
        </view>
        <view class="stat-item" @click="goToDining">
          <view class="stat-icon menu">📋</view>
          <view class="stat-content">
            <text class="stat-number">{{ todayStats.menuCount || 0 }}</text>
            <text class="stat-label">今日菜单</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷功能入口 -->
    <view class="quick-functions">
      <view class="section-title">
        <text class="title-text">快捷功能</text>
      </view>
      <view class="function-grid">
        <view class="function-item" @click="goToDining">
          <view class="function-icon dining">🍽️</view>
          <text class="function-name">日常报餐</text>
          <text class="function-desc">部门批量报餐</text>
        </view>
        <view class="function-item" @click="goToVisitorReservation">
          <view class="function-icon visitor">👥</view>
          <text class="function-name">来访预约</text>
          <text class="function-desc">访客预约登记</text>
        </view>
        <view class="function-item" @click="goToReservation">
          <view class="function-icon reservation">🏸</view>
          <text class="function-name">球馆预约</text>
          <text class="function-desc">场地时间预约</text>
        </view>
        <view class="function-item" @click="goToVideoMonitoring">
          <view class="function-icon monitoring">📹</view>
          <text class="function-name">视频监控</text>
          <text class="function-desc">实时监控查看</text>
        </view>
      </view>
    </view>




    <!-- 系统公告轮播 -->
    <NoticeSwiper 
      :notices="systemNotices" 
      :show-notices="showSystemNotice"
      :closable="false"
      :refreshable="true"
      :autoplay="true"
      :autoplay-interval="6000"
      @refresh="refreshSystemNotices"
      @view-details="viewNoticeDetails"
      @change="onNoticeChange"
    />

    <!-- 加载状态 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
  </view>
</template>

<script>
import auth from '@/utils/auth.js'
import api from '@/utils/api.js'
import UserAvatar from '@/components/UserAvatar.vue'
import NoticeSwiper from '@/components/NoticeSwiper.vue'
import TimeUtils from '@/utils/timeUtils.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'Index',
  mixins: [timeMixin],
  components: {
    UserAvatar,
    NoticeSwiper
  },
  data() {
    return {
      userInfo: {},
      todayStats: {},
      systemNotices: [], // 改为公告列表
      isLoading: true,
      showSystemNotice: true, // 是否显示系统公告
      currentNoticeIndex: 0 // 当前显示的公告索引
    }
  },

  computed: {
    todayDate() {
      // 使用新的TimeUtils工具类获取当前日期
      return this.$getCurrentDate()
    }
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData()
    // 重新加载通知设置
    this.loadNotificationSettings()
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.refreshData().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      try {
        // 检查登录状态
        if (!auth.isLoggedIn() && !auth.isGuest()) {
          auth.redirectToLogin()
          return
        }

        // 从API获取最新的用户信息
        await this.loadUserInfo()

        // 加载页面数据
        await this.loadPageData()
      } catch (error) {
        console.error('页面初始化失败:', error)
        uni.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载用户信息
     */
    async loadUserInfo() {
      try {
        const response = await api.user.getInfo()
        if (response.success) {
          this.userInfo = response.data
        } else {
          // 如果API获取失败，回退到本地存储
          this.userInfo = auth.getUserInfo() || {}
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果API获取失败，回退到本地存储
        this.userInfo = auth.getUserInfo() || {}
      }
    },

    /**
     * 加载页面数据
     */
    async loadPageData() {
      try {
        // 加载通知设置
        this.loadNotificationSettings()
        
        // 并行加载各项数据
        const [stats, notices] = await Promise.all([
          this.loadTodayStats(),
          this.loadSystemNotices()
        ])

        this.todayStats = stats
        this.systemNotices = notices
      } catch (error) {
        console.error('加载页面数据失败:', error)
      }
    },

    /**
     * 加载通知设置
     */
    loadNotificationSettings() {
      try {
        const savedSettings = uni.getStorageSync('notificationSettings')
        if (savedSettings && typeof savedSettings.systemAnnouncement === 'boolean') {
            this.showSystemNotice = savedSettings.systemAnnouncement
          console.log('通知设置已加载:', savedSettings)
        } else {
          // 默认显示系统公告
          this.showSystemNotice = true
        }
      } catch (error) {
        console.error('加载通知设置失败:', error)
        this.showSystemNotice = true
      }
    },

    /**
     * 加载今日统计数据
     */
    async loadTodayStats() {
      try {
        const result = await api.system.getTodayStats()
        return result.data || {}
      } catch (error) {
        console.error('加载统计数据失败:', error)
        return {}
      }
    },




    /**
     * 加载系统公告列表
     */
    async loadSystemNotices() {
      try {
        console.log('🔄 开始加载系统公告列表...')
        
        // 使用新的公告管理接口获取已发布的公告
        const result = await api.admin.getNotices({
          status: 'published',
          page: 1,
          limit: 10, // 获取最多10个公告
          sortBy: 'priority,createTime', // 先按优先级排序，再按创建时间排序
          sortOrder: 'desc'
        })
        
        console.log('📄 公告API返回结果:', result)
        
        // 处理API返回的数据结构
        if (result.success && result.data && result.data.records && result.data.records.length > 0) {
          const notices = result.data.records.map(notice => ({
            id: notice.id,
            title: notice.title || '系统公告',
            content: notice.content || '暂无公告内容',
            time: notice.createTime || notice.publishTime || notice.updateTime,
            createTime: notice.createTime,
            publishTime: notice.publishTime, 
            updateTime: notice.updateTime,
            type: notice.type || 'info',
            priority: notice.priority || 1,
            isSticky: notice.isSticky || false,
            status: notice.status,
            viewCount: notice.viewCount || 0
          }))
          
          console.log(`✅ 成功加载 ${notices.length} 个公告:`, notices.map(n => n.title))
          return notices
        }
        
        console.log('📭 没有找到已发布的公告')
        return []
      } catch (error) {
        console.error('❌ 加载公告列表失败:', error)
        return []
      }
    },

    /**
     * 刷新数据
     */
    async refreshData() {
      this.isLoading = true
      await this.loadPageData()
      this.isLoading = false
    },

    /**
     * 关闭系统公告
     */
      closeSystemNotice() {
        this.showSystemNotice = false
      // 保存用户设置
      const settings = uni.getStorageSync('notificationSettings') || {}
      settings.systemAnnouncement = false
      uni.setStorageSync('notificationSettings', settings)
      
      uni.showToast({
        title: '已关闭系统公告',
        icon: 'success'
      })
    },

    /**
     * 刷新系统公告列表
     */
    async refreshSystemNotices() {
      try {
        console.log('🔄 刷新系统公告列表...')
        const notices = await this.loadSystemNotices()
        this.systemNotices = notices
        
        uni.showToast({
          title: `已刷新 ${notices.length} 个公告`,
          icon: 'success'
        })
      } catch (error) {
        console.error('❌ 刷新公告失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'error'
        })
      }
    },





    /**
     * 公告切换事件
     */
    onNoticeChange(index, notice) {
      this.currentNoticeIndex = index
      console.log(`📄 切换到公告 ${index + 1}:`, notice.title)
    },

    /**
     * 查看公告详情
     */
    viewNoticeDetails(notice) {
      console.log('👁️ 查看公告详情:', notice)
      
      // 可以跳转到公告详情页面或显示详情弹窗
      uni.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false,
        confirmText: '知道了'
      })
      
      // 或者跳转到公告管理页面（如果用户有权限）
      // uni.navigateTo({
      //   url: '/pages/admin/notices'
      // })
    },

    // debug用户信息 method removed - debug functionality simplified

    /**
     * 获取角色文本
     */
    getRoleText(role) {
      const roleMap = {
        'user': '普通用户',
        'dept_admin': '部门管理员',
        'sys_admin': '系统管理员',
        'verifier': '用餐验证员',
        'guest': '游客'
      }
      return roleMap[role] || '未知角色'
    },




    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''
      
      try {
        // 使用统一的 TimeUtils 工具类
        return TimeUtils.formatTime(time, 'relative')
      } catch (error) {
        console.error('时间格式化失败:', error, '原始时间:', time)
        return '--'
      }
    },



    /**
     * 跳转到个人中心
     */
    goToProfile() {
      uni.switchTab({
        url: '/pages/profile/profile'
      })
    },

    /**
     * 跳转到日常报餐
     */
    goToDining() {
      uni.switchTab({
        url: '/pages/dining/dining'
      })
    },

    /**
     * 跳转到来访预约
     */
    goToVisitorReservation() {
      uni.navigateTo({
        url: '/pages/visitor-reservation/visitor-reservation'
      })
    },

    /**
     * 跳转到球馆预约
     */
    goToReservation() {
      uni.switchTab({
        url: '/pages/reservation/reservation'
      })
    },

    /**
     * 跳转到视频监控
     */
    goToVideoMonitoring() {
      uni.navigateTo({
        url: '/pages/video-monitoring/video-monitoring'
      })
    },

    /**
     * 跳转到用餐验证
     */
    goToVerification() {
      uni.navigateTo({
        url: '/pages/verification/verification'
      })
    },

    /**
     * 更换头像 - 已禁用，使用静态头像
     */
    changeAvatar() {
      uni.showToast({
        title: '头像功能已简化，使用默认头像',
        icon: 'none'
      })
    },
    
    /**
     * 更新用户头像 - 已禁用
     */
      async updateUserAvatar(avatarUrl) {
      // 头像功能已简化，不再需要更新
      console.log('头像功能已简化，使用静态头像')
    }

  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 顶部系统信息区域 */
.system-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx 20rpx 40rpx;
  color: #fff;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.system-logo {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.2);
}

.logo-text {
  text-align: left;
}

.logo-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
  color: #fff;
}

.logo-subtitle {
  display: block;
  font-size: 22rpx;
  opacity: 0.9;
  color: #fff;
  letter-spacing: 1rpx;
}

.system-info {
  text-align: center;
}

.system-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.system-subtitle {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
  color: #fff;
  line-height: 1.3;
}

/* 用户信息卡片 */
.user-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  border: 2rpx solid #e9ecef;
}



.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: #333;
}

.user-role {
  font-size: 24rpx;
  color: #666;
}

.action-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: #e9ecef;
}

.action-icon {
  font-size: 28rpx;
  color: #666;
}

/* Debug button styles removed - functionality simplified */

/* 统计区域 */
.stats-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stats-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.title-date {
  font-size: 24rpx;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-item:active {
  transform: scale(0.98);
  background: #e9ecef;
}

.stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.stat-icon.dining {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.stat-icon.reservation {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.verification {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.stat-icon.menu {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-content {
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 快捷功能 */
.quick-functions {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.function-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.function-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.function-item:active {
  transform: scale(0.98);
  background: #e9ecef;
}

.function-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  margin: 0 auto 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.function-icon.dining {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.function-icon.visitor {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.function-icon.reservation {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.function-icon.monitoring {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.function-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.function-desc {
  font-size: 22rpx;
  color: #666;
}




/* 系统公告 */
.system-notice {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.notice-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.notice-time {
  font-size: 22rpx;
  color: #666;
}

.notice-content {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #666;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .system-header {
    padding: 24rpx 16rpx 32rpx;
  }
  
  .system-logo {
    width: 60rpx;
    height: 60rpx;
    margin-right: 16rpx;
  }
  
  .logo-title {
    font-size: 28rpx;
  }
  
  .logo-subtitle {
    font-size: 20rpx;
  }
  
  .system-title {
    font-size: 32rpx;
  }
  
  .system-subtitle {
    font-size: 24rpx;
  }
  
  .user-card {
    margin: 16rpx;
    padding: 24rpx;
  }
  
  .user-avatar {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .user-name {
    font-size: 28rpx;
  }
  
  .user-role {
    font-size: 22rpx;
  }
  
  .action-btn {
    width: 50rpx;
    height: 50rpx;
  }
  
  .action-icon {
    font-size: 24rpx;
  }
}
</style>
