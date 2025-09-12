<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-header">
        <UserAvatar 
          :user="userInfo" 
          size="xlarge"
          @click="changeAvatar"
        />
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickName || '未登录用户' }}</text>
          <text class="user-role">{{ getRoleText(userInfo.role) }}</text>
          <text class="user-dept">{{ userInfo.department || '未设置部门' }}</text>
        </view>
        <view class="user-actions">
          <button class="edit-btn" @click="editProfile">
            <text class="edit-icon">✏️</text>
          </button>
        </view>
      </view>
      
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-number">{{ userStats.diningCount || 0 }}</text>
          <text class="stat-label">报餐次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ userStats.reservationCount || 0 }}</text>
          <text class="stat-label">预约次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ userStats.verificationCount || 0 }}</text>
          <text class="stat-label">验证次数</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="group-title">
          <text class="title-text">就餐管理</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="goToDiningStatus">
            <view class="menu-icon dining">🍽️</view>
            <view class="menu-content">
              <text class="menu-title">就餐状态</text>
              <text class="menu-desc">查看和确认就餐状态</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goToQrScan">
            <view class="menu-icon qr">📱</view>
            <view class="menu-content">
              <text class="menu-title">扫码就餐</text>
              <text class="menu-desc">扫描二维码确认就餐</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goToDiningHistory">
            <view class="menu-icon history">📋</view>
            <view class="menu-content">
              <text class="menu-title">就餐历史</text>
              <text class="menu-desc">查看就餐确认历史记录</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="group-title">
          <text class="title-text">个人管理</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="goToPersonal信息">
            <view class="menu-icon personal">👤</view>
            <view class="menu-content">
              <text class="menu-title">个人信息</text>
              <text class="menu-desc">查看和编辑个人资料</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goToChangePassword">
            <view class="menu-icon password">🔒</view>
            <view class="menu-content">
              <text class="menu-title">修改密码</text>
              <text class="menu-desc">更改登录密码</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goTo否tificationSettings">
            <view class="menu-icon notification">🔔</view>
            <view class="menu-content">
              <text class="menu-title">消息设置</text>
              <text class="menu-desc">管理推送通知</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>

      <!-- 管理员功能（仅管理员可见） -->
      <view v-if="isAdmin" class="menu-group admin-group">
        <view class="group-title">
          <text class="title-text">管理员功能</text>
          <view class="admin-badge">
            <text>管理员</text>
          </view>
        </view>
        <view class="menu-list">
          <view class="menu-item admin-item" @click="goTo管理员Panel">
            <view class="menu-icon admin">⚙️</view>
            <view class="menu-content">
              <text class="menu-title">系统管理</text>
              <text class="menu-desc">管理员控制面板</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item admin-item" @click="goToMenuManagement">
            <view class="menu-icon menu">📋</view>
            <view class="menu-content">
              <text class="menu-title">菜单管理</text>
              <text class="menu-desc">发布和管理每日菜单</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item admin-item" @click="goTo用户Management">
            <view class="menu-icon users">👥</view>
            <view class="menu-content">
              <text class="menu-title">人员管理</text>
              <text class="menu-desc">用户和权限管理</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item admin-item" @click="goToDishManagement">
            <view class="menu-icon dishes">🍜</view>
            <view class="menu-content">
              <text class="menu-title">菜品管理</text>
              <text class="menu-desc">维护菜品信息</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item admin-item" @click="goToVenueManagement">
            <view class="menu-icon venues">🏟️</view>
            <view class="menu-content">
              <text class="menu-title">球馆管理</text>
              <text class="menu-desc">场地和时间管理</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item admin-item" @click="goTo否ticeManagement">
            <view class="menu-icon notices">📢</view>
            <view class="menu-content">
              <text class="menu-title">公告管理</text>
              <text class="menu-desc">发布和管理系统公告</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="group-title">
          <text class="title-text">系统功能</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="goToHelpCenter">
            <view class="menu-icon help">❓</view>
            <view class="menu-content">
              <text class="menu-title">帮助中心</text>
              <text class="menu-desc">使用指南和常见问题</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goToFeedback">
            <view class="menu-icon feedback">💬</view>
            <view class="menu-content">
              <text class="menu-title">意见反馈</text>
              <text class="menu-desc">提交建议和问题反馈</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          
          <view class="menu-item" @click="goToAbout">
            <view class="menu-icon about">ℹ️</view>
            <view class="menu-content">
              <text class="menu-title">关于我们</text>
              <text class="menu-desc">系统版本和联系方式</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>


    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="showLogout确认">
        <text class="logout-icon">🚪</text>
        <text class="logout-text">退出登录</text>
      </button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">智慧物业管理系统 v1.0.0</text>
      <text class="copyright-text">© 2024 湖北省地质局第三地质大队</text>
    </view>

    <!-- 编辑个人信息弹窗 -->
    <view class="edit-modal" v-if="show编辑Modal">
      <view class="modal-mask" @click="close编辑Modal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑个人信息</text>
          <button class="close-btn" @click="close编辑Modal">×</button>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input 
              class="form-input" 
              v-model="editForm.nickName" 
              placeholder="请输入昵称"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">部门</text>
            <input 
              class="form-input" 
              v-model="editForm.department" 
              placeholder="请输入部门"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input 
              class="form-input" 
              v-model="editForm.phoneNumber" 
              placeholder="请输入手机号"
              type="number"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              class="form-input" 
              v-model="editForm.email" 
              placeholder="请输入邮箱"
              type="email"
            />
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-secondary" @click="close编辑Modal">取消</button>
          <button 
            class="btn-primary" 
            @click="saveProfile"
            :disabled="!can保存Profile || isSaving"
            :loading="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </view>
      </view>
    </view>

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

