<template>
  <view class="admin-confirmation-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">确认就餐管理</text>
      <view class="refresh-btn" @click="refreshData">
        <text class="iconfont">🔄</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-card" v-if="stats">
      <view class="stats-title">
        <text>今日统计</text>
        <text class="stats-date">{{ stats.date }}</text>
      </view>
      
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalStats.totalOrders }}</text>
          <text class="stat-label">总报餐数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalStats.pendingConfirmation }}</text>
          <text class="stat-label">待确认</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalStats.confirmedDining }}</text>
          <text class="stat-label">已确认</text>
        </view>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">日期:</text>
          <input 
            type="date" 
            v-model="filterParams.date" 
            class="date-input"
            @change="onFilterChange"
          />
        </view>
        
        <view class="filter-item">
          <text class="filter-label">餐次:</text>
          <picker 
            :value="mealTypeIndex" 
            :range="mealTypeOptions" 
            @change="onMealTypeChange"
          >
            <view class="picker-input">
              {{ mealTypeOptions[mealTypeIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
      </view>
      
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">部门:</text>
          <picker 
            :value="deptIndex" 
            :range="deptOptions" 
            @change="onDeptChange"
          >
            <view class="picker-input">
              {{ deptOptions[deptIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="filter-item">
          <text class="filter-label">状态:</text>
          <picker 
            :value="statusIndex" 
            :range="statusOptions" 
            @change="onStatusChange"
          >
            <view class="picker-input">
              {{ statusOptions[statusIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 批量操作 -->
    <view class="batch-actions" v-if="selectedOrders.length > 0">
      <view class="selected-info">
        <text>已选择 {{ selectedOrders.length }} 项</text>
      </view>
      <view class="batch-buttons">
        <button class="batch-btn" @click="batchConfirm">
          批量确认
        </button>
        <button class="batch-btn secondary" @click="clearSelection">
          取消选择
        </button>
      </view>
    </view>

    <!-- 待确认列表 -->
    <view class="pending-list">
      <view class="list-header">
        <text class="list-title">待确认列表</text>
        <text class="list-count">共 {{ pendingList.length }} 项</text>
      </view>
      
      <view class="list-content">
        <view 
          v-for="item in pendingList" 
          :key="item.orderId" 
          class="list-item"
          :class="{ selected: selectedOrders.includes(item.orderId) }"
        >
          <view class="item-checkbox" @click="toggleSelection(item.orderId)">
            <text class="checkbox-icon" v-if="selectedOrders.includes(item.orderId)">✓</text>
          </view>
          
          <view class="item-content">
            <view class="item-header">
              <text class="user-name">{{ item.userName }}</text>
              <text class="dept-name">{{ item.deptName }}</text>
            </view>
            
            <view class="item-details">
              <text class="meal-type">{{ item.mealTypeName }}</text>
              <text class="dining-date">{{ item.diningDate }}</text>
            </view>
            
            <view class="item-actions">
              <button 
                class="confirm-btn" 
                @click="confirmSingle(item.orderId)"
                :disabled="isProcessing"
              >
                确认就餐
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && pendingList.length === 0">
      <text class="iconfont">📋</text>
      <text class="empty-text">暂无待确认记录</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 批量确认弹窗 -->
    <uni-popup ref="batchPopup" type="center">
      <view class="batch-popup">
        <view class="popup-header">
          <text class="popup-title">批量确认就餐</text>
          <text class="close-btn" @click="closeBatchPopup">×</text>
        </view>
        
        <view class="popup-content">
          <text class="popup-text">确认要批量确认 {{ selectedOrders.length }} 项就餐记录吗？</text>
          <input 
            v-model="batchRemark" 
            placeholder="请输入备注（可选）"
            class="remark-input"
          />
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeBatchPopup">取消</button>
          <button class="confirm-btn" @click="executeBatchConfirm">确认</button>
        </view>
      </view>
    </uni-popup>

    <!-- 单个确认弹窗 -->
    <uni-popup ref="singlePopup" type="center">
      <view class="single-popup">
        <view class="popup-header">
          <text class="popup-title">确认就餐</text>
          <text class="close-btn" @click="closeSinglePopup">×</text>
        </view>
        
        <view class="popup-content">
          <text class="popup-text">确认要代确认该用户已就餐吗？</text>
          <input 
            v-model="singleRemark" 
            placeholder="请输入备注（可选）"
            class="remark-input"
          />
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeSinglePopup">取消</button>
          <button class="confirm-btn" @click="executeSingleConfirm">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  name: 'AdminDiningConfirmation',
  data() {
    return {
      stats: null,
      pendingList: [],
      selectedOrders: [],
      loading: false,
      isProcessing: false,
      
      // 筛选参数
      filterParams: {
        date: '',
        mealType: '',
        departmentId: '',
        diningStatus: 'ordered'
      },
      
      // 筛选选项
      mealTypeOptions: ['全部', '早餐', '午餐', '晚餐'],
      mealTypeIndex: 0,
      
      deptOptions: ['全部部门'],
      deptIndex: 0,
      
      statusOptions: ['全部', '已报餐', '已就餐', '已取消'],
      statusIndex: 0,
      
      // 弹窗数据
      batchRemark: '',
      singleRemark: '',
      currentOrderId: null,
      
      // 映射关系
      mealTypeMap: {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      },
      
      statusMap: {
        'ordered': '已报餐',
        'dined': '已就餐',
        'cancelled': '已取消'
      }
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    // 初始化页面
    initPage() {
      // 设置默认日期为今天
      this.filterParams.date = this.$getCurrentDate()
      
      this.loadData()
    },

    // 加载数据
    async loadData() {
      await Promise.all([
        this.loadStats(),
        this.loadPendingList(),
        this.loadDepartments()
      ])
    },

    // 加载统计信息
    async loadStats() {
      try {
        const response = await api.diningConfirmation.getStats(
          this.filterParams.date,
          this.filterParams.departmentId
        )
        
        if (response.success) {
          this.stats = response.data
        } else {
          console.error('获取统计信息失败:', response.message)
        }
      } catch (error) {
        console.error('获取统计信息失败:', error)
      }
    },

    // 加载待确认列表
    async loadPendingList() {
      try {
        this.loading = true
        
        const params = {
          page: 1,
          pageSize: 100,
          ...this.getFilterParams()
        }
        
        const response = await api.diningConfirmation.getPendingList(params)
        
        if (response.success) {
          this.pendingList = response.data.records || []
        } else {
          uni.showToast({
            title: response.message || '获取待确认列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取待确认列表失败:', error)
        uni.showToast({
          title: '获取待确认列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 加载部门列表
    async loadDepartments() {
      try {
        const response = await api.admin.getDepartmentsList()
        
        if (response.success) {
          const depts = response.data || []
          this.deptOptions = ['全部部门', ...depts.map(dept => dept.name)]
        } else {
          console.error('获取部门列表失败:', response.message)
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
      }
    },

    // 获取筛选参数
    getFilterParams() {
      const params = {}
      
      if (this.filterParams.date) {
        params.date = this.filterParams.date
      }
      
      if (this.mealTypeIndex > 0) {
        const mealType = Object.keys(this.mealTypeMap)[this.mealTypeIndex - 1]
        params.mealType = mealType
      }
      
      if (this.deptIndex > 0) {
        // 这里需要根据部门名称获取部门ID
        // 简化处理，实际应该从部门列表中获取ID
        params.departmentId = this.filterParams.departmentId
      }
      
      if (this.statusIndex > 0) {
        const status = Object.keys(this.statusMap)[this.statusIndex - 1]
        params.diningStatus = status
      }
      
      return params
    },

    // 筛选条件变化
    onFilterChange() {
      this.loadPendingList()
    },

    // 餐次选择
    onMealTypeChange(e) {
      this.mealTypeIndex = e.detail.value
      this.loadPendingList()
    },

    // 部门选择
    onDeptChange(e) {
      this.deptIndex = e.detail.value
      this.loadPendingList()
    },

    // 状态选择
    onStatusChange(e) {
      this.statusIndex = e.detail.value
      this.loadPendingList()
    },

    // 切换选择状态
    toggleSelection(orderId) {
      const index = this.selectedOrders.indexOf(orderId)
      if (index > -1) {
        this.selectedOrders.splice(index, 1)
      } else {
        this.selectedOrders.push(orderId)
      }
    },

    // 清除选择
    clearSelection() {
      this.selectedOrders = []
    },

    // 批量确认
    batchConfirm() {
      if (this.selectedOrders.length === 0) {
        uni.showToast({
          title: '请先选择要确认的记录',
          icon: 'none'
        })
        return
      }
      
      this.$refs.batchPopup.open()
    },

    // 执行批量确认
    async executeBatchConfirm() {
      try {
        this.isProcessing = true
        uni.showLoading({ title: '批量确认中...' })
        
        const response = await api.diningConfirmation.batchConfirm(
          this.selectedOrders,
          this.batchRemark
        )
        
        if (response.success) {
          uni.showToast({
            title: `批量确认成功 ${response.data.successCount} 项`,
            icon: 'success'
          })
          
          // 刷新数据
          this.clearSelection()
          this.closeBatchPopup()
          this.loadData()
        } else {
          uni.showToast({
            title: response.message || '批量确认失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('批量确认失败:', error)
        uni.showToast({
          title: '批量确认失败',
          icon: 'none'
        })
      } finally {
        this.isProcessing = false
        uni.hideLoading()
      }
    },

    // 单个确认
    confirmSingle(orderId) {
      this.currentOrderId = orderId
      this.$refs.singlePopup.open()
    },

    // 执行单个确认
    async executeSingleConfirm() {
      try {
        this.isProcessing = true
        uni.showLoading({ title: '确认中...' })
        
        const response = await api.diningConfirmation.adminConfirm(
          this.currentOrderId,
          this.singleRemark
        )
        
        if (response.success) {
          uni.showToast({
            title: '确认就餐成功',
            icon: 'success'
          })
          
          // 刷新数据
          this.closeSinglePopup()
          this.loadData()
        } else {
          uni.showToast({
            title: response.message|| '确认就餐失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('确认就餐失败:', error)
        uni.showToast({
          title: '确认就餐失败',
          icon: 'none'
        })
      } finally {
        this.isProcessing = false
        uni.hideLoading()
      }
    },

    // 关闭批量确认弹窗
    closeBatchPopup() {
      this.batchRemark = ''
      this.$refs.batchPopup.close()
    },

    // 关闭单个确认弹窗
    closeSinglePopup() {
      this.singleRemark = ''
      this.currentOrderId = null
      this.$refs.singlePopup.close()
    },

    // 刷新数据
    refreshData() {
      this.loadData()
      uni.stopPullDownRefresh()
    }
  }
}
</script>

<style scoped>
.admin-confirmation-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.refresh-btn {
  padding: 10rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 28rpx;
}

.stats-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.stats-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.stats-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.stats-date {
  font-size: 26rpx;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #2196F3;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.filter-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  width: 100rpx;
  margin-right: 10rpx;
}

.date-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.picker-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-size: 28rpx;
  color: #333;
}

.batch-buttons {
  display: flex;
  gap: 20rpx;
}

.batch-btn {
  padding: 15rpx 30rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #4CAF50;
  color: white;
}

.batch-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.pending-list {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.list-count {
  font-size: 26rpx;
  color: #666;
}

.list-content {
  padding: 0 30rpx;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item.selected {
  background: #f8f9fa;
}

.item-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.item-checkbox .checkbox-icon {
  color: #4CAF50;
  font-size: 24rpx;
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.dept-name {
  font-size: 24rpx;
  color: #666;
}

.item-details {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.meal-type {
  font-size: 26rpx;
  color: #2196F3;
}

.dining-date {
  font-size: 26rpx;
  color: #666;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 15rpx 30rpx;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.confirm-btn:disabled {
  background: #ccc;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-state .iconfont {
  font-size: 120rpx;
  color: #ccc;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
}

.loading-state {
  text-align: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 弹窗样式 */
.batch-popup,
.single-popup {
  width: 600rpx;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #666;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  padding: 30rpx;
}

.popup-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.remark-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
