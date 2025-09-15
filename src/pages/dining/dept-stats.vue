<template>
  <view class="dept-stats-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">部门报餐统计</text>
      <text class="page-subtitle">{{ statsData.departmentName || '加载中...' }}</text>
    </view>

    <!-- 日期选择器 -->
    <view class="date-selector-section">
      <text class="section-title">统计时间范围</text>
      <view class="date-inputs">
        <view class="date-input-group">
          <text class="date-label">开始日期</text>
          <picker 
            mode="date" 
            :value="dateRange.startDate" 
            @change="onStartDateChange"
          >
            <view class="date-picker">
              {{ dateRange.startDate || '请选择开始日期' }}
            </view>
          </picker>
        </view>
        <view class="date-input-group">
          <text class="date-label">结束日期</text>
          <picker 
            mode="date" 
            :value="dateRange.endDate" 
            @change="onEndDateChange"
          >
            <view class="date-picker">
              {{ dateRange.endDate || '请选择结束日期' }}
            </view>
          </picker>
        </view>
      </view>
      <button class="query-btn" @click="loadStatsData" :disabled="!canQuery">
        <text class="btn-icon">📊</text>
        <text>查询统计</text>
      </button>
    </view>

    <!-- 部门选择器 -->
    <view class="department-selector-section">
      <text class="section-title">选择部门</text>
      <view class="department-selector">
        <picker 
          mode="selector" 
          :value="selectedDeptIndex" 
          :range="departmentOptions"
          range-key="name"
          @change="on部门Change"
        >
          <view class="department-picker">
            <text class="picker-text">{{ selected部门.name || '请选择部门' }}</text>
            <text class="picker-icon">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <text class="section-title">统计概览</text>
      <view class="overview-cards">
        <view class="overview-card">
          <text class="card-number">{{ statsData.totalMembers || 0 }}</text>
          <text class="card-label">总人数</text>
        </view>
        <view class="overview-card">
          <text class="card-number">{{ statsData.totalOrders || 0 }}</text>
          <text class="card-label">报餐次数</text>
        </view>
        <view class="overview-card">
          <text class="card-number">{{ statsData.unique用户s || 0 }}</text>
          <text class="card-label">参与人数</text>
        </view>
        <view class="overview-card">
          <text class="card-number">{{ statsData.orderDays || 0 }}</text>
          <text class="card-label">报餐天数</text>
        </view>
      </view>
    </view>

    <!-- 参与率统计 -->
    <view class="participation-section">
      <text class="section-title">参与率统计</text>
      <view class="participation-card">
        <view class="participation-info">
          <text class="participation-rate">{{ statsData.participationRate || 0 }}%</text>
          <text class="participation-label">参与率</text>
        </view>
        <view class="participation-bar">
          <view 
            class="participation-fill" 
            :style="{ width: (statsData.participationRate || 0) + '%' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 餐次统计 -->
    <view class="meal-stats-section">
      <text class="section-title">餐次类型统计</text>
      <view class="meal-stats-grid">
        <view class="meal-stat-card">
          <text class="meal-icon">🌅</text>
          <text class="meal-label">早餐</text>
          <text class="meal-count">{{ statsData.mealTypeStats?.breakfast || 0 }}</text>
        </view>
        <view class="meal-stat-card">
          <text class="meal-icon">☀️</text>
          <text class="meal-label">午餐</text>
          <text class="meal-count">{{ statsData.mealTypeStats?.lunch || 0 }}</text>
        </view>
        <view class="meal-stat-card">
          <text class="meal-icon">🌙</text>
          <text class="meal-label">晚餐</text>
          <text class="meal-count">{{ statsData.mealTypeStats?.dinner || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn primary" @click="goToOrder">
        <text class="btn-icon">🍽️</text>
        <text>去报餐</text>
      </button>
      <button class="action-btn secondary" @click="goToOverview">
        <text class="btn-icon">📊</text>
        <text>查看概览</text>
      </button>
    </view>

    <!-- 加载提示 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'DeptStats',
  mixins: [timeMixin],
  data() {
    return {
      statsData: {
        departmentName: '部门统计',  // 设置默认部门名称，避免显示"加载中..."
        totalMembers: 0,
        totalOrders: 0,
        unique用户s: 0,
        orderDays: 0,
        participationRate: 0,
        mealTypeStats: {
          breakfast: 0,
          lunch: 0,
          dinner: 0
        }
      },
      dateRange: {
        startDate: '',
        endDate: ''
      },
      loading: false,
      selectedDeptIndex: 0,
      selected部门: { id: '', name: '全部部门' },
      departmentOptions: [
        { id: '', name: '全部部门' }
      ]
    }
  },
  computed: {
    canQuery() {
      return this.dateRange.startDate && this.dateRange.endDate
    }
  },
  mounted() {
    this.initDateRange()
    this.load部门List()
    // 不在页面加载时自动调用loadStatsData，让用户手动点击查询按钮
    // this.loadStatsData()
  },
  methods: {
    // 初始化日期范围（默认最近7天）
    initDateRange() {
      const today = this.$createSafeDate()
      const weekAgo = this.$createSafeDate(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      this.dateRange.endDate = today.toISOString().split('T')[0]
      this.dateRange.startDate = weekAgo.toISOString().split('T')[0]
    },

    // 开始日期选择
    onStartDateChange(e) {
      this.dateRange.startDate = e.detail.value
    },

    // 结束日期选择
    onEndDateChange(e) {
      this.dateRange.endDate = e.detail.value
    },

    // 部门选择
    on部门Change(e) {
      this.selectedDeptIndex = e.detail.value
      this.selected部门 = this.departmentOptions[e.detail.value]
    },

    // 加载部门列表
    async load部门List() {
      try {
        const response = await api.admin.getDepartmentsList()
        if (response.success && response.data) {
          this.departmentOptions = [
            { id: '', name: '全部部门' },
            ...response.data.map(dept => ({
              id: dept.departmentId || dept._id,
              name: dept.departmentName || dept.name
            }))
          ]
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
        // 如果获取失败，保持默认的"全部部门"选项
      }
    },

    // 加载统计数据
    async loadStatsData() {
      if (!this.canQuery) {
        uni.showToast({
          title: '请选择日期范围',
          icon: 'none'
        })
        return
      }

      try {
        this.loading = true
        const params = {
          startDate: this.dateRange.startDate,
          endDate: this.dateRange.endDate
        }
        
        // 注意：不传递departmentId参数，因为API返回的是所有部门的数据
        // 我们通过前端过滤来显示特定部门的数据
        const response = await api.admin.getDepartmentStats(params)
        
        if (response.success) {
          // 调试信息
          console.log('API响应数据:', response.data)
          console.log('当前选择的部门:', this.selected部门)
          
          // 处理不同的数据结构，兼容字段名差异
          this.statsData = this.processStatsData(response.data)
          
          console.log('处理后的统计数据:', this.statsData)
        } else {
          console.error('获取统计数据失败:', response.message)
          // 设置默认值，避免页面异常
          this.statsData = {
            departmentName: '部门统计',
            totalMembers: 0,
            totalOrders: 0,
            unique用户s: 0,
            orderDays: 0,
            participationRate: 0,
            mealTypeStats: {
              breakfast: 0,
              lunch: 0,
              dinner: 0
            }
          }
          uni.showToast({
            title: '获取数据失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        
        let errorMessage = '获取统计数据失败'
        
        // 处理特定错误类型
        if (error.message) {
          if (error.message.includes('权限') || error.message.includes('权限不足')) {
            errorMessage = '权限不足，需要部门管理员及以上权限'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络设置'
          } else if (error.message.includes('日期')) {
            errorMessage = '日期无效，请重新选择'
          } else {
            errorMessage = error.message
          }
        }
        
        // 设置默认值，避免页面异常
        this.statsData = {
          departmentName: '部门统计',
          totalMembers: 0,
          totalOrders: 0,
          unique用户s: 0,
          orderDays: 0,
          participationRate: 0,
          mealTypeStats: {
            breakfast: 0,
            lunch: 0,
            dinner: 0
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 跳转到报餐页面
    goToOrder() {
      uni.navigateTo({
        url: '/pages/dining/dept-order'
      })
    },

    // 跳转到概览页面
    goToOverview() {
      uni.navigateTo({
        url: '/pages/dining/dept-overview'
      })
    },

    // 处理统计数据，兼容不同的字段命名方式
    processStatsData(data) {
      // 如果选择了特定部门，从departments数组中查找对应部门的数据
      if (this.selected部门.id && data.departments) {
        const selectedDept = data.departments.find(dept => 
          dept.departmentId === this.selected部门.id
        )
        
        if (selectedDept) {
          return {
            departmentName: selectedDept.departmentName,
            totalMembers: selectedDept.totalMembers || 0,
            totalOrders: selectedDept.totalOrders || selectedDept.totalorders || 0,
            unique用户s: selectedDept.unique用户s || 0,
            orderDays: selectedDept.orderDays || 0,
            participationRate: selectedDept.participationRate || 0,
            mealTypeStats: selectedDept.mealTypeStats || {
              breakfast: 0,
              lunch: 0,
              dinner: 0
            }
          }
        }
      }
      
      // 如果是系统管理员查看所有部门的数据
      if (data.viewType === 'all_departments' && data.totalStats) {
        const totalStats = data.totalStats
        
        return {
          departmentName: '全部门统计',
          totalMembers: totalStats.totalMembers || 0,
          totalOrders: totalStats.totalOrders || totalStats.totalorders || 0,
          unique用户s: totalStats.unique用户s || 0,
          orderDays: totalStats.orderDays || 0,
          participationRate: totalStats.participationRate || 0,
          mealTypeStats: totalStats.mealTypeStats || {
            breakfast: 0,
            lunch: 0,
            dinner: 0
          }
        }
      }
      
      // 如果是部门管理员查看单个部门的数据，直接返回
      return {
        ...data,
        departmentName: data.departmentName || '部门统计'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dept-stats-container {
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 25rpx;
  text-align: center;
}

.page-title {
  font-size: 42rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
  display: block;
}

.date-selector-section {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.date-inputs {
  display: flex;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.date-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.date-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.date-picker {
  padding: 20rpx 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #333;
  transition: all 0.3s ease;
}

.date-picker:active {
  border-color: #667eea;
  background: white;
}

.query-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.query-btn:disabled {
  background: #6c757d;
  box-shadow: none;
  opacity: 0.6;
}

.query-btn:not(:disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 32rpx;
}

/* 部门选择器样式 */
.department-selector-section {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.department-selector {
  width: 100%;
}

.department-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #333;
  transition: all 0.3s ease;
}

.department-picker:active {
  border-color: #667eea;
  background: white;
}

.picker-text {
  flex: 1;
  text-align: left;
}

.picker-icon {
  font-size: 20rpx;
  color: #667eea;
  margin-left: 10rpx;
}

.stats-overview {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.overview-card {
  text-align: center;
  padding: 12rpx 8rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  min-height: 80rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-number {
  font-size: 32rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.card-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  line-height: 1.2;
}

.participation-section {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.participation-card {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.participation-info {
  text-align: center;
}

.participation-rate {
  font-size: 48rpx;
  font-weight: 600;
  color: #4caf50;
  display: block;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.participation-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  line-height: 1.2;
}

.participation-bar {
  height: 20rpx;
  background: #e9ecef;
  border-radius: 10rpx;
  overflow: hidden;
}

.participation-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  border-radius: 10rpx;
  transition: width 0.3s ease;
}

.meal-stats-section {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.meal-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
}

.meal-stat-card {
  text-align: center;
  padding: 12rpx 8rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  transition: all 0.3s ease;
  min-height: 80rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.meal-stat-card:active {
  transform: scale(0.98);
  background: #e3f2fd;
}

.meal-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 4rpx;
}

.meal-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.meal-count {
  font-size: 28rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
  line-height: 1.2;
}

.action-buttons {
  display: flex;
  gap: 15rpx;
  margin-bottom: 25rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn:active {
  transform: translateY(2rpx);
}

/* 加载遮罩 */
.loading-overlay {
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
}

.loading-content {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .date-inputs {
    flex-direction: column;
  }
  
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10rpx;
  }
  
  .meal-stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .overview-card {
    padding: 10rpx 6rpx;
    min-height: 70rpx;
  }
  
  .card-number {
    font-size: 28rpx;
  }
  
  .card-label {
    font-size: 18rpx;
  }
  
  .meal-stat-card {
    padding: 10rpx 6rpx;
    min-height: 70rpx;
  }
  
  .meal-icon {
    font-size: 28rpx;
  }
  
  .meal-label {
    font-size: 18rpx;
  }
  
  .meal-count {
    font-size: 24rpx;
  }
}

@media (max-width: 480px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8rpx;
  }
  
  .meal-stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8rpx;
  }
  
  .overview-card {
    padding: 8rpx 4rpx;
    min-height: 60rpx;
  }
  
  .card-number {
    font-size: 24rpx;
  }
  
  .card-label {
    font-size: 16rpx;
  }
  
  .meal-stat-card {
    padding: 8rpx 4rpx;
    min-height: 60rpx;
  }
  
  .meal-icon {
    font-size: 24rpx;
  }
  
  .meal-label {
    font-size: 16rpx;
  }
  
  .meal-count {
    font-size: 20rpx;
  }
}
</style>