export default {
  name: 'Profile',
  components: {
    UserAvatar
  },
  data() {
    return {
      isLoading: false,
      userInfo: {},
      userStats: {},
      
      // 编辑弹窗
      show编辑Modal: false,
      editForm: {
        nickName: '',
        department: '',
        phoneNumber: '',
        email: ''
      },
      isSaving: false
    }
  },

  computed: {
    isAdmin() {
      return auth.isAdmin() || auth.isDeptAdmin()
    },

    can保存Profile() {
      return this.editForm.nickName && this.editForm.department
    }
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.refreshData()
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
        
        // 加载用户统计数据
        await this.load用户Stats()
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
     * 刷新数据
     */
    async refreshData() {
      try {
        // 从API获取最新的用户信息
        await this.loadUserInfo()
        
        // 刷新统计数据
        await this.load用户Stats()
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },

    /**
     * 加载用户统计数据
     */
    async load用户Stats() {
      try {
        const result = await api.user.getStats()
        
        this.userStats = result.data || {}
      } catch (error) {
        console.error('加载用户统计失败:', error)
        this.userStats = {}
      }
    },

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
     * 更换头像
     */
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0])
        }
      })
    },

    /**
     * 上传头像
     */
    async uploadAvatar(filePath) {
      // 头像功能已简化，不再需要上传
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
    },





    /**
     * 编辑个人信息
     */
    editProfile() {
      this.editForm = {
        nickName: this.userInfo.nickName || '',
        department: this.userInfo.department || '',
        phoneNumber: this.userInfo.phoneNumber || '',
        email: this.userInfo.email || ''
      }
      this.show编辑Modal = true
    },

    /**
     * 关闭编辑弹窗
     */
    close编辑Modal() {
      this.show编辑Modal = false
      this.editForm = {
        nickName: '',
        department: '',
        phoneNumber: '',
        email: ''
      }
    },

    /**
     * 保存个人信息
     */
    async saveProfile() {
      if (!this.can保存Profile) return
      
      try {
        this.isSaving = true
        
        const result = await api.user.updateProfile(this.editForm)
        
        if (result && result.success) {
          // 更新本地用户信息
          const userInfo = { ...this.userInfo, ...this.editForm }
          auth.saveLoginInfo({ userInfo })
          
          this.userInfo = userInfo
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          this.close编辑Modal()
        } else {
          throw new Error(result.message || '保存失败')
        }
      } catch (error) {
        console.error('保存个人信息失败:', error)
        uni.showToast({
          title: error.message || '保存失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isSaving = false
      }
    },

    /**
     * 显示退出登录确认
     */
    showLogout确认() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        confirmText: '退出',
        cancelText: '取消',
        confirmColor: '#e74c3c',
        success: (res) => {
          if (res.confirm) {
            this.logout()
          }
        }
      })
    },

    /**
     * 退出登录
     */
    async logout() {
      try {
        await auth.logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },

    /**
     * 跳转到个人信息页面
     */
    goToPersonal信息() {
      uni.navigateTo({
        url: '/pages/personal-info/personal-info'
      })
    },

    /**
     * 跳转到修改密码页面
     */
    goToChangePassword() {
      uni.navigateTo({
        url: '/pages/change-password/change-password'
      })
    },

    /**
     * 跳转到消息设置页面
     */
    goTo否tificationSettings() {
      uni.navigateTo({
        url: '/pages/notification-settings/notification-settings'
      })
    },

    /**
     * 跳转到帮助中心页面
     */
    goToHelpCenter() {
      uni.navigateTo({
        url: '/pages/help-center/help-center'
      })
    },

    /**
     * 跳转到意见反馈页面
     */
    goToFeedback() {
      uni.navigateTo({
        url: '/pages/feedback/feedback'
      })
    },

    /**
     * 跳转到关于我们页面
     */
    goToAbout() {
      uni.navigateTo({
        url: '/pages/about/about'
      })
    },

    /**
     * 跳转到用户管理页面
     */
    goTo管理员Panel() {
      uni.navigateTo({
        url: '/pages/admin/index'
      })
    },

    goToMenuManagement() {
      uni.navigateTo({
        url: '/pages/admin/menu'
      })
    },

    goTo用户Management() {
      uni.navigateTo({
        url: '/pages/admin/users'
      })
    },

    goToDishManagement() {
      uni.navigateTo({
        url: '/pages/admin/dishes'
      })
    },

    goToVenueManagement() {
      uni.navigateTo({
        url: '/pages/admin/venues'
      })
    },

    goTo否ticeManagement() {
      uni.navigateTo({
        url: '/pages/admin/notices'
      })
    },

    /**
     * 跳转到系统设置页面
     */
    goToSystemSettings() {
      uni.navigateTo({
        url: '/pages/admin/settings'
      })
    },

    /**
     * 跳转到数据统计页面
     */
    goToDataStatistics() {
      uni.navigateTo({
        url: '/pages/admin/settings?tab=stats'
      })
    },

    /**
     * 跳转到就餐状态页面
     */
    goToDiningStatus() {
      uni.navigateTo({
        url: '/pages/dining/dining-status'
      })
    },

    /**
     * 跳转到扫码就餐页面
     */
    goToQrScan() {
      uni.navigateTo({
        url: '/pages/dining/qr-scan'
      })
    },

    /**
     * 跳转到就餐历史页面
     */
    goToDiningHistory() {
      uni.navigateTo({
        url: '/pages/dining/dining-confirmation-history'
      })
    },

    // debug用户信息 method removed - debug functionality simplified
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.user-avatar:active {
  transform: scale(0.95);
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.user-role {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.user-dept {
  font-size: 22rpx;
  opacity: 0.8;
}

.user-actions {
  display: flex;
  gap: 15rpx;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.3s ease;
}

.edit-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.edit-icon {
  font-size: 24rpx;
}

/* 用户统计 */
.user-stats {
  display: flex;
  gap: 30rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
}

.stat-number {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.9;
}

/* 功能菜单 */
.menu-section {
  margin: 20rpx;
}

.menu-group {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.group-title {
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f8f9fa;
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f9fa;
  transform: scale(0.98);
}

.menu-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.menu-icon.personal {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.menu-icon.password {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.menu-icon.notification {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.menu-icon.help {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.menu-icon.feedback {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.menu-icon.about {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.menu-icon.admin {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.menu-icon.settings {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.menu-icon.statistics {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.menu-content {
  flex: 1;
}

.menu-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.menu-desc {
  font-size: 22rpx;
  color: #666;
}

.menu-arrow {
  font-size: 24rpx;
  color: #ccc;
}

/* 退出登录 */
.logout-section {
  margin: 20rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #e74c3c;
  border-radius: 16rpx;
  color: #e74c3c;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logout-btn:active {
  transform: scale(0.98);
  background: #e74c3c;
  color: #fff;
}

.logout-icon {
  margin-right: 15rpx;
  font-size: 32rpx;
}

.logout-text {
  font-size: 28rpx;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 40rpx 20rpx;
}

.version-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.copyright-text {
  font-size: 22rpx;
  color: #999;
}

/* 编辑弹窗 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
}

.btn-primary {
  background: #667eea;
  color: #fff;
}

.btn-primary:disabled {
  background: #ccc;
  color: #999;
}

.btn-secondary:active,
.btn-primary:active {
  transform: scale(0.98);
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

/* 管理员功能样式 */
.admin-group {
  border: 2rpx solid #667eea;
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  position: relative;
  overflow: hidden;
}

.admin-group .group-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18rpx 18rpx 0 0;
  margin: -2rpx -2rpx 0 -2rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: none;
}

.admin-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  backdrop-filter: blur(5rpx);
}

.admin-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  position: relative;
}

.admin-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.admin-item:active::before {
  opacity: 1;
}

.admin-item:active {
  background: rgba(255, 255, 255, 0.95);
  transform: translateX(10rpx);
}

.admin-item .menu-icon {
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.admin-item .menu-icon.admin {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.admin-item .menu-icon.menu {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.admin-item .menu-icon.users {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.admin-item .menu-icon.dishes {
  background: linear-gradient(45deg, #fa709a, #fee140);
}

.admin-item .menu-icon.venues {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.admin-item .menu-icon.notices {
  background: linear-gradient(45deg, #ff9a9e, #fecfef);
}

.admin-item .menu-title {
  color: #2c3e50;
  font-weight: 600;
}

.admin-item .menu-desc {
  color: #667eea;
  font-weight: 500;
}

.admin-item .menu-arrow {
  color: #667eea;
  font-weight: bold;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .admin-group .group-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }
  
  .admin-badge {
    align-self: flex-start;
  }
}
</style>
