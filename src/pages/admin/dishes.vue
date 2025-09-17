<template>
  <view class="dishes-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">菜品管理</view>
      <view class="header-subtitle">管理所有菜品信息，包括创建、编辑、状态管理等</view>
    </view>

    <!-- 操作工具栏 -->
    <view class="toolbar">
      <!-- 搜索和筛选 -->
      <view class="search-section">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索菜品名称、描述"
          @input="onSearchInput"
          @confirm="searchDishes"
        />
        <button class="search-btn" @click="searchDishes">🔍</button>
      </view>

      <view class="filter-section">
        <picker 
          class="filter-picker" 
          :value="selectedCategoryIndex" 
          :range="categoryOptions" 
          range-key="name"
          @change="onCategoryChange"
        >
          <view class="picker-text">
            {{ selectedCategoryIndex >= 0 ? categoryOptions[selectedCategoryIndex].name : '全部分类' }}
          </view>
        </picker>

        <picker 
          class="filter-picker" 
          :value="selectedStatusIndex" 
          :range="statusOptions" 
          range-key="name"
          @change="onStatusChange"
        >
          <view class="picker-text">
            {{ selectedStatusIndex >= 0 ? statusOptions[selectedStatusIndex].name : '全部状态' }}
          </view>
        </picker>

        <picker 
          class="filter-picker" 
          :value="selectedRecommendIndex" 
          :range="recommendOptions" 
          range-key="name"
          @change="onRecommendChange"
        >
          <view class="picker-text">
            {{ selectedRecommendIndex >= 0 ? recommendOptions[selectedRecommendIndex].name : '推荐状态' }}
          </view>
        </picker>

        <picker 
          class="filter-picker" 
          :value="selectedMealTypeIndex" 
          :range="mealTypeOptions" 
          range-key="name"
          @change="onMealTypeChange"
        >
          <view class="picker-text">
            {{ selectedMealTypeIndex >= 0 ? mealTypeOptions[selectedMealTypeIndex].name : '全部餐次' }}
          </view>
        </picker>
      </view>

      <!-- 快速筛选按钮 -->
      <view class="quick-filter-section">
        <text class="quick-filter-label">快速筛选：</text>
        <button 
          class="quick-filter-btn" 
          :class="{ 'active': getCurrentMealTypeFilter() === '' }"
          @click="quickFilterByMealType('')"
        >
          全部
        </button>
        <button 
          class="quick-filter-btn" 
          :class="{ 'active': getCurrentMealTypeFilter() === 'breakfast' }"
          @click="quickFilterByMealType('breakfast')"
        >
          早餐
        </button>
        <button 
          class="quick-filter-btn" 
          :class="{ 'active': getCurrentMealTypeFilter() === 'lunch' }"
          @click="quickFilterByMealType('lunch')"
        >
          午餐
        </button>
        <button 
          class="quick-filter-btn" 
          :class="{ 'active': getCurrentMealTypeFilter() === 'dinner' }"
          @click="quickFilterByMealType('dinner')"
        >
          晚餐
        </button>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn primary" @click="openCreateModal">
          <text class="btn-icon">+</text>
          <text>新建菜品</text>
        </button>
        <button class="action-btn secondary" @click="showBatchActions" :disabled="!hasSelectedDishes">
          批量操作 ({{ selectedDishes.length }})
        </button>
      </view>
    </view>

    <!-- 菜品列表 -->
    <view class="dishes-content">
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view v-else-if="dishes.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">暂无菜品</text>
        <text class="empty-hint">点击"新建菜品"开始添加</text>
      </view>

      <view v-else class="dishes-list">
        <!-- 列表头部 -->
          <view class="list-header">
            <checkbox-group @change="toggleSelectAll">
              <checkbox 
                class="select-all-checkbox" 
                value="all"
                :checked="isAllSelected"
              />
            </checkbox-group>
            <text class="header-label">全选</text>
            <text class="dish-count">共 {{ total }} 道菜品</text>
          </view>

        <!-- 菜品列表项 -->
        <view 
          v-for="dish in dishes" 
          :key="dish._id || dish.id"
          class="dish-item"
          :class="{ selected: selectedDishes.includes(dish._id || dish.id) }"
        >
          <!-- 选择框 -->
          <view class="dish-selector">
            <checkbox-group @change="onDishSelect" :data-id="dish._id || dish.id">
              <checkbox 
                :value="dish._id || dish.id"
                :checked="selectedDishes.includes(dish._id || dish.id)"
              />
            </checkbox-group>
          </view>

          <!-- 菜品信息 -->
          <view class="dish-info" @click="viewDishDetail(dish)">
            <view class="dish-main">
              <text class="dish-name">{{ dish.name }}</text>
              <view class="dish-meta">
                <text class="dish-category">{{ dish.categoryName || '未分类' }}</text>
                <text class="dish-price">¥{{ formatPrice(dish.price) }}</text>
              </view>
            </view>
            
            <view class="dish-details">
              <text class="dish-description">{{ dish.description || '暂无描述' }}</text>
              <view class="dish-extra">
                <text v-if="dish.calories" class="nutrition-info">{{ dish.calories }}kcal</text>
                <text v-if="dish.isRecommended" class="recommend-tag">推荐</text>
                <view v-if="dish.meal_types && dish.meal_types.length > 0" class="meal-types">
                  <text v-for="mealType in dish.meal_types" :key="mealType" class="meal-type-tag">
                    {{ getMealTypeText(mealType) }}
                  </text>
                </view>
                <view class="dish-status" :class="getStatusClass(dish.status)">
                  <text class="status-text">{{ getStatusText(dish.status) }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="dish-actions">
            <button class="action-btn" @click="editDish(dish)">编辑</button>
            <button class="action-btn danger" @click="deleteDish(dish)">删除</button>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view v-if="total > pageSize" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        <button 
          class="page-btn" 
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </view>
    </view>

    <!-- 新建/编辑菜品弹窗 -->
    <DishEditModal
      :visible="showDishModal"
      :dish="currentDish"
      :categories="categories"
      :is编辑="is编辑"
      @close="closeDishModal"
      @save="handle保存Dish"
    />

    <!-- 批量操作弹窗 -->
    <view v-if="showBatchModal" class="modal-overlay" @click="closeBatchModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">批量操作</text>
          <button class="close-btn" @click="closeBatchModal">✕</button>
        </view>

        <view class="modal-body">
          <view class="batch-info">
            <text>已选择 {{ selectedDishes.length }} 道菜品</text>
          </view>

          <view class="batch-actions">
            <button class="batch-btn" @click="batchUpdateStatus('active')">批量上架</button>
            <button class="batch-btn" @click="batchUpdateStatus('inactive')">批量下架</button>
            <button class="batch-btn danger" @click="batch删除">批量删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import DishEditModal from '@/components/DishEditModal.vue'

export default {
  name: 'DishesManagement',
  components: {
    DishEditModal
  },
  data() {
    return {
      // 搜索和筛选
      searchKeyword: '',
      selectedCategoryIndex: -1,
      selectedStatusIndex: -1,
      selectedRecommendIndex: -1,
      selectedMealTypeIndex: -1,
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 数据
      dishes: [],
      categories: [],
      loading: false,
      
      // 选择状态
      selectedDishes: [],
      
      // 弹窗状态
      showDishModal: false,
      showBatchModal: false,
      is编辑: false,
      currentDish: null
    }
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    
    hasSelectedDishes() {
      return this.selectedDishes.length > 0
    },
    
    isAllSelected() {
      return this.dishes.length > 0 && this.selectedDishes.length === this.dishes.length
    },
    
    categoryOptions() {
      return [
        { id: '', name: '全部分类' },
        ...this.categories
      ]
    },
    
    statusOptions() {
      return [
        { value: '', name: '全部状态' },
        { value: 'active', name: '已上架' },
        { value: 'inactive', name: '已下架' },
        { value: 'deleted', name: '已删除' }
      ]
    },
    
    recommendOptions() {
      return [
        { value: '', name: '全部' },
        { value: 'true', name: '推荐菜品' },
        { value: 'false', name: '普通菜品' }
      ]
    },
    
    mealTypeOptions() {
      return [
        { value: '', name: '全部餐次' },
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ]
    }
  },
  
  onLoad() {
    this.loadCategories()
    this.loadDishes()
  },
  
  methods: {
    // 数据加载
    async loadCategories() {
      try {
        const response = await api.admin.getDishCategories()
        if (response && response.success) {
          this.categories = response.data || []
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        this.categories = [
          { id: 'main', name: '主菜' },
          { id: 'meat', name: '荤菜' },
          { id: 'vegetable', name: '素菜' },
          { id: 'soup', name: '汤类' },
          { id: 'dessert', name: '甜点' }
        ]
      }
    },

    async loadDishes() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword.trim(),
          categoryId: this.selectedCategoryIndex > 0 ? this.categoryOptions[this.selectedCategoryIndex].id : '',
          status: this.selectedStatusIndex > 0 ? this.statusOptions[this.selectedStatusIndex].value : '',
          isRecommended: this.selectedRecommendIndex > 0 ? this.recommendOptions[this.selectedRecommendIndex].value : '',
          mealType: this.selectedMealTypeIndex > 0 ? this.mealTypeOptions[this.selectedMealTypeIndex].value : ''
        }
        
        const response = await api.admin.getDishesList(params)
        if (response && response.success) {
          let dishesData = response.data.list || []
          
          // 去重处理
          const uniqueDishes = dishesData.filter((dish, index, arr) => {
            if (!dish || !dish._id) return false
            return arr.findIndex(d => d._id === dish._id) === index
          })
          
          this.dishes = uniqueDishes
          this.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载菜品失败:', error)
        uni.showToast({
          title: '加载菜品失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 搜索和筛选
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.loadDishes()
      }, 500)
    },

    searchDishes() {
      this.currentPage = 1
      this.loadDishes()
    },

    onCategoryChange(e) {
      this.selectedCategoryIndex = e.detail.value
      this.currentPage = 1
      this.loadDishes()
    },

    onStatusChange(e) {
      this.selectedStatusIndex = e.detail.value
      this.currentPage = 1
      this.loadDishes()
    },

    onRecommendChange(e) {
      this.selectedRecommendIndex = e.detail.value
      this.currentPage = 1
      this.loadDishes()
    },

    onMealTypeChange(e) {
      this.selectedMealTypeIndex = e.detail.value
      this.currentPage = 1
      this.loadDishes()
    },

    // 快速筛选方法
    quickFilterByMealType(mealType) {
      if (mealType === '') {
        this.selectedMealTypeIndex = 0
      } else {
        const index = this.mealTypeOptions.findIndex(option => option.value === mealType)
        this.selectedMealTypeIndex = index >= 0 ? index : 0 // 防止找不到时返回-1
      }
      this.currentPage = 1
      this.loadDishes()
    },

    // 分页
    changePage(page) {
      this.currentPage = page
      this.loadDishes()
    },

    // 选择操作
    toggleSelectAll(e) {
      // 在微信小程序中，checkbox-group的change事件返回选中的value数组
      const checkedValues = e.detail.value || []
      const isChecked = checkedValues.includes('all')
      
      if (isChecked) {
        this.selectedDishes = this.dishes.map(dish => dish._id || dish.id)
      } else {
        this.selectedDishes = []
      }
    },

    onDishSelect(e) {
      // 在微信小程序中，checkbox-group的change事件返回选中的value数组
      const checkedValues = e.detail.value || []
      const dishId = e.currentTarget.dataset.id
      
      if (checkedValues.includes(dishId) && !this.selectedDishes.includes(dishId)) {
        this.selectedDishes.push(dishId)
      } else if (!checkedValues.includes(dishId) && this.selectedDishes.includes(dishId)) {
        this.selectedDishes = this.selectedDishes.filter(id => id !== dishId)
      }
    },

    // 菜品操作
    openCreateModal() {
      console.log('打开新建菜品弹窗', { categories: this.categories })
      this.is编辑 = false
      this.currentDish = null
      this.showDishModal = true
    },

    editDish(dish) {
      this.is编辑 = true
      this.currentDish = dish
      this.showDishModal = true
    },

    async handle保存Dish(dishData) {
      try {
        let response
        if (this.is编辑) {
          response = await api.admin.updateDish(this.currentDish._id || this.currentDish.id, dishData)
        } else {
          response = await api.admin.createDish(dishData)
        }

        if (response && response.success) {
          uni.showToast({
            title: this.is编辑 ? '菜品修改成功' : '菜品创建成功',
            icon: 'success'
          })
          this.closeDishModal()
          this.loadDishes()
        }
      } catch (error) {
        console.error('保存菜品失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      }
    },

    async deleteDish(dish) {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: `确定要删除菜品"${dish.name}"吗？`,
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          const response = await api.admin.deleteDish(dish._id || dish.id)
          if (response && response.success) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadDishes()
          }
        }
      } catch (error) {
        console.error('删除菜品失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },

    // 批量操作
    showBatchActions() {
      this.showBatchModal = true
    },

    async batchUpdateStatus(status) {
      try {
        const statusText = status === 'active' ? '上架' : '下架'
        const result = await uni.showModal({
          title: '确认操作',
          content: `确定要${statusText}选中的 ${this.selectedDishes.length} 道菜品吗？`,
          confirmText: statusText,
          confirmColor: '#667eea'
        })
        
        if (result.confirm) {
          const response = await api.admin.batchUpdateDishStatus(this.selectedDishes, status)
          if (response && response.success) {
            uni.showToast({
              title: `${statusText}成功`,
              icon: 'success'
            })
            this.selectedDishes = []
            this.closeBatchModal()
            this.loadDishes()
          }
        }
      } catch (error) {
        console.error('批量更新状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    },

    async batch删除() {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: `确定要删除选中的 ${this.selectedDishes.length} 道菜品吗？此操作不可恢复！`,
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          // 使用批量删除接口
          const response = await api.admin.batchDeleteDishes(this.selectedDishes)
          if (response && response.success) {
            uni.showToast({
              title: '批量删除成功',
              icon: 'success'
            })
            this.selectedDishes = []
            this.closeBatchModal()
            this.loadDishes()
          }
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },

    // 弹窗控制
    closeDishModal() {
      this.showDishModal = false
      this.currentDish = null
    },

    closeBatchModal() {
      this.showBatchModal = false
    },

    // 工具方法
    formatPrice(price) {
      if (price === null || price === undefined || price === '') {
        return '0.00'
      }
      const numPrice = Number(price)
      if (isNaN(numPrice) || numPrice <= 0) {
        return '0.00'
      }
      return numPrice.toFixed(2)
    },

    getStatusText(status) {
      const statusMap = {
        'active': '已上架',
        'inactive': '已下架',
        'deleted': '已删除'
      }
      return statusMap[status] || '未知'
    },

    getStatusClass(status) {
      const classMap = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'deleted': 'status-deleted'
      }
      return classMap[status] || ''
    },

    viewDishDetail(dish) {
      // 查看菜品详情
      console.log('查看菜品详情:', dish)
    },

    getMealTypeText(mealType) {
      const mealTypeMap = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      }
      return mealTypeMap[mealType] || mealType
    },

    getCurrentMealTypeFilter() {
      if (this.selectedMealTypeIndex > 0 && this.selectedMealTypeIndex < this.mealTypeOptions.length) {
        return this.mealTypeOptions[this.selectedMealTypeIndex].value
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.dishes-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
  color: white;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 操作工具栏 */
.toolbar {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.search-section {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
}

.search-input {
  flex: 1;
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  background: none;
  border: none;
  outline: none;
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-section {
  display: flex;
  gap: 20rpx;
  align-items: center;
  flex-wrap: wrap;
}

.filter-picker {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 15rpx 20rpx;
  font-size: 26rpx;
  color: #333;
  border: 2rpx solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-text {
  color: #666;
}

.quick-filter-section {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.quick-filter-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.quick-filter-btn {
  padding: 12rpx 24rpx;
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
  border-radius: 20rpx;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.quick-filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.quick-filter-btn:active {
  transform: scale(0.95);
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.btn-icon {
  font-size: 28rpx;
}

/* 菜品列表 */
.dishes-content {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  color: #999;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid #f3f3f3;
  border-top: 8rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  display: block;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 20rpx;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 15rpx 20rpx;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.select-all-checkbox {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
}

.header-label {
  font-size: 26rpx;
  color: #333;
  margin-right: auto;
}

.dish-count {
  font-size: 24rpx;
  color: #666;
}

.dish-item {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  display: flex;
  align-items: center;
  padding: 15rpx 20rpx;
}

.dish-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.dish-item:active {
  transform: scale(0.98);
}

.dish-selector {
  flex-shrink: 0;
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dish-selector checkbox {
  width: 30rpx;
  height: 30rpx;
  color: #667eea;
}

.dish-info {
  flex: 1;
  padding: 0 20rpx;
  min-width: 0;
}

.dish-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.dish-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-meta {
  display: flex;
  gap: 16rpx;
  font-size: 22rpx;
  color: #666;
  flex-shrink: 0;
}

.dish-details {
  width: 100%;
}

.dish-description {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-extra {
  display: flex;
  gap: 16rpx;
  font-size: 22rpx;
  color: #666;
  flex-wrap: wrap;
}

.nutrition-info {
  background: #f8f9fa;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
}

.recommend-tag {
  background: #27ae60;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: white;
}

.meal-types {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  margin-right: 10rpx;
}

.meal-type-tag {
  background: #667eea;
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  font-size: 18rpx;
  color: white;
}

.dish-status {
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: white;
  margin-right: 10rpx;
}

.dish-status.status-active {
  background: #27ae60;
}

.dish-status.status-inactive {
  background: #e74c3c;
}

.dish-status.status-deleted {
  background: #95a5a6;
}

.dish-actions {
  flex-shrink: 0;
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.action-btn {
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.action-btn:active {
  transform: scale(0.95);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  margin-top: 30rpx;
}

.page-btn {
  padding: 20rpx 30rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.page-btn:disabled {
  background: #ccc;
  color: #999;
}

.page-info {
  font-size: 26rpx;
  color: #333;
}

/* 批量操作弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #eee;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.batch-info {
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #333;
}

.batch-actions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.batch-btn {
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
}

.batch-btn.primary {
  background: #667eea;
  color: white;
}

.batch-btn.secondary {
  background: #f8f9fa;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.batch-btn.danger {
  background: #e74c3c;
  color: white;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .dishes-list {
    padding: 10rpx;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>