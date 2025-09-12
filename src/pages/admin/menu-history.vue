<template>
  <view class="menu-history-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">菜单历史</text>
      <view class="header-actions">
        <button @click="refreshData" class="refresh-btn">
          <text class="btn-text">刷新</text>
        </button>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">开始日期</text>
          <picker 
            mode="date" 
            :value="filterParams.startDate" 
            @change="onStartDateChange"
            class="date-picker"
          >
            <view class="picker-text">{{ filterParams.startDate || '请选择' }}</view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">结束日期</text>
          <picker 
            mode="date" 
            :value="filterParams.endDate" 
            @change="onEndDateChange"
            class="date-picker"
          >
            <view class="picker-text">{{ filterParams.endDate || '请选择' }}</view>
          </picker>
        </view>
      </view>
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">餐次类型</text>
          <picker 
            mode="selector" 
            :range="mealOptions" 
            range-key="label"
            :value="selectedMealIndex" 
            @change="onMealChange"
            class="meal-picker"
          >
            <view class="picker-text">{{ mealOptions[selectedMealIndex]?.label || '全部' }}</view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker 
            mode="selector" 
            :range="statusOptions" 
            range-key="label"
            :value="selectedStatusIndex" 
            @change="onStatusChange"
            class="status-picker"
          >
            <view class="picker-text">{{ statusOptions[selectedStatusIndex]?.label || '全部' }}</view>
          </picker>
        </view>
      </view>
      <view class="filter-actions">
        <button @click="applyFilter" class="filter-btn">应用筛选</button>
        <button @click="resetFilter" class="reset-btn">重置</button>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="menuList.length === 0" class="empty-container">
        <text class="empty-text">暂无菜单数据</text>
      </view>
      
      <view v-else class="menu-items">
        <view 
          v-for="menu in menuList" 
          :key="menu._id" 
          class="menu-item"
          @click="viewMenuDetail(menu)"
        >
          <view class="menu-header">
            <view class="menu-date">
              <text class="date-text">{{ formatDate(menu.publishDate) }}</text>
              <text class="meal-text">{{ getMealTypeText(menu.mealType) }}</text>
            </view>
            <view class="menu-status">
              <text :class="['status-badge', `status-${menu.publishStatus}`]">
                {{ getStatusText(menu.publishStatus) }}
              </text>
            </view>
          </view>
          
          <view class="menu-content">
            <view class="menu-info">
              <text class="menu-title">{{ menu.name || '今日菜单' }}</text>
              <text class="menu-description">{{ menu.description || '暂无描述' }}</text>
            </view>
            
            <view class="menu-stats">
              <view class="stat-item">
                <text class="stat-label">菜品数量</text>
                <text class="stat-value">{{ menu.dishCount || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">总价格</text>
                <text class="stat-value">¥{{ menu.totalPrice || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">发布人</text>
                <text class="stat-value">{{ menu.publish_by_name || '未知' }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">创建时间</text>
                <text class="stat-value">{{ $formatTime(menu.createTime) }}</text>
              </view>
            </view>
          </view>
          
          <view class="menu-actions">
            <button @click.stop="editMenu(menu)" class="action-btn edit-btn">
              <text class="btn-text">编辑</text>
            </button>
            <button @click.stop="duplicateMenu(menu)" class="action-btn duplicate-btn">
              <text class="btn-text">复制</text>
            </button>
            <button @click.stop="deleteMenu(menu)" class="action-btn delete-btn">
              <text class="btn-text">删除</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 分页 -->
    <view v-if="totalPages > 1" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage <= 1"
        class="page-btn"
      >
        <text class="btn-text">上一页</text>
      </button>
      <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
      <button 
        @click="nextPage" 
        :disabled="currentPage >= totalPages"
        class="page-btn"
      >
        <text class="btn-text">下一页</text>
      </button>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'MenuHistory',
  mixins: [timeMixin],
  data() {
    return {
      loading: false,
      menuList: [],
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 0,
      
      // 筛选参数
      filterParams: {
        startDate: '',
        endDate: '',
        mealType: '',
        status: ''
      },
      
      // 选择器选项
      selectedMealIndex: 0,
      selectedStatusIndex: 0,
      
      mealOptions: [
        { value: '', label: '全部餐次' },
        { value: 'breakfast', label: '早餐' },
        { value: 'lunch', label: '午餐' },
        { value: 'dinner', label: '晚餐' }
      ],
      
      statusOptions: [
        { value: '', label: '全部状态' },
        { value: 'draft', label: '草稿' },
        { value: 'published', label: '已发布' },
        { value: 'revoked', label: '已撤回' }
      ]
    }
  },
  
  onLoad() {
    console.log('菜单历史页面 onLoad')
    this.initData()
  },
  
  onShow() {
    console.log('菜单历史页面 onShow')
    this.loadMenuHistory()
  },
  
  methods: {
    /**
     * 初始化数据
     */
    initData() {
      // 设置默认日期范围（最近30天）
      const endDate = this.$createDate()
      const startDate = this.$createDate().subtract(30, 'day')
      
      this.filterParams.endDate = this.formatDateForPicker(endDate)
      this.filterParams.startDate = this.formatDateForPicker(startDate)
      
      this.loadMenuHistory()
    },
    
    /**
     * 加载菜单历史
     */
    async loadMenuHistory() {
      try {
        this.loading = true
        
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          startDate: this.filterParams.startDate,
          endDate: this.filterParams.endDate,
          mealType: this.filterParams.mealType,
          status: this.filterParams.status
        }
        
        console.log('加载菜单历史，参数:', params)
        const response = await api.admin.getMenuHistory(params)
        console.log('菜单历史API响应:', response)
        
        if (response && response.success) {
          this.menuList = response.data.list || []
          this.totalCount = response.data.total || 0
          this.totalPages = Math.ceil(this.totalCount / this.pageSize)
          
          console.log('菜单历史加载成功，数量:', this.menuList.length)
          console.log('菜单历史数据:', this.menuList)
          
          // 调试：检查每个菜单项的字段
          this.menuList.forEach((menu, index) => {
            console.log(`菜单历史${index + 1}:`, {
              _id: menu._id,
              name: menu.name,
              publishDate: menu.publishDate,
              mealType: menu.mealType,
              publishStatus: menu.publishStatus,
              dishCount: menu.dishCount
            })
          })
        } else {
          throw new Error(response?.message || '获取菜单历史失败')
        }
      } catch (error) {
        console.error('加载菜单历史失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
        this.menuList = []
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 刷新数据
     */
    refreshData() {
      this.currentPage = 1
      this.loadMenuHistory()
    },
    
    /**
     * 应用筛选
     */
    applyFilter() {
      this.currentPage = 1
      this.loadMenuHistory()
    },
    
    /**
     * 重置筛选
     */
    resetFilter() {
      this.selectedMealIndex = 0
      this.selectedStatusIndex = 0
      this.filterParams.mealType = ''
      this.filterParams.status = ''
      this.initData()
    },
    
    /**
     * 查看菜单详情
     */
    viewMenuDetail(menu) {
      uni.navigateTo({
        url: `/pages/admin/menu-edit?menuId=${menu._id}&mode=view`
      })
    },
    
    /**
     * 编辑菜单
     */
    editMenu(menu) {
      uni.navigateTo({
        url: `/pages/admin/menu-edit?menuId=${menu._id}&mode=edit`
      })
    },
    
    /**
     * 复制菜单
     */
    async duplicateMenu(menu) {
      try {
        uni.showModal({
          title: '确认复制',
          content: `确定要复制 ${this.formatDate(menu.date)} ${this.getMealTypeText(menu.mealType)} 的菜单吗？`,
          success: async (res) => {
            if (res.confirm) {
              // 这里可以调用复制菜单的API
              uni.showToast({
                title: '复制功能开发中',
                icon: 'none'
              })
            }
          }
        })
      } catch (error) {
        console.error('复制菜单失败:', error)
      }
    },
    
    /**
     * 删除菜单
     */
    async deleteMenu(menu) {
      try {
        uni.showModal({
          title: '确认删除',
          content: `确定要删除 ${this.formatDate(menu.date)} ${this.getMealTypeText(menu.mealType)} 的菜单吗？此操作不可恢复。`,
          success: async (res) => {
            if (res.confirm) {
              // 这里可以调用删除菜单的API
              uni.showToast({
                title: '删除功能开发中',
                icon: 'none'
              })
            }
          }
        })
      } catch (error) {
        console.error('删除菜单失败:', error)
      }
    },
    
    /**
     * 上一页
     */
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadMenuHistory()
      }
    },
    
    /**
     * 下一页
     */
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.loadMenuHistory()
      }
    },
    
    /**
     * 日期选择器变化
     */
    onStartDateChange(e) {
      this.filterParams.startDate = e.detail.value
    },
    
    onEndDateChange(e) {
      this.filterParams.endDate = e.detail.value
    },
    
    /**
     * 餐次选择器变化
     */
    onMealChange(e) {
      this.selectedMealIndex = e.detail.value
      this.filterParams.mealType = this.mealOptions[this.selectedMealIndex].value
    },
    
    /**
     * 状态选择器变化
     */
    onStatusChange(e) {
      this.selectedStatusIndex = e.detail.value
      this.filterParams.status = this.statusOptions[this.selectedStatusIndex].value
    },
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
      console.log('菜单历史页面 formatDate 输入:', dateString, '类型:', typeof dateString)
      if (!dateString) {
        console.log('日期字符串为空，返回未知日期')
        return '未知日期'
      }
      try {
        const date = this.$createDate(dateString)
        console.log('解析后的日期对象:', date)
        if (!date || !date.isValid()) {
          console.log('日期无效，返回未知日期')
          return '未知日期'
        }
        const month = date.getMonth() + 1
        const day = date.getDate()
        const result = `${month}月${day}日`
        console.log('格式化结果:', result)
        return result
      } catch (error) {
        console.error('日期格式化失败:', error)
        return '未知日期'
      }
    },
    
    /**
     * 格式化时间
     */
    formatTime(dateString) {
      if (!dateString) return ''
      try {
        const date = this.$createDate(dateString)
        if (!date || !date.isValid()) return ''
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${month}月${day}日 ${hours}:${minutes}`
      } catch (error) {
        console.error('时间格式化失败:', error)
        return ''
      }
    },
    
    /**
     * 格式化日期用于选择器
     */
    formatDateForPicker(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    /**
     * 获取餐次类型文本
     */
    getMealTypeText(mealType) {
      const mealMap = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐'
      }
      return mealMap[mealType] || mealType
    },
    
    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        draft: '草稿',
        published: '已发布',
        revoked: '已撤回'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.menu-history-page {
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
  border-radius: 10rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.refresh-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 15rpx 30rpx;
  border-radius: 6rpx;
  font-size: 28rpx;
}

.filter-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  flex: 1;
}

.filter-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.date-picker,
.meal-picker,
.status-picker {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.filter-actions {
  display: flex;
  gap: 20rpx;
}

.filter-btn,
.reset-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.filter-btn {
  background-color: #409eff;
  color: white;
}

.reset-btn {
  background-color: #909399;
  color: white;
}

.menu-list {
  background: white;
  border-radius: 10rpx;
  overflow: hidden;
}

.loading-container,
.empty-container {
  padding: 100rpx 20rpx;
  text-align: center;
}

.loading-text,
.empty-text {
  font-size: 28rpx;
  color: #999;
}

.menu-items {
  padding: 20rpx;
}

.menu-item {
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.menu-item:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-date {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.meal-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

.status-draft {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.status-published {
  background-color: rgba(39, 174, 96, 0.9);
  color: white;
}

.status-revoked {
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
}

.menu-content {
  padding: 20rpx;
}

.menu-info {
  margin-bottom: 20rpx;
}

.menu-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.menu-description {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.menu-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-top: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.menu-actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
}

.action-btn {
  flex: 1;
  height: 70rpx;
  border: none;
  border-radius: 6rpx;
  font-size: 26rpx;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.duplicate-btn {
  background-color: #67c23a;
  color: white;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30rpx;
  padding: 30rpx;
  background: white;
  border-radius: 10rpx;
  margin-top: 20rpx;
}

.page-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 15rpx 30rpx;
  border-radius: 6rpx;
  font-size: 28rpx;
}

.page-btn:disabled {
  background-color: #c0c4cc;
  color: #909399;
}

.page-info {
  font-size: 28rpx;
  color: #666;
}
</style>

