<template>
  <view class="menu-edit-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">{{ isEdit ? '编辑菜单' : '创建菜单' }}</view>
      <view class="header-subtitle">{{ isEdit ? '修改菜单信息' : '设置菜单日期、餐次和菜品' }}</view>
    </view>

    <!-- 菜单表单 -->
    <view class="menu-form">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <!-- 日期选择 -->
        <view class="form-item">
          <text class="form-label">发布日期 *</text>
          <picker 
            class="form-picker" 
            mode="date" 
            :value="menuForm.date" 
            :start="todayDate"
            @change="onDateChange"
          >
            <view class="picker-content">
              <text class="picker-text">{{ formatDateDisplay(menuForm.date) }}</text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
          <text v-if="errors.date" class="error-text">{{ errors.date }}</text>
        </view>
        
        <!-- 餐次选择 -->
        <view class="form-item">
          <text class="form-label">餐次类型 *</text>
          <picker 
            class="form-picker" 
            :value="menuForm.mealTypeIndex" 
            :range="mealOptions" 
            range-key="name"
            @change="onMealTypeChange"
          >
            <view class="picker-content">
              <text class="picker-text">{{ mealOptions[menuForm.mealTypeIndex].name }}</text>
              <text class="picker-icon">🍽️</text>
            </view>
          </picker>
          <text v-if="errors.mealType" class="error-text">{{ errors.mealType }}</text>
        </view>
        
        <!-- 描述输入 -->
        <view class="form-item">
          <text class="form-label">菜单描述</text>
          <textarea 
            class="form-textarea" 
            v-model="menuForm.description" 
            placeholder="请输入菜单描述（可选）"
            maxlength="200"
          />
          <view class="char-count">{{ menuForm.description.length }}/200</view>
        </view>
      </view>

      <!-- 菜品管理 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">菜品列表 *</text>
          <button class="add-dish-btn" @click="showDishSelector">
            <text class="btn-icon">+</text>
            <text>添加菜品</text>
          </button>
        </view>
        
        <text v-if="errors.dishes" class="error-text">{{ errors.dishes }}</text>
        
        <!-- 空状态 -->
        <view v-if="menuForm.dishes.length === 0" class="empty-dishes">
          <text class="empty-icon">🍽️</text>
          <text class="empty-text">暂无菜品</text>
          <text class="empty-hint">点击"添加菜品"选择菜品</text>
        </view>
        
        <!-- 菜品列表 -->
        <view v-else class="dishes-list">
          <view 
            v-for="(dish, index) in menuForm.dishes" 
            :key="dish.dishId" 
            class="dish-item"
          >
            <view class="dish-info">
              <text class="dish-name">{{ dish.dishName }}</text>
              <text class="dish-category">{{ dish.categoryName || '未分类' }}</text>
              <view class="dish-price-input">
                <text class="price-label">价格：¥</text>
                <input 
                  class="price-input" 
                  type="digit"
                  v-model="dish.price"
                  placeholder="0.00"
                  @input="validatePrice(dish, $event)"
                />
              </view>
            </view>
            <view class="dish-actions">
              <text class="sort-number">{{ index + 1 }}</text>
              <button class="remove-btn" @click="removeDish(index)">×</button>
            </view>
          </view>
        </view>
        
        <!-- 统计信息 -->
        <view v-if="menuForm.dishes.length > 0" class="dishes-summary">
          <view class="summary-item">
            <text class="summary-label">菜品总数：</text>
            <text class="summary-value">{{ menuForm.dishes.length }}道</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">预估总价：</text>
            <text class="summary-value">¥{{ totalPrice.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="form-actions">
        <button class="btn btn-secondary" @click="saveDraft" :disabled="saving">
          <text v-if="saving">保存中...</text>
          <text v-else>保存草稿</text>
        </button>
        <button class="btn btn-primary" @click="publishMenu" :disabled="publishing">
          <text v-if="publishing">发布中...</text>
          <text v-else>发布菜单</text>
        </button>
      </view>
    </view>

    <!-- 菜品选择器 -->
    <DishSelector 
      :visible="showDishModal"
      :selectedDishIds="selectedDishIds"
      @confirm="onDishesSelected"
      @close="closeDishSelector"
    />
  </view>
</template>

<script>
import api from '@/utils/api'
import DishSelector from '@/components/DishSelector.vue'

export default {
  name: 'MenuEdit',
  components: {
    DishSelector
  },
  data() {
    return {
      isEdit: false,
      menuId: '',
      saving: false,
      publishing: false,
      showDishModal: false,
      
      // 表单数据 - 严格按照接口文档格式
      menuForm: {
        date: '',           // YYYY-MM-DD 格式
        mealTypeIndex: 0,   // 餐次索引
        description: '',    // 菜单描述
        dishes: []          // 菜品列表
      },
      
      // 餐次选项 - 严格按照接口文档
      mealOptions: [
        { value: 'breakfast', name: '早餐' },
        { value: 'lunch', name: '午餐' },
        { value: 'dinner', name: '晚餐' }
      ],
      
      // 表单验证错误
      errors: {},
      
      // 今天日期
      todayDate: ''
    }
  },
  
  computed: {
    // 已选择的菜品ID列表
    selectedDishIds() {
      return this.menuForm.dishes.map(dish => dish.dishId)
    },
    
    // 总价计算
    totalPrice() {
      return this.menuForm.dishes.reduce((total, dish) => {
        const price = parseFloat(dish.price) || 0
        return total + price
      }, 0)
    }
  },
  
  onLoad(options) {
    console.log('MenuEdit onLoad:', options)
    
    // 初始化今天日期
    this.initTodayDate()
    
    // 设置默认日期
    if (!this.menuForm.date) {
      this.menuForm.date = this.todayDate
    }
    
    // 检查是否为编辑模式
    if (options.menuId) {
      this.isEdit = true
      this.menuId = options.menuId
      this.loadMenuData()
    } else if (options.action === 'duplicate') {
      this.loadDuplicateData()
    }
  },
  
  methods: {
    // 初始化今天日期
    initTodayDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      this.todayDate = `${year}-${month}-${day}`
    },
    
    // 格式化日期显示
    formatDateDisplay(dateStr) {
      if (!dateStr) return '请选择日期'
      
      console.log('菜单编辑页面 formatDateDisplay 输入:', dateStr, '类型:', typeof dateStr)
      
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
          return '请选择日期'
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
        return '请选择日期'
      }
    },
    
    // 日期选择事件
    onDateChange(e) {
      this.menuForm.date = e.detail.value
      this.clearError('date')
    },
    
    // 餐次选择事件
    onMealTypeChange(e) {
      this.menuForm.mealTypeIndex = parseInt(e.detail.value)
      this.clearError('mealType')
    },
    
    // 显示菜品选择器
    showDishSelector() {
      this.showDishModal = true
    },
    
    // 关闭菜品选择器
    closeDishSelector() {
      this.showDishModal = false
    },
    
    // 菜品选择完成
    onDishesSelected(selectedDishes) {
      console.log('选择的菜品:', selectedDishes)
      
      // 添加新选择的菜品
      const existingIds = new Set(this.menuForm.dishes.map(d => d.dishId))
      const newDishes = selectedDishes.filter(dish => !existingIds.has(dish._id || dish.id))
      
      newDishes.forEach((dish, index) => {
        this.menuForm.dishes.push({
          dishId: dish._id || dish.id,
          dishName: dish.name,
          categoryName: dish.categoryName || '未分类',
          price: dish.price || 0,
          sort: this.menuForm.dishes.length + index + 1
        })
      })
      
      this.clearError('dishes')
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
    
    // 验证价格输入
    validatePrice(dish, event) {
      const value = event.detail.value
      const price = parseFloat(value)
      
      if (isNaN(price) || price < 0) {
        dish.price = 0
      } else {
        dish.price = price
      }
    },
    
    // 表单验证
    validateForm() {
      this.errors = {}
      
      // 验证日期
      if (!this.menuForm.date) {
        this.errors.date = '请选择发布日期'
      } else if (this.menuForm.date < this.todayDate) {
        this.errors.date = '不能选择过去的日期'
      }
      
      // 验证餐次
      if (this.menuForm.mealTypeIndex < 0 || this.menuForm.mealTypeIndex >= this.mealOptions.length) {
        this.errors.mealType = '请选择有效的餐次类型'
      }
      
      // 验证菜品
      if (this.menuForm.dishes.length === 0) {
        this.errors.dishes = '请至少添加一道菜品'
      }
      
      // 验证每个菜品
      for (const dish of this.menuForm.dishes) {
        if (!dish.dishId) {
          this.errors.dishes = '菜品ID不能为空'
          break
        }
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    // 清除单个字段错误
    clearError(field) {
      if (this.errors[field]) {
        delete this.errors[field]
        this.$forceUpdate()
      }
    },
    
    // 构建菜单数据 - 严格按照接口文档格式
    buildMenuData() {
      return {
        date: this.menuForm.date,
        mealType: this.mealOptions[this.menuForm.mealTypeIndex].value,
        description: this.menuForm.description || '',
        dishes: this.menuForm.dishes.map(dish => ({
          dishId: dish.dishId,
          price: parseFloat(dish.price) || 0,
          sort: dish.sort || 1
        }))
      }
    },
    
    // 保存草稿
    async saveDraft() {
      if (!this.validateForm()) {
        uni.showToast({
          title: '请检查表单信息',
          icon: 'none'
        })
        return
      }
      
      this.saving = true
      
      try {
        const menuData = this.buildMenuData()
        console.log('保存草稿数据:', menuData)
        
        const response = await api.admin.saveMenuDraft(menuData)
        
        if (response.success) {
          uni.showToast({
            title: '草稿保存成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存草稿失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        this.saving = false
      }
    },
    
    // 发布菜单
    async publishMenu() {
      if (!this.validateForm()) {
        uni.showToast({
          title: '请检查表单信息',
          icon: 'none'
        })
        return
      }
      
      // 确认发布
      const result = await uni.showModal({
        title: '确认发布',
        content: '确定要发布这个菜单吗？发布后用户即可看到。',
        confirmText: '发布',
        confirmColor: '#007aff'
      })
      
      if (!result.confirm) return
      
      this.publishing = true
      
      try {
        const menuData = this.buildMenuData()
        console.log('发布菜单数据:', menuData)
        
        const response = await api.admin.publishMenu(menuData)
        
        if (response.success) {
          uni.showToast({
            title: '菜单发布成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          throw new Error(response.message || '发布失败')
        }
      } catch (error) {
        console.error('发布菜单失败:', error)
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'error'
        })
      } finally {
        this.publishing = false
      }
    },
    
    // 加载菜单数据（编辑模式）
    async loadMenuData() {
      try {
        console.log('加载菜单数据，ID:', this.menuId)
        
        // 使用菜单历史接口获取数据
        const response = await api.admin.getMenuHistory({
          page: 1,
          pageSize: 100
        })
        
        if (response && response.success && response.data && response.data.list) {
          const targetMenu = response.data.list.find(menu => menu._id === this.menuId)
          
          if (targetMenu) {
            console.log('找到目标菜单:', targetMenu)
            
            // 映射数据 - 使用接口文档字段
            this.menuForm.date = targetMenu.publishDate
            this.menuForm.mealTypeIndex = this.mealOptions.findIndex(
              option => option.value === targetMenu.mealType
            )
            this.menuForm.description = targetMenu.description || ''
            
            // 映射菜品数据
            if (targetMenu.dishes && Array.isArray(targetMenu.dishes)) {
              this.menuForm.dishes = targetMenu.dishes.map((dish, index) => ({
                dishId: dish.dishId,
                dishName: dish.dishName || dish.name,
                categoryName: dish.categoryName || '未分类',
                price: dish.price || 0,
                sort: index + 1
              }))
            }
            
            console.log('菜单数据加载完成:', this.menuForm)
          } else {
            throw new Error('未找到指定的菜单')
          }
        } else {
          throw new Error('获取菜单数据失败')
        }
      } catch (error) {
        console.error('加载菜单数据失败:', error)
        uni.showToast({
          title: '加载菜单数据失败',
          icon: 'error'
        })
      }
    },
    
    // 加载复制菜单数据
    loadDuplicateData() {
      try {
        const duplicateData = uni.getStorageSync('duplicateMenuData')
        if (duplicateData) {
          // 复制除了日期外的所有数据，日期设为今天
          this.menuForm.mealTypeIndex = this.mealOptions.findIndex(
            option => option.value === duplicateData.mealType
          )
          this.menuForm.description = duplicateData.description || ''
          this.menuForm.dishes = [...(duplicateData.dishes || [])]
          
          // 清除缓存
          uni.removeStorageSync('duplicateMenuData')
          
          console.log('复制菜单数据加载完成:', this.menuForm)
        }
      } catch (error) {
        console.error('加载复制菜单数据失败:', error)
      }
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
  font-weight: bold;
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
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-dish-btn {
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

.btn-icon {
  font-size: 16px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-picker {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.picker-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  min-height: 20px;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.picker-icon {
  font-size: 16px;
  opacity: 0.6;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  background-color: #fff;
  resize: none;
  box-sizing: border-box;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.empty-dishes {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  display: block;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  display: block;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.dish-item:hover {
  border-color: #667eea;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.dish-category {
  font-size: 12px;
  color: #999;
}

.dish-price-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-input {
  width: 80px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
  text-align: center;
}

.dish-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
}

.dishes-summary {
  background: #e3f2fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #1976d2;
}

.form-actions {
  display: flex;
  gap: 16px;
  padding: 0 20px;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .add-dish-btn {
    align-self: flex-end;
  }
  
  .dish-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .dish-actions {
    justify-content: flex-end;
  }
}
</style>