<template>
  <view class="admin-container">
    <!-- 用户信息卡片 -->
    <view class="user-info-card">
      <view class="user-avatar">
        <UserAvatar
          :user="userInfo"
          size="large"
        />
      </view>
      <view class="user-details">
        <text class="user-name">{{ userInfo.name || '管理员' }}</text>
        <text class="user-role">{{ userInfo.roleName || '系统管理员' }}</text>
        <text class="user-dept">{{ userInfo.deptName || '系统管理部' }}</text>
      </view>
      <view class="admin-badge">
        <text>管理员</text>
      </view>
    </view>

    <!-- 系统统计卡片 -->
    <view class="stats-grid">
      <view class="stat-card" @click="refreshStats">
        <view class="stat-icon users">
          <text class="iconfont">👥</text>
        </view>
        <view class="stat-info">
          <text class="stat-number">{{ stats.total用户s || 0 }}</text>
          <text class="stat-label">总用户数</text>
          <view class="stat-trend" v-if="stats.monthlyGrowth">
            <text class="trend-text" :class="{ positive: stats.monthlyGrowth.users > 0, negative: stats.monthlyGrowth.users < 0 }">
              {{ stats.monthlyGrowth.users > 0 ? '+' : '' }}{{ stats.monthlyGrowth.users }}%
            </text>
          </view>
        </view>
        <view class="refresh-icon" v-if="loading">
          <text class="iconfont">🔄</text>
        </view>
      </view>
      
      <view class="stat-card" @click="refreshStats">
        <view class="stat-icon orders">
          <text class="iconfont">🍽️</text>
        </view>
        <view class="stat-info">
          <text class="stat-number">{{ stats.todayOrders || 0 }}</text>
          <text class="stat-label">今日报餐</text>
          <view class="stat-trend" v-if="stats.monthlyGrowth">
            <text class="trend-text" :class="{ positive: stats.monthlyGrowth.orders > 0, negative: stats.monthlyGrowth.orders < 0 }">
              {{ stats.monthlyGrowth.orders > 0 ? '+' : '' }}{{ stats.monthlyGrowth.orders }}%
            </text>
          </view>
        </view>
        <view class="refresh-icon" v-if="loading">
          <text class="iconfont">🔄</text>
        </view>
      </view>
      
      <view class="stat-card" @click="refreshStats">
        <view class="stat-icon venues">
          <text class="iconfont">🏀</text>
        </view>
        <view class="stat-info">
          <text class="stat-number">{{ stats.totalVenues || 0 }}</text>
          <text class="stat-label">场地数量</text>
        </view>
        <view class="refresh-icon" v-if="loading">
          <text class="iconfont">🔄</text>
        </view>
      </view>
      
      <view class="stat-card" @click="refreshStats">
        <view class="stat-icon reservations">
          <text class="iconfont">📅</text>
        </view>
        <view class="stat-info">
          <text class="stat-number">{{ stats.todayReservations || 0 }}</text>
          <text class="stat-label">今日预约</text>
          <view class="stat-trend" v-if="stats.monthlyGrowth">
            <text class="trend-text" :class="{ positive: stats.monthlyGrowth.reservations > 0, negative: stats.monthlyGrowth.reservations < 0 }">
              {{ stats.monthlyGrowth.reservations > 0 ? '+' : '' }}{{ stats.monthlyGrowth.reservations }}%
            </text>
          </view>
        </view>
        <view class="refresh-icon" v-if="loading">
          <text class="iconfont">🔄</text>
        </view>
      </view>
    </view>

    <!-- 管理功能菜单 -->
    <view class="admin-menu">
      <view class="menu-section">
        <view class="section-title">内容管理</view>
        <view class="menu-grid">
          <view class="menu-item" @click="switchtab('/pages/admin/menu')">
            <view class="menu-icon menu">
              <text class="iconfont">📋</text>
            </view>
            <text class="menu-label">菜单管理</text>
            <text class="menu-desc">发布管理每日菜单</text>
          </view>
          
          <view class="menu-item" @click="switchtab('/pages/admin/dishes')">
            <view class="menu-icon dishes">
              <text class="iconfont">🍜</text>
            </view>
            <text class="menu-label">菜品管理</text>
            <text class="menu-desc">维护菜品信息</text>
          </view>
          
          <view class="menu-item" @click="switchtab('/pages/admin/venues')">
            <view class="menu-icon venues">
              <text class="iconfont">🏟️</text>
            </view>
            <text class="menu-label">球馆管理</text>
            <text class="menu-desc">管理场地和时间</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <view class="section-title">用户管理</view>
        <view class="menu-grid">
          <view class="menu-item" @click="switchtab('/pages/admin/users')">
            <view class="menu-icon users">
              <text class="iconfont">👤</text>
            </view>
            <text class="menu-label">人员管理</text>
            <text class="menu-desc">用户角色权限管理</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <view class="section-title">就餐管理</view>
        <view class="menu-grid">
          <view class="menu-item" @click="switchtab('/pages/admin/dining-confirmation')">
            <view class="menu-icon confirmation">
              <text class="iconfont">✅</text>
            </view>
            <text class="menu-label">确认就餐管理</text>
            <text class="menu-desc">代确认和批量确认就餐</text>
          </view>
          
        </view>
      </view>

      <view class="menu-section">
        <view class="section-title">系统管理</view>
        <view class="menu-grid">
          <view class="menu-item" @click="switchtab('/pages/admin/notices')">
            <view class="menu-icon notices">
              <text class="iconfont">📢</text>
            </view>
            <text class="menu-label">公告管理</text>
            <text class="menu-desc">发布管理系统公告</text>
          </view>
          
          <view class="menu-item" @click="switchtab('/pages/admin/settings')">
            <view class="menu-icon settings">
              <text class="iconfont">⚙️</text>
            </view>
            <text class="menu-label">系统设置</text>
            <text class="menu-desc">系统参数配置</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-header">
        <text class="action-title">快捷操作</text>
        <text class="last-refresh" v-if="lastRefreshTime">
          最后更新: {{ $formatTime(lastRefreshTime) }}
        </text>
      </view>
      <view class="action-buttons">
        <button class="action-btn primary" @click="publishTodayMenu">
          发布今日菜单
        </button>
        <button class="action-btn secondary" @click="viewTodayStats">
          查看今日统计
        </button>
        <button class="action-btn tertiary" @click="refreshAllData">
          刷新全部数据
        </button>
      </view>
    </view>

    <!-- 系统状态 -->
    <view class="system-status">
      <view class="status-header">
        <text class="status-title">系统状态</text>
        <view class="status-refresh" @click="checkSystemStatus">
          <text class="iconfont">🔄</text>
          <text class="refresh-text">刷新</text>
        </view>
      </view>
      <view class="status-items">
        <view class="status-item">
          <view class="status-info">
            <text class="status-label">API服务</text>
            <text class="status-desc">接口服务状态</text>
          </view>
          <view class="status-indicator" :class="{ active: systemStatus.status?.apiStatus }">
            <text>{{ systemStatus.status?.apiStatus ? 'normal' : '异常' }}</text>
          </view>
        </view>
        <view class="status-item">
          <view class="status-info">
            <text class="status-label">数据库</text>
            <text class="status-desc">{{ systemStatus.info?.dbVersion || 'MySQL 8.0' }}</text>
          </view>
          <view class="status-indicator" :class="{ active: systemStatus.status?.dbStatus }">
            <text>{{ systemStatus.status?.dbStatus ? 'normal' : '异常' }}</text>
          </view>
        </view>
        <view class="status-item">
          <view class="status-info">
            <text class="status-label">存储服务</text>
            <text class="status-desc">文件存储状态</text>
          </view>
          <view class="status-indicator" :class="{ active: systemStatus.status?.storageStatus }">
            <text>{{ systemStatus.status?.storageStatus ? 'normal' : '异常' }}</text>
          </view>
        </view>
        <view class="status-item">
          <view class="status-info">
            <text class="status-label">云函数</text>
            <text class="status-desc">后端函数状态</text>
          </view>
          <view class="status-indicator" :class="{ active: systemStatus.status?.functionStatus }">
            <text>{{ systemStatus.status?.functionStatus ? 'normal' : '异常' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 系统信息 -->
      <view class="system-info" v-if="systemStatus.info">
        <view class="info-item">
          <text class="info-label">系统版本</text>
          <text class="info-value">{{ systemStatus.info.version || '1.0.0' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">运行时间</text>
          <text class="info-value">{{ systemStatus.info.uptime || '-小时' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">内存使用</text>
          <text class="info-value">{{ systemStatus.info.memoryUsage || '45%' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">服务器时间</text>
          <text class="info-value">{{ formatServerTime(systemStatus.info.serverTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :currentPage="'/pages/admin/index'" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import api from '@/utils/api'
import UserAvatar from '@/components/UserAvatar.vue'
import auth from '@/utils/auth'
import TimeUtils from '@/utils/timeUtils.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'AdminIndex',
  mixins: [timeMixin],
  components: {
    BottomNav,    UserAvatar,
  },
  data() {
    return {
      userInfo: {},
      stats: {
        total用户s: 0,
        todayOrders: 0,
        totalVenues: 0,
        todayReservations: 0,
        monthlyGrowth: {
          users: 0,
          orders: 0,
          reservations: 0
        }
      },
      systemStatus: {
        status: {
          apiStatus: true,
          dbStatus: true,
          storageStatus: true,
          functionStatus: true
        },
        info: {
          version: '1.0.0',
          dbVersion: 'MySQL 8.0',
          serverTime: TimeUtils.getCurrentTimestamp(),
          uptime: '72天3小时',
          memoryUsage: '45%'
        }
      },
      loading: false,
      lastRefreshTime: null
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      try {
        // 检查管理员权限
        if (!this.check管理员Permission()) {
          return
        }

        // 从API获取最新的用户信息
        await this.loadUserInfo()
        
        // 加载统计数据
        await this.loadStats()
        
        // 检查系统状态
        await this.checkSystemStatus()
      } catch (error) {
        console.error('页面初始化失败:', error)
      }
    },

    /**
     * 检查管理员权限
     */
    async check管理员Permission() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.role || !['admin', 'sys_admin'].includes(userInfo.role)) {
          uni.showToast({
            title: '权限不足',
            icon: 'error'
          })
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
          return false
        }
        return true
      } catch (error) {
        console.error('检查权限失败:', error)
        uni.showToast({
          title: '权限验证失败',
          icon: 'error'
        })
        return false
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
     * 加载统计数据
     */
    async loadStats() {
      if (this.loading) return
      
      this.loading = true
      try {
        const response = await api.admin.getSystemStats()
        if (response.success) {
          // 根据后端接口实际返回的数据结构进行映射
          this.stats = {
            total用户s: response.data.total用户s || 0,
            todayOrders: response.data.todayOrders || 0,
            totalVenues: response.data.totalVenues || 0,
            todayReservations: response.data.todayReservations || 0,
            monthlyGrowth: response.data.monthlyGrowth || {
              users: 0,
              orders: 0,
              reservations: 0
            }
          }
          this.lastRefreshTime = TimeUtils.getCurrentBeijingTime()
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        uni.showToast({
          title: '加载统计数据失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 检查系统状态
     */
    async checkSystemStatus() {
      try {
        const response = await api.admin.getSystemStatus()
        if (response.success) {
          this.systemStatus = response.data
        }
      } catch (error) {
        console.error('检查系统状态失败:', error)
        // 假设服务异常
        this.systemStatus = {
          status: {
            apiStatus: false,
            dbStatus: false,
            storageStatus: false,
            functionStatus: false
          },
          info: {
            version: '1.0.0',
            dbVersion: 'MySQL 8.0',
            serverTime: TimeUtils.getCurrentTimestamp(),
            uptime: '0天0小时',
            memoryUsage: '0%'
          }
        }
        uni.showToast({
          title: '系统状态检查失败',
          icon: 'error'
        })
      }
    },

    /**
     * 刷新统计数据
     */
    async refreshStats() {
      await this.loadStats()
      uni.showToast({
        title: '数据已刷新',
        icon: 'success',
        duration: 1500
      })
    },

    /**
     * 格式化服务器时间
     */
    formatServerTime(serverTime) {
      if (!serverTime) return '--'
      try {
        // 使用统一的 TimeUtils 工具类
        return TimeUtils.formatTime(serverTime, 'full')
      } catch (error) {
        console.error('服务器时间格式化失败:', error, '原始时间:', serverTime)
        return '--'
      }
    },

    /**
     * 格式化时间显示
     */
    formatTime(time) {
      if (!time) return '--'
      try {
        // 使用统一的 TimeUtils 工具类
        return TimeUtils.formatTime(time, 'relative')
      } catch (error) {
        console.error('时间格式化失败:', error, '原始时间:', time)
        return '--'
      }
    },

    /**
     * 刷新全部数据
     */
    async refreshAllData() {
      try {
        uni.showLoading({
          title: '刷新数据中...',
          mask: true
        })
        
        await Promise.all([
          this.loadStats(),
          this.checkSystemStatus()
        ])
        
        uni.hideLoading()
        uni.showToast({
          title: '数据刷新完成',
          icon: 'success',
          duration: 2000
        })
      } catch (error) {
        uni.hideLoading()
        console.error('刷新数据失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'error'
        })
      }
    },

    /**
     * 页面导航
     */
     switchtab(url) {
      uni.switchtab({ url })
    },

    /**
     * 发布今日菜单
     */
    async publishTodayMenu() {
      uni.showModal({
        title: '确认操作',
        content: '确定要发布今日菜单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/admin/menu?action=publish'
            })
          }
        }
      })
    },

    /**
     * 查看今日统计
     */
    viewTodayStats() {
      uni.navigateTo({
        url: '/pages/admin/settings?tab=stats'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 140rpx;
}

/* 用户信息卡片 */
.user-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
  margin-right: 30rpx;
  border: 4rpx solid #667eea;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 12rpx;
}

.user-role {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.user-dept {
  font-size: 24rpx;
  color: #7f8c8d;
}

.admin-badge {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.stat-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 36rpx;
}

.stat-icon.users {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stat-icon.orders {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.stat-icon.venues {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.stat-icon.reservations {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #7f8c8d;
}

.stat-trend {
  margin-top: 8rpx;
}

.trend-text {
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

.trend-text.positive {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.trend-text.negative {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.refresh-icon {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #667eea;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 管理菜单 */
.admin-menu {
  margin-bottom: 40rpx;
}

.menu-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 24rpx;
  padding-left: 20rpx;
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.menu-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  font-size: 40rpx;
}

.menu-icon.menu {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.menu-icon.dishes {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.menu-icon.venues {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.menu-icon.users {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.menu-icon.notices {
  background: linear-gradient(45deg, #ff9a9e, #fecfef);
}

.menu-icon.settings {
  background: linear-gradient(45deg, #fa709a, #fee140);
}

.menu-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.menu-desc {
  font-size: 22rpx;
  color: #7f8c8d;
}

/* 快捷操作 */
.quick-actions {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.action-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.last-refresh {
  font-size: 22rpx;
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  text-align: center;
}

.action-btn.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.action-btn.secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn.tertiary {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 2rpx solid #27ae60;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 系统状态 */
.system-status {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.status-refresh {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16rpx;
  color: #667eea;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.status-refresh:active {
  transform: scale(0.95);
  background: rgba(102, 126, 234, 0.2);
}

.refresh-text {
  font-size: 22rpx;
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.status-item:last-child {
  border-bottom: none;
}

.status-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.status-label {
  font-size: 26rpx;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.status-desc {
  font-size: 22rpx;
  color: #7f8c8d;
}

.status-indicator {
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  background: #e74c3c;
  color: white;
  font-weight: 500;
  min-width: 80rpx;
  text-align: center;
}

.status-indicator.active {
  background: #27ae60;
}

/* 系统信息 */
.system-info {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(102, 126, 234, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.info-value {
  font-size: 24rpx;
  color: #2c3e50;
  font-weight: 500;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .admin-container {
    padding: 30rpx 20rpx 120rpx;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15rpx;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 15rpx;
  }
}
</style>
