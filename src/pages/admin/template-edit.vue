<template>
  <view class="template-edit-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">{{ is编辑 ? '编辑模板' : '新建模板' }}</view>
      <view class="header-subtitle">{{ is编辑 ? '修改现有菜单模板' : '创建新的菜单模板' }}</view>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <!-- 模板名称 -->
        <view class="form-item">
          <text class="form-label">模板名称</text>
          <input 
            class="form-input" 
            v-model="templateForm.name" 
            placeholder="请输入模板名称"
            maxlength="50"
          />
        </view>
        
        <!-- 模板描述 -->
        <view class="form-item">
          <text class="form-label">模板描述</text>
          <textarea 
            class="form-textarea" 
            v-model="templateForm.description" 
            placeholder="请输入模板描述（选填）"
            maxlength="200"
          />
          <text class="char-count">{{ templateForm.description.length }}/200</text>
        </view>
        
        <!-- 餐次类型 -->
        <view class="form-item">
          <text class="form-label">餐次类型</text>
          <view class="meal-type-selector">
            <view 
              class="meal-type-item" 
              :class="{ active: templateForm.mealType === 'breakfast' }"
              @click="selectMealType('breakfast')"
            >
              <text class="meal-icon">🌅</text>
              <text class="meal-label">早餐</text>
            </view>
            <view 
              class="meal-type-item" 
              :class="{ active: templateForm.mealType === 'lunch' }"
              @click="selectMealType('lunch')"
            >
              <text class="meal-icon">☀️</text>
              <text class="meal-label">午餐</text>
            </view>
            <view 
              class="meal-type-item" 
              :class="{ active: templateForm.mealType === 'dinner' }"
              @click="selectMealType('dinner')"
            >
              <text class="meal-icon">🌙</text>
              <text class="meal-label">晚餐</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 菜品选择 -->
      <view class="form-section">
        <view class="section-title">
          <text>选择菜品</text>
          <button class="add-dish-btn" @click="showDishSelector">+ 添加菜品</button>
        </view>
        
        <view v-if="!templateForm.dishList || templateForm.dishList.length === 0" class="empty-state">
          <text class="empty-text">暂未选择任何菜品</text>
          <text class="empty-hint">点击"添加菜品"开始选择</text>
        </view>
        
        <view v-else class="selected-dishes">
          <view 
            v-for="(dish, index) in templateForm.dishList" 
            :key="dish && dish.id ? dish.id : index"
            class="dish-item"
          >
            <image :src="(dish && dish.image) || '/static/logo.png'" class="dish-image" mode="aspectFill" />
            <view class="dish-info">
              <text class="dish-name">{{ dish && dish.name ? dish.name : '未知菜品' }}</text>
              <text class="dish-category">{{ dish && dish.category ? dish.category : '未分类' }}</text>
              <text class="dish-price">¥{{ dish && dish.price ? dish.price : '0.00' }}</text>
            </view>
            <button class="remove-dish-btn" @click="removeDish(index)">
              <text>✕</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn secondary" @click="goBack">
          取消
        </button>
        <button class="action-btn primary" @click="saveTemplate" :disabled="!can保存">
          {{ is编辑 ? '保存修改' : '创建模板' }}
        </button>
      </view>
    </view>

    <!-- 菜品选择弹窗 -->
    <DishSelector 
      :visible="showDishModal"
      :selectedDishIds="getSelectedDishIds()"
      @confirm="onDishesSelected"
      @close="handleCloseDishModal"
    />
  </view>
</template>

<script>
import DishSelector from '@/components/DishSelector.vue'
import api from '@/utils/api'

