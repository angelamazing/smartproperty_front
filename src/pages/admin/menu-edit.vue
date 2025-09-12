<template>
  <view class="menu-edit-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">{{ is编辑 ? '编辑菜单' : '创建菜单' }}</view>
      <view class="header-subtitle">{{ is编辑 ? '修改菜单信息' : '设置菜单日期、餐次和菜品' }}</view>
    </view>

    <!-- 菜单表单 -->
    <view class="menu-form">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">日期</text>
            <picker 
              class="form-picker" 
              mode="date" 
              :value="menuForm.date" 
              @change="onDateChange"
            >
              <view class="picker-text">
                {{ formatDate(menuForm.date) }}
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">餐次</text>
            <picker 
              class="form-picker" 
              :value="menuForm.mealTypeIndex" 
              :range="mealOptions" 
              range-key="name"
              @change="onMealChange"
            >
              <view class="picker-text">
                {{ mealOptions[menuForm.mealTypeIndex].name }}
              </view>
            </picker>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea 
            class="form-textarea" 
            v-model="menuForm.description" 
            placeholder="请输入菜单描述（可选）"
            maxlength="200"
          />
          <text class="form-hint">{{ menuForm.description.length }}/200</text>
        </view>
      </view>

      <!-- 菜品选择 -->
      <view class="form-section">
        <view class="section-header">
          <view class="section-title">菜品选择</view>
          <button class="add-dish-btn" @click="showDishSelector">
            <text class="btn-icon">+</text>
            <text>添加菜品</text>
          </button>
        </view>
        
        <view v-if="menuForm.dishes.length === 0" class="no-dishes">
          <text class="no-dishes-icon">🍽️</text>
          <text class="no-dishes-text">暂未选择菜品</text>
          <text class="no-dishes-hint">点击"添加菜品"开始选择</text>
        </view>
        
        <view v-else class="dishes-list">
          <view 
            v-for="(dish, index) in menuForm.dishes" 
            :key="dish.dishId"
            class="dish-item"
          >
            <view class="dish-image">
              <image 
                :src="dish.image || '/static/logo.png'" 
                mode="aspectFill"
                class="dish-img"
              />
            </view>
            
            <view class="dish-info">
              <text class="dish-name">{{ dish.dishName }}</text>
              <text class="dish-category">{{ dish.categoryName }}</text>
              <text class="dish-price">¥{{ formatPrice(dish.price) }}</text>
            </view>
            
            <view class="dish-actions">
              <button class="action-btn" @click="removeDish(index)">
                <text>删除</text>
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="form-actions">
        <button class="btn btn-secondary" @click="saveAsDraft">
          保存草稿
        </button>
        <button class="btn btn-primary" @click="publishMenu">
          发布菜单
        </button>
      </view>
    </view>

    <!-- 菜品选择器 -->
    <DishSelector 
      :visible="showDishModal"
      :selectedDishIds="getSelectedDishIds()"
      @confirm="onDishesSelected"
      @close="closeDishSelector"
    />
  </view>
</template>

<script>
import api from '@/utils/api'
import DishSelector from '@/components/DishSelector.vue'

