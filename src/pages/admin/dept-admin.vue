<template>
  <view class="dept-admin-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">部门管理</text>
      <text class="page-subtitle">{{ departmentInfo.departmentName || '加载中...' }}</text>
    </view>

    <!-- 部门概览卡片 -->
    <view class="overview-section">
      <view class="overview-card">
        <view class="overview-header">
          <text class="overview-title">部门概览</text>
          <view class="dept-badge">{{ departmentInfo.departmentCode }}</view>
        </view>
        
        <view class="overview-stats">
          <view class="stat-item">
            <text class="stat-number">{{ departmentInfo.memberCount || 0 }}</text>
            <text class="stat-label">部门成员</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ todayStats.totalOrders || 0 }}</text>
            <text class="stat-label">今日报餐</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ todayStats.participationRate || 0 }}%</text>
            <text class="stat-label">参与率</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能导航 -->
    <view class="nav-section">
      <view class="nav-grid">
        <view class="nav-item" @click="switchtab('/pages/dining/dept-order')">
          <view class="nav-icon">🍽️</view>
          <text class="nav-title">部门报餐</text>
          <text class="nav-desc">为部门成员报餐</text>
        </view>
        
        <view class="nav-item" @click="switchtab('/pages/dining/dept-orders')">
          <view class="nav-icon">📋</view>
          <text class="nav-title">报餐记录</text>
          <text class="nav-desc">查看报餐历史</text>
        </view>
        
        <view class="nav-item" @click="switchtab('/pages/dining/dept-stats')">
          <view class="nav-icon">📊</view>
          <text class="nav-title">报餐统计</text>
          <text class="nav-desc">数据分析报告</text>
        </view>
        
        <view class="nav-item" @click="viewMembers">
          <view class="nav-icon">👥</view>
          <text class="nav-title">成员管理</text>
          <text class="nav-desc">查看部门成员</text>
        </view>
      </view>
    </view>

    <!-- 今日报餐情况 -->
    <view class="today-section">
      <view class="section-header">
        <text class="section-title">今日报餐情况</text>
        <text class="section-date">{{ formatDate($getCurrentDate()) }}</text>
      </view>
      
      <view class="meal-cards">
        <view class="meal-card" v-for="mealType in mealTypes" :key="mealType.value">
          <view class="meal-header">
            <text class="meal-name">{{ mealType.label }}</text>
            <text class="meal-count">{{ getMealCount(mealType.value) }}</text>
          </view>
          <view class="meal-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: getMealProgress(mealType.value) + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ getMealProgress(mealType.value) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 部门成员列表 -->
    <view class="members-section">
      <view class="section-header">
        <text class="section-title">部门成员</text>
        <text class="member-count">共 {{ departmentMembers.length }} 人</text>
      </view>
      
      <view class="members-list">
        <view 
          v-for="member in departmentMembers.slice(0, 5)" 
          :key="member._id"
          class="member-item"
        >
          <view class="member-avatar">
            <UserAvatar :user="member" size="small" />
          </view>
          
          <view class="member-info">
            <text class="member-name">{{ member.name || member.nickName }}</text>
            <text class="member-position">{{ member.position || '未设置' }}</text>
          </view>
          
          <view class="member-status">
            <view 
              class="order-status" 
              :class="{ 'has-ordered': member.hasOrdered }"
            >
              {{ member.hasOrdered ? '已报餐' : '未报餐' }}
            </view>
          </view>
        </view>
        
        <view v-if="departmentMembers.length > 5" class="view-more">
          <button class="view-more-btn" @click="viewAllMembers">
            查看全部 {{ departmentMembers.length }} 人
          </button>
        </view>
      </view>
    </view>

    <!-- 成员详情弹窗 -->
    <uni-popup ref="membersPopup" type="center" :mask-click="false">
      <view class="popup-content large">
        <view class="popup-header">
          <text class="popup-title">部门成员</text>
          <button class="close-btn" @click="closeMembersPopup">×</button>
        </view>
        
        <view class="members-content">
          <view class="members-list">
            <view 
              v-for="member in departmentMembers" 
              :key="member._id"
              class="member-item"
            >
              <view class="member-avatar">
                <UserAvatar :user="member" size="small" />
              </view>
              
              <view class="member-info">
                <text class="member-name">{{ member.name || member.nickName }}</text>
                <text class="member-position">{{ member.position || '未设置' }}</text>
                <text class="member-phone">{{ member.phoneNumber }}</text>
              </view>
              
              <view class="member-status">
                <view 
                  class="order-status" 
                  :class="{ 'has-ordered': member.hasOrdered }"
                >
                  {{ member.hasOrdered ? '已报餐' : '未报餐' }}
                </view>
                <view v-if="member.hasOrdered && member.orderInfo" class="order-info">
                  <text class="order-meal">{{ getMealTypeText(member.orderInfo.mealType) }}</text>
                  <text class="order-time">{{ $formatTime(member.orderInfo.orderTime) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'DeptAdmin',
  mixins: [timeMixin],
  components: {    UserAvatar,
  },
  data() {
    return {
      departmentInfo: {},
      todayStats: {},
      departmentMembers: [],
      mealTypes: [
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' }
      ],
      loading: false
    }
  },
  mounted() {
    this.loadDepartmentData()
  },
  methods: {
    // 加载部门数据
    async loadDepartmentData() {
      try {
        this.loading = true
        await Promise.all([
          this.loadDepartmentInfo(),
          this.loadDepartmentOverview()
        ])
      } catch (error) {
        console.error('加载部门数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 加载部门信息
    async loadDepartmentInfo() {
      try {
        const response = await api.admin.getDeptAdminInfo()
        if (response.success) {
          this.departmentInfo = response.data
        } else {
          console.error('获取部门信息失败:', response.message)
        }
      } catch (error) {
        console.error('获取部门信息失败:', error)
      }
    },

    // 加载部门概览
    async loadDepartmentOverview() {
      try {
        const response = await api.admin.getDepartmentOverview()
        if (response.success) {
          const data = response.data
          this.todayStats = data.todayStats || {}
          this.departmentMembers = data.members || []
        } else {
          console.error('获取部门概览失败:', response.message)
        }
      } catch (error) {
        console.error('获取部门概览失败:', error)
      }
    },

    // 查看成员
    viewMembers() {
      this.$refs.membersPopup.open()
    },

    // 查看所有成员
    viewAllMembers() {
      this.$refs.membersPopup.open()
    },

    // 关闭成员弹窗
    closeMembersPopup() {
      this.$refs.membersPopup.close()
    },

    // 导航到指定页面
    switchtab(url) {
      uni.switchtab({ url })
    },

    // 获取餐次数量
    getMealCount(mealType) {
      return this.todayStats.mealTypeStats?.[mealType] || 0
    },

    // 获取餐次进度
    getMealProgress(mealType) {
      const count = this.getMealCount(mealType)
      const total = this.departmentInfo.memberCount || 1
      return Math.round((count / total) * 100)
    },

    // 获取餐次类型文本
    getMealTypeText(mealType) {
      const meal = this.mealTypes.find(m => m.value === mealType)
      return meal ? meal.label : mealType
    },

    // 格式化日期
    formatDate(date) {
      return this.$formatDate(date)
    },

    // 格式化时间
    formatTime(timeString) {
      return this.$formatTimeOnly(timeString)
    }
  }
}
</script>

<style lang="scss" scoped>
.dept-admin-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 40rpx;
  text-align: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

.overview-section {
  margin-bottom: 40rpx;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: white;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.overview-title {
  font-size: 36rpx;
  font-weight: 600;
}

.dept-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.nav-section {
  margin-bottom: 40rpx;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.nav-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.nav-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.nav-desc {
  font-size: 22rpx;
  color: #666;
}

.today-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-date {
  font-size: 24rpx;
  color: #666;
}

.meal-cards {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.meal-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.meal-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
}

.meal-count {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.meal-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 20rpx;
  color: #666;
  min-width: 60rpx;
  text-align: right;
}

.members-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.member-count {
  font-size: 24rpx;
  color: #666;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.member-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.member-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
}

.member-position {
  font-size: 20rpx;
  color: #666;
}

.member-phone {
  font-size: 20rpx;
  color: #999;
}

.member-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.order-status {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
  font-weight: 500;
  background: #f8d7da;
  color: #721c24;
}

.order-status.has-ordered {
  background: #d4edda;
  color: #155724;
}

.order-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rpx;
}

.order-meal {
  font-size: 16rpx;
  color: #667eea;
}

.order-time {
  font-size: 16rpx;
  color: #999;
}

.view-more {
  text-align: center;
  margin-top: 16rpx;
}

.view-more-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 22rpx;
  transition: all 0.3s ease;
}

.view-more-btn:active {
  background: #5a6fd8;
  transform: translateY(1rpx);
}

/* 弹窗样式 */
.popup-content {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-content.large {
  width: 800rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #e9ecef;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  font-size: 32rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.members-content {
  max-height: 500rpx;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-grid {
    grid-template-columns: 1fr;
  }
  
  .popup-content {
    width: 90vw;
  }
  
  .popup-content.large {
    width: 95vw;
  }
}
</style>