export default {
  name: 'Template编辑',
  components: {
    DishSelector
  },
  data() {
    return {
      is编辑: false,
      templateId: '',
      templateForm: {
        name: '',
        description: '',
        mealType: 'lunch',
        dishList: []
      },
      showDishModal: false,
      loading: false
    }
  },
  computed: {
    can保存() {
      try {
        return this.templateForm.name.trim() && 
               this.templateForm.mealType && 
               this.templateForm.dishList && 
               this.templateForm.dishList.length > 0
      } catch (error) {
        console.error('计算保存状态失败:', error)
        return false
      }
    }
  },
  onLoad(options) {
    try {
      if (options.action === 'edit' && options.id) {
        this.is编辑 = true
        this.templateId = options.id
        this.loadTemplateData()
      } else {
        this.is编辑 = false
      }
    } catch (error) {
      console.error('页面加载失败:', error)
      uni.showToast({
        title: '页面加载失败',
        icon: 'error'
      })
    }
  },
  methods: {
    /**
     * 加载模板数据
     */
    async loadTemplateData() {
      if (!this.templateId) return
      
      try {
        this.loading = true
        const response = await api.admin.getMenuTemplate(this.templateId)
        if (response && response.success) {
          const template = response.data
          this.templateForm = {
            name: template.name || '',
            description: template.description || '',
            mealType: template.mealType || 'lunch',
            dishList: template.dishList || []
          }
        } else {
          throw new Error(response?.message || '加载模板失败')
        }
      } catch (error) {
        console.error('加载模板数据失败:', error)
        uni.showToast({
          title: '加载模板失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 选择餐次类型
     */
    selectMealType(type) {
      if (!type || !['breakfast', 'lunch', 'dinner'].includes(type)) {
        console.error('餐次类型无效:', type)
        return
      }
      
      try {
        this.templateForm.mealType = type
      } catch (error) {
        console.error('设置餐次类型失败:', error)
      }
    },

    /**
     * 显示菜品选择器
     */
    showDishSelector() {
      try {
        console.log('显示菜品选择器')
        this.showDishModal = true
      } catch (error) {
        console.error('显示菜品选择器失败:', error)
      }
    },

    /**
     * 菜品选择确认
     */
    onDishesSelected(result) {
      if (!result) {
        console.error('菜品选择结果无效:', result)
        return
      }
      
      try {
        // result 包含 dishIds 和 dishes
        this.templateForm.dishList = result.dishes || []
        this.showDishModal = false
      } catch (error) {
        console.error('处理菜品选择失败:', error)
        uni.showToast({
          title: '处理菜品选择失败',
          icon: 'error'
        })
      }
    },

    /**
     * 处理关闭菜品选择器
     */
    handleCloseDishModal() {
      try {
        console.log('关闭菜品选择器')
        this.showDishModal = false
      } catch (error) {
        console.error('关闭菜品选择器失败:', error)
      }
    },

    /**
     * 移除菜品
     */
    removeDish(index) {
      try {
        if (index >= 0 && index < this.templateForm.dishList.length) {
          this.templateForm.dishList.splice(index, 1)
        } else {
          console.error('移除菜品索引无效:', index)
        }
      } catch (error) {
        console.error('移除菜品失败:', error)
      }
    },

    /**
     * 保存模板
     */
    async saveTemplate() {
      if (!this.can保存) {
        uni.showToast({
          title: '请完善模板信息',
          icon: 'error'
        })
        return
      }

      try {
        this.loading = true
        
        const templateData = {
          name: this.templateForm.name.trim(),
          description: this.templateForm.description.trim(),
          mealType: this.templateForm.mealType,
          dishList: this.templateForm.dishList
        }

        let response
        if (this.is编辑) {
          response = await api.admin.updateMenuTemplate(this.templateId, templateData)
        } else {
          response = await api.admin.createMenuTemplate(templateData)
        }

        if (response && response.success) {
          uni.showToast({
            title: this.is编辑 ? '模板修改成功' : '模板创建成功',
            icon: 'success'
          })
          
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          throw new Error(response?.message || '保存失败')
        }
      } catch (error) {
        console.error('保存模板失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 返回上一页
     */
    goBack() {
      try {
        uni.navigateBack()
      } catch (error) {
        console.error('返回失败:', error)
        // 如果返回失败，跳转到菜单管理页
        uni.switchTab({
          url: '/pages/admin/menu'
        })
      }
    },

    /**
     * 获取已选择的菜品ID列表
     */
    getSelectedDishIds() {
      try {
        if (!this.templateForm.dishList || !Array.isArray(this.templateForm.dishList)) {
          console.log('getSelectedDishIds: dishList 为空或不是数组')
          return []
        }
        
        const dishIds = this.templateForm.dishList
          .filter(dish => dish && dish.id)
          .map(dish => dish.id)
        
        console.log('getSelectedDishIds: 返回菜品ID列表:', dishIds)
        return dishIds
      } catch (error) {
        console.error('getSelectedDishIds 执行失败:', error)
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.template-edit-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 40rpx;
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

/* 表单内容 */
.form-content {
  padding: 30rpx;
}

/* 表单区域 */
.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表单项 */
.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  font-size: 28rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #999;
}

/* 餐次选择器 */
.meal-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
}

.meal-type-item {
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.meal-type-item.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.meal-icon {
  font-size: 36rpx;
  margin-bottom: 12rpx;
  display: block;
}

.meal-label {
  font-size: 26rpx;
  font-weight: 500;
}

/* 菜品相关 */
.add-dish-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
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

.selected-dishes {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.dish-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dish-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.dish-category {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.dish-price {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.remove-dish-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #e74c3c;
  color: white;
  border: none;
  font-size: 24rpx;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:disabled {
  background: #ccc;
  color: #999;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .meal-type-selector {
    grid-template-columns: 1fr;
    gap: 15rpx;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