export default {
  name: 'Menu编辑',
  components: {
    DishSelector
  },
  data() {
    return {
      is编辑: false,
      menuId: '',
      showDishModal: false,
      menuForm: {
        date: (() => {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, '0')
          const day = String(today.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })(),
        mealTypeIndex: 0,
        description: '',
        dishes: []
      },
      mealOptions: [
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ]
    }
  },
  onLoad(options) {
    if (options.menuId) {
      this.is编辑 = true
      this.menuId = options.menuId
      this.loadMenuData()
    }
  },
  methods: {
    // 格式化日期为选择器格式
    formatDateForPicker(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 格式化日期显示
    formatDate(dateStr) {
      if (!dateStr) return '请选择日期'
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      const weekday = weekdays[date.getDay()]
      return `${month}月${day}日 周${weekday}`
    },

    // 格式化价格
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },

    // 日期选择
    onDateChange(e) {
      this.menuForm.date = e.detail.value
    },

    // 餐次选择
    onMealChange(e) {
      this.menuForm.mealTypeIndex = parseInt(e.detail.value)
    },

    // 显示菜品选择器
    showDishSelector() {
      this.showDishModal = true
    },

    // 关闭菜品选择器
    closeDishSelector() {
      this.showDishModal = false
    },

    // 获取已选菜品ID列表
    getSelectedDishIds() {
      return this.menuForm.dishes.map(dish => dish.dishId)
    },

    // 菜品选择完成
    onDishesSelected(dishes) {
      console.log('菜品选择完成:', dishes)
      
      if (!Array.isArray(dishes)) {
        uni.showToast({
          title: '菜品数据格式错误',
          icon: 'error'
        })
        return
      }

      // 添加新选择的菜品
      const existingDishIds = this.menuForm.dishes.map(d => d.dishId)
      const newDishes = dishes.filter(dish => !existingDishIds.includes(dish._id || dish.id))
      
      this.menuForm.dishes = [
        ...this.menuForm.dishes,
        ...newDishes.map(dish => ({
          dishId: dish._id || dish.id,
          dishName: dish.name,
          categoryName: dish.categoryName || '未分类',
          image: dish.image || '/static/logo.png',
          price: dish.price || 0,
          sort: this.menuForm.dishes.length + 1
        }))
      ]
      
      console.log('更新后的菜单菜品:', this.menuForm.dishes)
      this.closeDishSelector()
    },

    // 移除菜品
    removeDish(index) {
      this.menuForm.dishes.splice(index, 1)
      // 重新排序
      this.menuForm.dishes.forEach((dish, idx) => {
        dish.sort = idx + 1
      })
    },

    // 加载菜单数据（编辑模式）
    async loadMenuData() {
      try {
        const response = await api.admin.getMenuDetail(this.menuId)
        if (response.success && response.data) {
          const menu = response.data
          this.menuForm.date = menu.date
          this.menuForm.mealTypeIndex = this.mealOptions.findIndex(
            option => option.value === menu.mealType
          )
          this.menuForm.description = menu.description || ''
          this.menuForm.dishes = menu.dishes || []
        }
      } catch (error) {
        console.error('加载菜单数据失败:', error)
        uni.showToast({
          title: '加载菜单数据失败',
          icon: 'error'
        })
      }
    },

    // 保存草稿
    async saveAsDraft() {
      if (!this.validateForm()) return
      
      try {
        const menuData = this.buildMenuData('draft')
        const response = await api.admin.saveMenuDraft(menuData)
        
        if (response.success) {
          uni.showToast({
            title: '草稿保存成功',
            icon: 'success'
          })
          this.navigateBack()
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('保存草稿失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      }
    },

    // 发布菜单
    async publishMenu() {
      if (!this.validateForm()) return
      
      try {
        const menuData = this.buildMenuData('published')
        const response = await api.admin.publishMenu(menuData)
        
        if (response.success) {
          uni.showToast({
            title: '菜单发布成功',
            icon: 'success'
          })
          this.navigateBack()
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('发布菜单失败:', error)
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'error'
        })
      }
    },

    // 验证表单
    validateForm() {
      if (!this.menuForm.date) {
        uni.showToast({
          title: '请选择菜单日期',
          icon: 'none'
        })
        return false
      }
      
      if (this.menuForm.dishes.length === 0) {
        uni.showToast({
          title: '请至少选择一道菜品',
          icon: 'none'
        })
        return false
      }
      
      return true
    },

    // 构建菜单数据
    buildMenuData(status) {
      return {
        date: this.menuForm.date,
        mealType: this.mealOptions[this.menuForm.mealTypeIndex].value,
        description: this.menuForm.description,
        dishes: this.menuForm.dishes,
        status: status
      }
    },

    // 返回上一页
    navigateBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.menu-edit-container {
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
  font-weight: 600;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.menu-form {
  padding: 20px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-picker {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.picker-text {
  color: #333;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  background-color: #f8f9fa;
  resize: none;
}

.form-hint {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.add-dish-btn {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 16px;
}

.no-dishes {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-dishes-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.no-dishes-text {
  font-size: 16px;
  margin-bottom: 8px;
  display: block;
}

.no-dishes-hint {
  font-size: 14px;
  color: #bbb;
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
  background-color: #f8f9fa;
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
  background-color: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.dish-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b35;
}

.dish-actions {
  margin-left: 16px;
}

.action-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5a6fd8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
