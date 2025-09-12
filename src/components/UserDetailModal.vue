<template>
  <view v-if="visible" class="user-detail-overlay" @click="handleOverlayClick">
    <view class="user-detail-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">用户详情</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-content" v-if="user">
        <!-- 用户基本信息 -->
        <view class="user-profile-section">
          <view class="profile-header">
            <image 
              :src="user.avatar || '/static/logo.png'" 
              class="user-avatar" 
              mode="aspectFill"
            />
            <view class="profile-info">
              <text class="user-name">{{ user.name || user.nickName || '未知用户' }}</text>
              <text class="user-role">{{ getRoleText(user.role) }}</text>
              <view class="user-status" :class="user.status">
                <text>{{ getStatusText(user.status) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 详细信息 -->
        <view class="detail-sections">
          <!-- 基本信息 -->
          <view class="detail-section">
            <text class="section-title">基本信息</text>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">用户ID</text>
                <text class="info-value">{{ user.id }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">微信昵称</text>
                <text class="info-value">{{ user.nickName || '未绑定' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">真实姓名</text>
                <text class="info-value">{{ user.realName || '未填写' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">手机号码</text>
                <text class="info-value">{{ user.phoneNumber || '未绑定' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">邮箱地址</text>
                <text class="info-value">{{ user.email || '未绑定' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">性别</text>
                <text class="info-value">{{ getGenderText(user.gender) }}</text>
              </view>
            </view>
          </view>

          <!-- 工作信息 -->
          <view class="detail-section">
            <text class="section-title">工作信息</text>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">部门</text>
                <text class="info-value">{{ user.departmentName || '未分配' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">职位</text>
                <text class="info-value">{{ user.position || '未填写' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">工号</text>
                <text class="info-value">{{ user.employeeId || '未设置' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">入职时间</text>
                <text class="info-value">{{ formatDate(user.joinDate) }}</text>
              </view>
            </view>
          </view>

          <!-- 系统信息 -->
          <view class="detail-section">
            <text class="section-title">系统信息</text>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">注册时间</text>
                <text class="info-value">{{ formatDateTime(user.createTime) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">最后登录</text>
                <text class="info-value">{{ formatDateTime(user.lastLoginTime) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">登录次数</text>
                <text class="info-value">{{ user.loginCount || 0 }}次</text>
              </view>
              <view class="info-item">
                <text class="info-label">账户状态</text>
                <view class="status-badge" :class="user.status">
                  <text>{{ getStatusText(user.status) }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 权限信息 -->
          <view class="detail-section" v-if="user.permissions && user.permissions.length > 0">
            <text class="section-title">权限列表</text>
            <view class="permissions-list">
              <view 
                v-for="permission in user.permissions" 
                :key="permission.id"
                class="permission-item"
              >
                <text class="permission-name">{{ permission.name }}</text>
                <text class="permission-desc">{{ permission.description }}</text>
              </view>
            </view>
          </view>

          <!-- 使用统计 -->
          <view class="detail-section" v-if="userStats">
            <text class="section-title">使用统计</text>
            <view class="stats-grid">
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
              <view class="stat-item">
                <text class="stat-number">{{ userStats.activeDays || 0 }}</text>
                <text class="stat-label">活跃天数</text>
              </view>
            </view>
          </view>

          <!-- 最近活动 -->
          <view class="detail-section" v-if="recentActivities && recentActivities.length > 0">
            <text class="section-title">最近活动</text>
            <view class="activities-list">
              <view 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="activity-item"
              >
                <view class="activity-icon" :class="activity.type">
                  <text>{{ getActivityIcon(activity.type) }}</text>
                </view>
                <view class="activity-content">
                  <text class="activity-desc">{{ activity.description }}</text>
                  <text class="activity-time">{{ formatDateTime(activity.createTime) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="edit-btn" @click="edit用户">编辑用户</button>
        <button class="close-footer-btn" @click="close">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'UserDetailModal',
  mixins: [timeMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      user: null,
      userStats: null,
      recentActivities: [],
      loading: false
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.userId) {
        this.load用户Detail()
      }
    },
    userId(newVal) {
      if (newVal && this.visible) {
        this.load用户Detail()
      }
    }
  },
  methods: {
    /**
     * 加载用户详情
     */
    async load用户Detail() {
      if (!this.userId) return
      
      this.loading = true
      try {
        // 并行加载用户信息、统计数据和活动记录
        const [userRes, statsRes, activitiesRes] = await Promise.all([
          api.admin.getUserDetail(this.userId),
          api.admin.getUserStats(this.userId).catch(() => ({ success: false })),
          api.admin.getUserActivities(this.userId).catch(() => ({ success: false }))
        ])

        if (userRes.success) {
          this.user = userRes.data
        }

        if (statsRes.success) {
          this.userStats = statsRes.data
        }

        if (activitiesRes.success) {
          this.recentActivities = activitiesRes.data || []
        }
      } catch (error) {
        console.error('加载用户详情失败:', error)
        uni.showToast({
          title: '加载用户详情失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 编辑用户
     */
    edit用户() {
      this.$emit('edit', this.user)
      this.close()
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.$emit('close')
    },

    handleOverlayClick() {
      this.close()
    },

    /**
     * 工具方法
     */
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateStr)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    },

    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDateTime(dateTimeStr)
      } catch (error) {
        console.error('日期时间格式化错误:', error)
        return '未知'
      }
    },

    getRoleText(role) {
      const roles = {
        user: '普通用户',
        admin: '管理员',
        sys_admin: '超级管理员',
        verifier: '验证员'
      }
      return roles[role] || role || '未知'
    },

    getStatusText(status) {
      const statuses = {
        active: 'normal',
        inactive: '禁用',
        pending: '待激活',
        suspended: '暂停'
      }
      return statuses[status] || status || '未知'
    },

    getGenderText(gender) {
      const genders = {
        1: '男',
        2: '女',
        0: '未知'
      }
      return genders[gender] || '未知'
    },

    getActivityIcon(type) {
      const icons = {
        login: '🔑',
        dining: '🍽️',
        reservation: '📅',
        verification: '✅',
        update: '📝',
        system: '⚙️'
      }
      return icons[type] || '📝'
    }
  }
}
</script>

<style lang="scss" scoped>
.user-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
}

.user-detail-modal {
  background: white;
  border-radius: 24rpx;
  width: 100%;
  max-width: 800rpx;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

/* 模态框头部 */
.modal-header {
  padding: 40rpx 40rpx 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  border: none;
  color: #666;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模态框内容 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 40rpx;
}

/* 用户档案区域 */
.user-profile-section {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #f0f0f0;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.user-role {
  font-size: 26rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
}

.user-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: white;
  align-self: flex-start;
}

.user-status.active {
  background: #27ae60;
}

.user-status.inactive {
  background: #e74c3c;
}

.user-status.pending {
  background: #f39c12;
}

.user-status.suspended {
  background: #95a5a6;
}

/* 详细信息区域 */
.detail-sections {
  padding: 30rpx 0;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.detail-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  text-align: right;
}

.status-badge {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: white;
}

.status-badge.active {
  background: #27ae60;
}

.status-badge.inactive {
  background: #e74c3c;
}

.status-badge.pending {
  background: #f39c12;
}

.status-badge.suspended {
  background: #95a5a6;
}

/* 权限列表 */
.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.permission-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  border-left: 6rpx solid #667eea;
}

.permission-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.permission-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-item {
  background: #f8f9fa;
  padding: 30rpx 20rpx;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid #e9ecef;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 活动列表 */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.activity-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
}

.activity-icon.login {
  background: rgba(102, 126, 234, 0.2);
}

.activity-icon.dining {
  background: rgba(255, 107, 107, 0.2);
}

.activity-icon.reservation {
  background: rgba(67, 233, 123, 0.2);
}

.activity-icon.verification {
  background: rgba(79, 172, 254, 0.2);
}

.activity-icon.update {
  background: rgba(243, 156, 18, 0.2);
}

.activity-icon.system {
  background: rgba(149, 165, 166, 0.2);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.activity-desc {
  font-size: 26rpx;
  color: #333;
}

.activity-time {
  font-size: 22rpx;
  color: #666;
}

/* 模态框底部 */
.modal-footer {
  padding: 30rpx 40rpx;
  border-top: 2rpx solid #f0f0f0;
  background: #fafafa;
  display: flex;
  gap: 20rpx;
}

.edit-btn,
.close-footer-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.close-footer-btn {
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .user-detail-overlay {
    padding: 20rpx;
  }
  
  .modal-header,
  .modal-footer {
    padding: 20rpx 30rpx;
  }
  
  .modal-content {
    padding: 0 30rpx;
  }
  
  .profile-header {
    gap: 20rpx;
  }
  
  .user-avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50rpx;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }
  
  .info-value {
    text-align: left;
  }
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar,
.activities-list::-webkit-scrollbar {
  width: 8rpx;
}

.modal-content::-webkit-scrollbar-track,
.activities-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4rpx;
}

.modal-content::-webkit-scrollbar-thumb,
.activities-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4rpx;
}

.modal-content::-webkit-scrollbar-thumb:hover,
.activities-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
