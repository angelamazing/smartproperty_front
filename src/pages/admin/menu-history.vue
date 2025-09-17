<template>
  <view class="menu-history-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">菜单历史</view>
      <view class="header-subtitle">查看和管理所有历史菜单记录</view>
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
            <view class="picker-display">
              <text class="picker-text">
                {{ filterParams.startDate || '选择开始日期' }}
              </text>
              <text class="picker-icon">📅</text>
            </view>
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
            <view class="picker-display">
              <text class="picker-text">
                {{ filterParams.endDate || '选择结束日期' }}
              </text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
        </view>
      </view>
      
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">餐次类型</text>
          <picker 
            :value="filterParams.mealTypeIndex" 
            :range="mealTypeOptions" 
            range-key="name"
            @change="onMealTypeChange"
            class="meal-picker"
          >
            <view class="picker-display">
              <text class="picker-text">
                {{ mealTypeOptions[filterParams.mealTypeIndex].name }}
              </text>
              <text class="picker-icon">🍽️</text>
            </view>
          </picker>
        </view>
        
        <view class="filter-actions">
          <button class="filter-btn" @click="applyFilter">
            <text class="btn-icon">🔍</text>
            <text>搜索</text>
          </button>
          <button class="reset-btn" @click="resetFilter">
            <text class="btn-icon">🔄</text>
            <text>重置</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list-section">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="menuList.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无菜单记录</text>
        <text class="empty-subtitle">当前筛选条件下没有找到菜单</text>
        <button class="reset-filter-btn" @click="resetFilter">
          <text>重置筛选条件</text>
        </button>
      </view>
      
      <!-- 菜单列表 -->
      <view v-else class="menu-list">
        <view 
          v-for="menu in menuList" 
          :key="menu._id"
          class="menu-item"
          @click="viewMenuDetail(menu)"
        >
          <view class="menu-header">
            <view class="menu-date-info">
              <text class="menu-date">{{ formatDateDisplay(menu.publishDate) }}</text>
              <text class="menu-meal-type">{{ getMealTypeText(menu.mealType) }}</text>
            </view>
            <view class="menu-status">
              <text :class="['status-badge', `status-${menu.publishStatus}`]">
                {{ getStatusText(menu.publishStatus) }}
              </text>
            </view>
          </view>
          
          <view class="menu-content">
            <view class="menu-description" v-if="menu.description">
              <text class="description-text">{{ menu.description }}</text>
            </view>
            
            <view class="menu-stats">
              <view class="stat-item">
                <text class="stat-label">菜品数量</text>
                <text class="stat-value">{{ menu.dishes?.length || 0 }}道</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">总价格</text>
                <text class="stat-value">¥{{ calculateTotalPrice(menu.dishes) }}</text>
              </view>
              <view class="stat-item" v-if="menu.publishTime">
                <text class="stat-label">发布时间</text>
                <text class="stat-value">{{ formatDateTime(menu.publishTime) }}</text>
              </view>
              <view class="stat-item" v-if="menu.createTime">
                <text class="stat-label">创建时间</text>
                <text class="stat-value">{{ formatDateTime(menu.createTime) }}</text>
              </view>
            </view>
          </view>
          
          <view class="menu-actions">
            <button 
              @click.stop="editMenu(menu)" 
              class="action-btn edit-btn"
              :disabled="menu.publishStatus === 'revoked'"
            >
              <text class="btn-text">编辑</text>
            </button>
            <button 
              @click.stop="duplicateMenu(menu)" 
              class="action-btn duplicate-btn"
            >
              <text class="btn-text">复制</text>
            </button>
            <button 
              @click.stop="deleteMenu(menu)" 
              class="action-btn delete-btn"
              v-if="menu.publishStatus === 'draft'"
            >
              <text class="btn-text">删除</text>
            </button>
          </view>
        </view>
      </view>
      
      <!-- 分页信息 -->
      <view v-if="pagination.total > 0" class="pagination-info">
        <text class="pagination-text">
          共{{ pagination.total }}条记录，第{{ pagination.page }}/{{ pagination.totalPages }}页
        </text>
        
        <!-- 分页按钮 -->
        <view class="pagination-buttons">
          <button 
            class="page-btn" 
            @click="prevPage"
            :disabled="pagination.page <= 1"
          >
            上一页
          </button>
          <button 
            class="page-btn" 
            @click="nextPage"
            :disabled="pagination.page >= pagination.totalPages"
          >
            下一页
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'MenuHistory',
  data() {
    return {
      loading: false,
      menuList: [],
      
      // 筛选参数 - 严格按照接口文档
      filterParams: {
        startDate: '',
        endDate: '',
        mealTypeIndex: 0, // 0表示全部
        page: 1,
        pageSize: 20
      },
      
      // 餐次选项 - 包含"全部"选项
      mealTypeOptions: [
        { value: '', name: '全部餐次' },
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ],
      
      // 分页信息
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
      }
    }
  },
  
  onLoad() {
    this.initDefaultFilter()
    this.loadMenuHistory()
  },
  
  onShow() {
    // 页面显示时重新加载数据
    this.loadMenuHistory()
  },
  
  methods: {
    // 初始化默认筛选条件
    initDefaultFilter() {
      const today = new Date()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      
      this.filterParams.endDate = this.formatDateForPicker(today)
      this.filterParams.startDate = this.formatDateForPicker(thirtyDaysAgo)
    },
    
    // 格式化日期为选择器格式
    formatDateForPicker(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 格式化日期显示
    formatDateDisplay(dateStr) {
      if (!dateStr) return '未知日期'
      
      console.log('菜单历史页面 formatDateDisplay 输入:', dateStr, '类型:', typeof dateStr)
      
      try {
        let date
        
        // 处理多种可能的日期格式
        if (typeof dateStr === 'string') {
          // 去掉可能的时间部分，只保留日期
          let cleanDateStr = dateStr.split('T')[0].split(' ')[0]
          
          // 替换斜杠为短横线，确保格式一致
          cleanDateStr = cleanDateStr.replace(/\//g, '-')
          
          console.log('清理后的日期字符串:', cleanDateStr)
          
          // 尝试直接解析
          date = new Date(cleanDateStr + 'T00:00:00')
          
          // 如果解析失败，尝试其他格式
          if (isNaN(date.getTime())) {
            // 尝试原始字符串
            date = new Date(dateStr)
            
            // 如果还是失败，尝试手动解析
            if (isNaN(date.getTime())) {
              const parts = cleanDateStr.split('-')
              if (parts.length >= 3) {
                const year = parseInt(parts[0])
                const month = parseInt(parts[1]) - 1 // 月份从0开始
                const day = parseInt(parts[2])
                date = new Date(year, month, day)
              }
            }
          }
        } else {
          date = new Date(dateStr)
        }
        
        console.log('解析后的日期对象:', date, '有效性:', !isNaN(date.getTime()))
        
        if (isNaN(date.getTime())) {
          console.error('无法解析日期:', dateStr)
          return '未知日期'
        }
        
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']
        const weekday = weekdays[date.getDay()]
        
        const result = `${month}月${day}日 周${weekday}`
        console.log('格式化结果:', result)
        
        return result
      } catch (error) {
        console.error('日期格式化出错:', error, '原始数据:', dateStr)
        return '未知日期'
      }
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知时间'
      
      try {
        const date = new Date(dateTimeStr)
        if (isNaN(date.getTime())) return '未知时间'
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } catch (error) {
        return '未知时间'
      }
    },
    
    // 计算总价格
    calculateTotalPrice(dishes) {
      if (!dishes || !Array.isArray(dishes)) return '0.00'
      
      const total = dishes.reduce((sum, dish) => {
        const price = parseFloat(dish.price) || 0
        return sum + price
      }, 0)
      
      return total.toFixed(2)
    },
    
    // 获取餐次文本
    getMealTypeText(mealType) {
      const mealTypeMap = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      }
      return mealTypeMap[mealType] || mealType
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'revoked': '已撤回'
      }
      return statusMap[status] || status
    },
    
    // 开始日期选择事件
    onStartDateChange(e) {
      this.filterParams.startDate = e.detail.value
    },
    
    // 结束日期选择事件
    onEndDateChange(e) {
      this.filterParams.endDate = e.detail.value
    },
    
    // 餐次类型选择事件
    onMealTypeChange(e) {
      this.filterParams.mealTypeIndex = parseInt(e.detail.value)
    },
    
    // 应用筛选
    applyFilter() {
      this.filterParams.page = 1 // 重置到第一页
      this.loadMenuHistory()
    },
    
    // 重置筛选条件
    resetFilter() {
      this.filterParams.mealTypeIndex = 0
      this.filterParams.page = 1
      this.initDefaultFilter()
      this.loadMenuHistory()
    },
    
    // 加载菜单历史 - 严格按照接口文档
    async loadMenuHistory() {
      this.loading = true
      
      try {
        // 构建请求参数
        const params = {
          page: this.filterParams.page,
          pageSize: this.filterParams.pageSize
        }
        
        // 添加可选参数
        if (this.filterParams.startDate) {
          params.startDate = this.filterParams.startDate
        }
        
        if (this.filterParams.endDate) {
          params.endDate = this.filterParams.endDate
        }
        
        // 餐次类型（0表示全部，不传参数）
        if (this.filterParams.mealTypeIndex > 0) {
          params.mealType = this.mealTypeOptions[this.filterParams.mealTypeIndex].value
        }
        
        console.log('请求菜单历史参数:', params)
        
        const response = await api.admin.getMenuHistory(params)
        
        if (response && response.success && response.data) {
          this.menuList = response.data.list || []
          
          // 更新分页信息
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
          
          console.log('菜单历史加载成功:', this.menuList.length, '条记录')
        } else {
          throw new Error(response?.message || '获取菜单历史失败')
        }
      } catch (error) {
        console.error('加载菜单历史失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
        this.menuList = []
        this.pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 }
      } finally {
        this.loading = false
      }
    },
    
    // 上一页
    prevPage() {
      if (this.pagination.page > 1) {
        this.filterParams.page = this.pagination.page - 1
        this.loadMenuHistory()
      }
    },
    
    // 下一页
    nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.filterParams.page = this.pagination.page + 1
        this.loadMenuHistory()
      }
    },
    
    // 编辑菜单
    editMenu(menu) {
      if (!menu || !menu._id) {
        uni.showToast({
          title: '菜单ID无效',
          icon: 'error'
        })
        return
      }
      
      uni.navigateTo({
        url: `/pages/admin/menu-edit?menuId=${menu._id}`
      })
    },
    
    // 复制菜单
    duplicateMenu(menu) {
      if (!menu) {
        uni.showToast({
          title: '菜单数据无效',
          icon: 'error'
        })
        return
      }
      
      // 缓存菜单数据用于复制
      uni.setStorageSync('duplicateMenuData', {
        mealType: menu.mealType,
        description: menu.description,
        dishes: menu.dishes || []
      })
      
      uni.navigateTo({
        url: '/pages/admin/menu-edit?action=duplicate'
      })
    },
    
    // 删除菜单（仅草稿状态）
    async deleteMenu(menu) {
      if (!menu || !menu._id) {
        uni.showToast({
          title: '菜单ID无效',
          icon: 'error'
        })
        return
      }
      
      if (menu.publishStatus !== 'draft') {
        uni.showToast({
          title: '只能删除草稿状态的菜单',
          icon: 'error'
        })
        return
      }
      
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: '确定要删除这个菜单草稿吗？删除后无法恢复。',
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          // 直接调用删除接口
          const response = await api.admin.deleteMenu(menu._id)
          
          if (response && response.success) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            // 重新加载数据
            this.loadMenuHistory()
          } else {
            throw new Error(response?.message || '删除失败')
          }
        }
      } catch (error) {
        console.error('删除菜单失败:', error)
        
        // 检查是否是404错误（接口不存在）
        if (error.message && error.message.includes('404')) {
          uni.showToast({
            title: '删除接口暂未实现，请联系管理员',
            icon: 'none',
            duration: 3000
          })
        } else {
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'error'
          })
        }
      }
    },
    
    // 查看菜单详情
    viewMenuDetail(menu) {
      if (!menu || !menu._id) {
        uni.showToast({
          title: '菜单ID无效',
          icon: 'error'
        })
        return
      }
      
      // 缓存菜单数据
      uni.setStorageSync('currentMenuDetail', menu)
      
      uni.navigateTo({
        url: `/pages/admin/menu-detail?menuId=${menu._id}`
      })
    }
  }
}
</script>

<style scoped>
.menu-history-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 40px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  color: white;
  text-align: center;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.filter-section {
  background: white;
  padding: 20px;
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.date-picker,
.meal-picker {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.picker-display {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.picker-icon {
  font-size: 16px;
  opacity: 0.6;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.filter-btn,
.reset-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn {
  background: #667eea;
  color: white;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.btn-icon {
  font-size: 16px;
}

.menu-list-section {
  margin: 0 20px;
}

.loading-state,
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-text {
  color: #999;
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 24px;
}

.reset-filter-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.menu-date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-date {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.menu-meal-type {
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-draft {
  background: #fff3cd;
  color: #856404;
}

.status-published {
  background: #d4edda;
  color: #155724;
}

.status-revoked {
  background: #f8d7da;
  color: #721c24;
}

.menu-content {
  margin-bottom: 20px;
}

.menu-description {
  margin-bottom: 16px;
}

.description-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.menu-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.menu-actions {
  display: flex;
  gap: 12px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.action-btn {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.duplicate-btn {
  background: #28a745;
  color: white;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.pagination-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-text {
  font-size: 14px;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 12px;
}

.page-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-actions {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .menu-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .menu-actions {
    flex-direction: column;
  }
  
  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>