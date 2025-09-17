<template>
  <view class="dish-selector-modal" v-if="visible">
    <view class="modal-overlay" @click="handleClose"></view>
    <view class="modal-content">
      <!-- 头部 -->
      <view class="modal-header">
        <text class="modal-title">选择菜品</text>
        <text class="close-btn" @click="handleClose">×</text>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索菜品名称"
          @input="onSearch"
        />
        <text class="search-icon">🔍</text>
      </view>

      <!-- 餐次筛选 -->
      <view class="meal-type-filter">
        <view class="filter-label">餐次筛选：</view>
        <view class="meal-type-list">
          <view 
            class="meal-type-item" 
            :class="{ active: selectedMealType === '' }"
            @click="selectMealType('')"
          >
            全部
          </view>
          <view 
            class="meal-type-item" 
            :class="{ active: selectedMealType === 'breakfast' }"
            @click="selectMealType('breakfast')"
          >
            早餐
          </view>
          <view 
            class="meal-type-item" 
            :class="{ active: selectedMealType === 'lunch' }"
            @click="selectMealType('lunch')"
          >
            午餐
          </view>
          <view 
            class="meal-type-item" 
            :class="{ active: selectedMealType === 'dinner' }"
            @click="selectMealType('dinner')"
          >
            晚餐
          </view>
        </view>
      </view>

      <!-- 菜品列表 -->
      <view class="dishes-container">
        <view v-if="loading" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-else-if="error" class="error-container">
          <text class="error-text">{{ error }}</text>
          <button class="retry-btn" @click="loadDishes">重试</button>
        </view>
        
        <view v-else-if="filteredDishes.length === 0" class="empty-container">
          <text class="empty-text">暂无菜品</text>
        </view>
        
        <view v-else class="dishes-list">
          <view 
            v-for="dish in filteredDishes" 
            :key="dish._id || dish.id"
            class="dish-item"
            :class="{ selected: isSelected(dish._id || dish.id) }"
            @click="toggleDish(dish)"
          >
            <view class="dish-checkbox">
              <checkbox 
                :value="dish._id || dish.id" 
                :checked="isSelected(dish._id || dish.id)"
                @change="() => toggleDish(dish)"
              />
            </view>
            
            <view class="dish-image">
              <image 
                :src="dish.image || '/static/logo.png'" 
                mode="aspectFill"
                @error="handleImage错误"
                class="dish-img"
              />
            </view>
            
            <view class="dish-info">
              <text class="dish-name">{{ dish.name }}</text>
              <text class="dish-category">{{ dish.categoryName || '未分类' }}</text>
              <view v-if="dish.meal_types && dish.meal_types.length > 0" class="meal-types">
                <text 
                  v-for="mealType in dish.meal_types" 
                  :key="mealType" 
                  class="meal-type-tag"
                >
                  {{ getMealTypeText(mealType) }}
                </text>
              </view>
              <text class="dish-price">¥{{ formatPrice(dish.price) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="modal-footer">
        <view class="selection-info">
          <text class="selected-count">已选择 {{ selectedDishes.length }} 道菜品</text>
          <text class="total-price">总计: ¥{{ totalPrice }}</text>
        </view>
        <view class="action-buttons">
          <button class="btn btn-cancel" @click="handleClose">取消</button>
          <button class="btn btn-confirm" @click="confirmSelection">确认选择</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'DishSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedDishIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      error: '',
      dishes: [],
      searchKeyword: '',
      selectedMealType: '',
      selectedDishes: []
    }
  },
  computed: {
    filteredDishes() {
      let filtered = this.dishes
      
      // 餐次筛选
      if (this.selectedMealType !== '') {
        filtered = filtered.filter(dish => 
          dish.meal_types && dish.meal_types.includes(this.selectedMealType)
        )
      }
      
      // 关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(dish => 
          dish.name.toLowerCase().includes(keyword) ||
          (dish.description && dish.description.toLowerCase().includes(keyword))
        )
      }
      
      return filtered
    },
    totalPrice() {
      return this.selectedDishes.reduce((total, dish) => {
        return total + (parseFloat(dish.price) || 0)
      }, 0).toFixed(2)
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeSelector()
        this.loadDishes()
      }
    },
    selectedDishIds: {
      handler(newIds) {
        this.initializeSelector()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 初始化选择器
    initializeSelector() {
      if (!this.selectedDishIds || !Array.isArray(this.selectedDishIds)) {
        this.selectedDishes = []
        return
      }
      
      // 根据ID找到对应的菜品对象
      this.selectedDishes = this.selectedDishIds
        .map(id => this.dishes.find(dish => (dish._id || dish.id) === id))
        .filter(dish => dish) // 过滤掉未找到的菜品
    },

    // 加载菜品列表
    async loadDishes() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await api.admin.getDishesList({
          pageSize: 10,
          status: 'active'
        })
        
        if (response.success && response.data && response.data.list) {
          // 确保数据格式正确，直接使用API返回的数据
          this.dishes = response.data.list
          
          // 重新初始化选择状态
          this.initializeSelector()
          
          console.log('菜品加载成功，总数:', this.dishes.length)
        } else {
          this.error = response.message || '加载菜品失败'
        }
      } catch (error) {
        console.error('加载菜品出错:', error)
        
        // 处理特定错误类型
        if (error.message) {
          if (error.message.includes('权限') || error.message.includes('权限不足')) {
            this.error = '权限不足，需要管理员权限'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            this.error = '网络连接失败，请检查网络设置'
          } else {
            this.error = error.message
          }
        } else {
          this.error = '加载菜品失败，请重试'
        }
      } finally {
        this.loading = false
      }
    },

    // 选择餐次
    selectMealType(mealType) {
      this.selectedMealType = mealType
    },

    // 搜索菜品
    onSearch() {
      // 实时搜索，不需要额外处理
    },

    // 切换菜品选择状态
    toggleDish(dish) {
      const dishId = dish._id || dish.id
      const index = this.selectedDishes.findIndex(d => (d._id || d.id) === dishId)
      
      if (index > -1) {
        // 取消选择
        this.selectedDishes.splice(index, 1)
      } else {
        // 添加选择
        this.selectedDishes.push(dish)
      }
      
      console.log('选择状态更新:', this.selectedDishes.length, '道菜品')
    },

    // 检查菜品是否被选中
    isSelected(dishId) {
      return this.selectedDishes.some(dish => (dish._id || dish.id) === dishId)
    },

    // 确认选择
    confirmSelection() {
      if (this.selectedDishes.length === 0) {
        uni.showToast({
          title: '请至少选择一道菜品',
          icon: 'none'
        })
        return
      }
      
      // 发送选中的菜品数据
      this.$emit('confirm', this.selectedDishes)
      this.handleClose()
    },

    // 关闭模态框
    handleClose() {
      this.$emit('close')
    },

    // 处理图片加载错误
    handleImage错误() {
      // 图片加载失败时使用默认图片
    },

    // 格式化价格
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },

    // 获取餐次中文名称
    getMealTypeText(mealType) {
      const mealTypeMap = {
        'breakfast': '早餐',
        'lunch': '午餐', 
        'dinner': '晚餐'
      }
      return mealTypeMap[mealType] || mealType
    }
  }
}
</script>

