<template>
  <view class="menu-management-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">菜单管理</view>
      <view class="header-subtitle">管理每日菜单，包括创建、发布、查看、撤回等操作</view>
    </view>

    <!-- 日期和餐次选择 -->
    <view class="date-meal-selector">
      <view class="selector-item">
        <text class="selector-label">日期</text>
        <picker 
          mode="date" 
          :value="selectedDate" 
          @change="onDateChange"
          class="date-picker"
        >
          <view class="picker-display">
            <text class="picker-text">{{ formatDateDisplay(selectedDate) }}</text>
            <text class="picker-icon">📅</text>
          </view>
        </picker>
      </view>
      
      <view class="selector-item">
        <text class="selector-label">餐次</text>
        <picker 
          :value="selectedMealIndex" 
          :range="mealOptions" 
          range-key="name"
          @change="onMealChange"
          class="meal-picker"
        >
          <view class="picker-display">
            <text class="picker-text">{{ mealOptions[selectedMealIndex].name }}</text>
            <text class="picker-icon">🍽️</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 当前菜单状态 -->
    <view class="current-menu-section">
      <view class="section-header">
        <text class="section-title">当前菜单</text>
        <button class="create-btn" @click="createMenu">
          <text class="btn-icon">+</text>
          <text>创建菜单</text>
        </button>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 有菜单时 -->
      <view v-else-if="currentMenu" class="menu-card">
        <view class="menu-header">
          <view class="menu-basic-info">
            <text class="menu-date">{{ formatDateDisplay(currentMenu.publishDate) }}</text>
            <text class="menu-meal-type">{{ getMealTypeText(currentMenu.mealType) }}</text>
          </view>
          <view class="menu-status">
            <text :class="['status-badge', `status-${currentMenu.publishStatus}`]">
              {{ getStatusText(currentMenu.publishStatus) }}
            </text>
          </view>
        </view>
        
        <view class="menu-content">
          <view class="menu-description" v-if="currentMenu.description">
            <text class="description-text">{{ currentMenu.description }}</text>
          </view>
          
          <view class="menu-stats">
            <view class="stat-item">
              <text class="stat-label">菜品数量</text>
              <text class="stat-value">{{ currentMenu.dishes?.length || 0 }}道</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总价格</text>
              <text class="stat-value">¥{{ calculateTotalPrice(currentMenu.dishes) }}</text>
            </view>
            <view class="stat-item" v-if="currentMenu.publishTime">
              <text class="stat-label">发布时间</text>
              <text class="stat-value">{{ formatDateTime(currentMenu.publishTime) }}</text>
            </view>
          </view>
          
          <!-- 菜品预览 -->
          <view v-if="currentMenu.dishes && currentMenu.dishes.length > 0" class="dishes-preview">
            <text class="preview-title">菜品列表</text>
            <view class="dishes-list">
              <view 
                v-for="(dish, index) in currentMenu.dishes.slice(0, 3)" 
                :key="dish.dishId"
                class="dish-preview-item"
              >
                <text class="dish-name">{{ dish.dishName }}</text>
                <text class="dish-price">¥{{ formatPrice(dish.price) }}</text>
              </view>
              <view v-if="currentMenu.dishes.length > 3" class="more-dishes">
                <text>还有{{ currentMenu.dishes.length - 3 }}道菜品...</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="menu-actions">
          <button 
            v-if="currentMenu.publishStatus === 'published'" 
            class="action-btn danger"
            @click="revokeMenu(currentMenu._id)"
          >
            撤回菜单
          </button>
          <button 
            class="action-btn secondary" 
            @click="editMenu(currentMenu)"
          >
            编辑菜单
          </button>
          <button 
            class="action-btn primary" 
            @click="viewMenuDetail(currentMenu)"
          >
            查看详情
          </button>
        </view>
      </view>
      
      <!-- 无菜单时 -->
      <view v-else class="no-menu-state">
        <text class="no-menu-icon">🍽️</text>
        <text class="no-menu-title">暂无菜单</text>
        <text class="no-menu-subtitle">{{ selectedDate }} {{ mealOptions[selectedMealIndex].name }}还没有菜单</text>
        <button class="create-menu-btn" @click="createMenu">
          <text class="btn-icon">+</text>
          <text>立即创建</text>
        </button>
      </view>
    </view>

    <!-- 菜单历史 -->
    <view class="menu-history-section">
      <view class="section-header">
        <text class="section-title">最近菜单</text>
        <button class="view-history-btn" @click="viewMenuHistory">
          <text>查看历史</text>
          <text class="btn-icon">→</text>
        </button>
      </view>
      
      <!-- 历史菜单列表 -->
      <view v-if="menuHistory.length === 0" class="empty-history">
        <text class="empty-text">暂无历史菜单</text>
      </view>
      
      <view v-else class="history-list">
        <view 
          v-for="menu in menuHistory.slice(0, 5)" 
          :key="menu._id"
          class="history-item"
          @click="viewMenuDetail(menu)"
        >
          <view class="history-info">
            <text class="history-date">{{ formatDateDisplay(menu.publishDate) }}</text>
            <text class="history-meal">{{ getMealTypeText(menu.mealType) }}</text>
            <text :class="['history-status', `status-${menu.publishStatus}`]">
              {{ getStatusText(menu.publishStatus) }}
            </text>
          </view>
          <view class="history-stats">
            <text class="history-dishes">{{ menu.dishes?.length || 0 }}道菜品</text>
            <text class="history-price">¥{{ calculateTotalPrice(menu.dishes) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'MenuManagement',
  data() {
    return {
      loading: false,
      selectedDate: '',
      selectedMealIndex: 0,
      currentMenu: null,
      menuHistory: [],
      
      // 餐次选项 - 严格按照接口文档
      mealOptions: [
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ]
    }
  },
  
  onLoad() {
    this.initDefaultDate()
    this.loadCurrentMenu()
    this.loadMenuHistory()
  },
  
  onShow() {
    // 页面显示时重新加载数据
    this.loadCurrentMenu()
    this.loadMenuHistory()
  },
  
  methods: {
    // 初始化默认日期为今天
    initDefaultDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      this.selectedDate = `${year}-${month}-${day}`
    },
    
    // 格式化日期显示
    formatDateDisplay(dateStr) {
      if (!dateStr) return '未知日期'
      
      console.log('formatDateDisplay 输入:', dateStr, '类型:', typeof dateStr)
      
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
    
    // 格式化价格
    formatPrice(price) {
      const num = parseFloat(price) || 0
      return num.toFixed(2)
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
    
    // 日期选择事件
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadCurrentMenu()
    },
    
    // 餐次选择事件
    onMealChange(e) {
      this.selectedMealIndex = parseInt(e.detail.value)
      this.loadCurrentMenu()
    },
    
    // 加载当前菜单 - 使用接口文档的 by-date 接口
    async loadCurrentMenu() {
      this.loading = true
      this.currentMenu = null
      
      try {
        const mealType = this.mealOptions[this.selectedMealIndex].value
        console.log('加载菜单:', this.selectedDate, mealType)
        
        const response = await api.admin.getMenuByDate(this.selectedDate, mealType)
        
        if (response && response.success && response.data) {
          // 管理员页面可以显示所有状态的菜单，包括已撤销的菜单
          // 这里不进行状态过滤，让管理员可以看到所有菜单状态
          this.currentMenu = response.data
          console.log('当前菜单:', this.currentMenu)
        } else {
          // 没有找到菜单是正常情况
          this.currentMenu = null
        }
      } catch (error) {
        console.error('加载当前菜单失败:', error)
        this.currentMenu = null
        
        // 只有在非404错误时才显示错误提示
        if (error.statusCode !== 404) {
          uni.showToast({
            title: '加载菜单失败',
            icon: 'error'
          })
        }
      } finally {
        this.loading = false
      }
    },
    
    // 加载菜单历史
    async loadMenuHistory() {
      try {
        const response = await api.admin.getMenuHistory({
          page: 1,
          pageSize: 10
        })
        
        if (response && response.success && response.data && response.data.list) {
          this.menuHistory = response.data.list
          console.log('菜单历史:', this.menuHistory)
        }
      } catch (error) {
        console.error('加载菜单历史失败:', error)
      }
    },
    
    // 创建菜单
    createMenu() {
      // 传递当前选择的日期和餐次
      const mealType = this.mealOptions[this.selectedMealIndex].value
      uni.navigateTo({
        url: `/pages/admin/menu-edit?date=${this.selectedDate}&mealType=${mealType}`
      })
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
    
    // 撤回菜单
    async revokeMenu(menuId) {
      if (!menuId) {
        uni.showToast({
          title: '菜单ID无效',
          icon: 'error'
        })
        return
      }
      
      try {
        const result = await uni.showModal({
          title: '确认撤回',
          content: '确定要撤回这个菜单吗？撤回后用户将无法看到此菜单。',
          confirmText: '撤回',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          const response = await api.admin.revokeMenu(menuId)
          
          if (response && response.success) {
            uni.showToast({
              title: '菜单撤回成功',
              icon: 'success'
            })
            
            // 重新加载当前菜单
            this.loadCurrentMenu()
            this.loadMenuHistory()
          } else {
            throw new Error(response?.message || '撤回失败')
          }
        }
      } catch (error) {
        console.error('撤回菜单失败:', error)
        uni.showToast({
          title: error.message || '撤回失败',
          icon: 'error'
        })
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
    },
    
    // 查看菜单历史
    viewMenuHistory() {
      uni.navigateTo({
        url: '/pages/admin/menu-history'
      })
    }
  }
}
</script>

<style scoped>
.menu-management-page {
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

.date-meal-selector {
  background: white;
  padding: 20px;
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
}

.selector-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-label {
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

.current-menu-section,
.menu-history-section {
  margin: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.create-btn,
.view-history-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-history-btn {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-icon {
  font-size: 16px;
}

.loading-state {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-text {
  color: #999;
  font-size: 14px;
}

.menu-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.menu-basic-info {
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
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
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
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dishes-preview {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.dish-name {
  font-size: 14px;
  color: #333;
}

.dish-price {
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

.more-dishes {
  padding: 8px 0;
  text-align: center;
}

.more-dishes text {
  font-size: 12px;
  color: #999;
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
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.no-menu-state {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-menu-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.no-menu-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.no-menu-subtitle {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 24px;
}

.create-menu-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
}

.empty-history {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.history-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s ease;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f8f9fa;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-date {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.history-meal {
  font-size: 12px;
  color: #666;
}

.history-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  align-self: flex-start;
}

.history-status.status-draft {
  background: #fff3cd;
  color: #856404;
}

.history-status.status-published {
  background: #d4edda;
  color: #155724;
}

.history-status.status-revoked {
  background: #f8d7da;
  color: #721c24;
}

.history-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.history-dishes {
  font-size: 12px;
  color: #666;
}

.history-price {
  font-size: 14px;
  font-weight: bold;
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .date-meal-selector {
    flex-direction: column;
  }
  
  .menu-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .menu-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .history-stats {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>