<style scoped>
.dish-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #666;
}

.search-bar {
  position: relative;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.search-icon {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
}


.meal-type-filter {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.meal-type-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meal-type-item {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  background-color: #fff;
}

.meal-type-item:hover {
  border-color: #667eea;
  color: #667eea;
}

.meal-type-item.active {
  background-color: #667eea;
  border-color: #667eea;
  color: #fff;
}

.dishes-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-text,
.error-text,
.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dish-item:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.dish-item.selected {
  border-color: #667eea;
  background-color: #f0f2ff;
}

.dish-checkbox {
  margin-right: 12px;
}

.dish-image {
  width: 60px;
  height: 60px;
  margin-right: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.dish-img {
  width: 100%;
  height: 100%;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dish-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.dish-category {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.meal-types {
  display: flex;
  gap: 6px;
  margin: 4px 0;
  flex-wrap: wrap;
}

.meal-type-tag {
  font-size: 10px;
  color: #fff;
  background-color: #667eea;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

.dish-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b35;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b35;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-confirm {
  background-color: #667eea;
  color: #fff;
}

.btn-confirm:hover {
  background-color: #5a6fd8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header,
  .search-bar,
  .category-filter,
  .dishes-container,
  .modal-footer {
    padding: 16px;
  }
  
  .dish-item {
    padding: 12px;
  }
  
  .dish-image {
    width: 50px;
    height: 50px;
  }
}
</style>
