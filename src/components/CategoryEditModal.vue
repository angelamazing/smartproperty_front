<template>
  <view v-if="visible" class="category-edit-overlay" @click="handleOverlayClick">
    <view class="category-edit-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ category ? '编辑分类' : '添加分类' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-content">
        <form class="category-form">
          <!-- 分类名称 -->
          <view class="form-group">
            <text class="form-label">分类名称 *</text>
            <input 
              class="form-input" 
              v-model="categoryData.name" 
              placeholder="请输入分类名称"
              maxlength="20"
            />
          </view>
          
          <!-- 分类描述 -->
          <view class="form-group">
            <text class="form-label">分类描述</text>
            <textarea 
              class="form-textarea" 
              v-model="categoryData.description" 
              placeholder="请输入分类描述"
              maxlength="100"
            />
          </view>
          
          <!-- 分类图标 -->
          <view class="form-group">
            <text class="form-label">分类图标</text>
            <view class="icon-selector">
              <view class="current-icon" @click="showIconPicker = true">
                <text class="icon-display">{{ categoryData.icon || '🍽️' }}</text>
                <text class="icon-text">点击选择图标</text>
              </view>
            </view>
          </view>
          
          <!-- 分类颜色 */
          <view class="form-group">
            <text class="form-label">分类颜色</text>
            <view class="color-selector">
              <view 
                v-for="color in presetColors" 
                :key="color"
                class="color-item"
                :class="{ selected: categoryData.color === color }"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></view>
            </view>
            <input 
              class="color-input" 
              v-model="categoryData.color" 
              placeholder="#FF6B6B"
              maxlength="7"
            />
          </view>
          
          <!-- 排序权重 -->
          <view class="form-group">
            <text class="form-label">排序权重</text>
            <input 
              class="form-input" 
              v-model="categoryData.sort" 
              placeholder="数字越大排序越靠前"
              type="number"
            />
            <text class="form-hint">数字越大，分类显示位置越靠前</text>
          </view>
          
          <!-- 状态设置 -->
          <view class="form-group switch-group">
            <text class="form-label">启用状态</text>
            <switch :checked="categoryData.status === 'active'" @change="onStatusChange" />
          </view>
        </form>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="save-btn" @click="saveCategory" :disabled="!isFormValid">
          {{ category ? '保存' : '创建' }}
        </button>
      </view>
    </view>
  </view>

  <!-- 图标选择器 -->
  <view v-if="showIconPicker" class="icon-picker-overlay" @click="closeIconPicker">
    <view class="icon-picker-modal" @click.stop>
      <view class="picker-header">
        <text class="picker-title">选择图标</text>
        <button class="close-btn" @click="closeIconPicker">✕</button>
      </view>
      
      <view class="picker-content">
        <view class="icons-grid">
          <view 
            v-for="icon in iconList" 
            :key="icon"
            class="icon-option"
            :class="{ selected: categoryData.icon === icon }"
            @click="selectIcon(icon)"
          >
            <text class="icon">{{ icon }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Category编辑Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      categoryData: {
        name: '',
        description: '',
        icon: '🍽️',
        color: '#667eea',
        sort: 0,
        status: 'active'
      },
      showIconPicker: false,
      presetColors: [
        '#667eea', '#f093fb', '#43e97b', '#4facfe',
        '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
        '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
        '#ee5a52', '#0abde3', '#10ac84', '#ee5a6f',
        '#c44569', '#f8b500', '#778beb', '#e056fd'
      ],
      iconList: [
        '🍽️', '🍜', '🍝', '🍲', '🥘', '🍱', '🍙', '🍚',
        '🥗', '🥙', '🌮', '🌯', '🥪', '🍕', '🍔', '🍟',
        '🌭', '🥓', '🍖', '🍗', '🥩', '🍤', '🍳', '🥚',
        '🧀', '🥛', '☕', '🍵', '🥤', '🍺', '🍷', '🍸',
        '🍰', '🎂', '🧁', '🍮', '🍭', '🍬', '🍫', '🍿',
        '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝',
        '🥕', '🌽', '🥒', '🥬', '🥦', '🍅', '🍆', '🥔'
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.categoryData.name.trim().length > 0
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    initializeForm() {
      if (this.category) {
        // 编辑模式
        this.categoryData = {
          ...this.categoryData,
          ...this.category
        }
      } else {
        // 新建模式
        this.categoryData = {
          name: '',
          description: '',
          icon: '🍽️',
          color: '#667eea',
          sort: 0,
          status: 'active'
        }
      }
    },

    /**
     * 颜色选择
     */
    selectColor(color) {
      this.categoryData.color = color
    },

    /**
     * 图标选择
     */
    selectIcon(icon) {
      this.categoryData.icon = icon
      this.closeIconPicker()
    },

    closeIconPicker() {
      this.showIconPicker = false
    },

    /**
     * 状态切换
     */
    onStatusChange(e) {
      this.categoryData.status = e.detail.value ? 'active' : 'inactive'
    },

    /**
     * 保存分类
     */
    async saveCategory() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写分类名称',
          icon: 'error'
        })
        return
      }

      try {
        uni.showLoading({ title: '保存中...' })
        
        const categoryData = {
          ...this.categoryData,
          sort: parseInt(this.categoryData.sort) || 0
        }

        let response
        if (this.category) {
          // 更新分类
          response = await api.admin.updateDishCategory(this.category.id, categoryData)
        } else {
          // 创建分类
          response = await api.admin.createDishCategory(categoryData)
        }

        if (response.success) {
          uni.showToast({
            title: this.category ? '更新成功' : '创建成功',
            icon: 'success'
          })
          this.$emit('saved', response.data)
          this.close()
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存分类失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.showIconPicker = false
      this.$emit('close')
    },

    handleOverlayClick() {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.category-edit-overlay {
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
  padding: 40rpx;
}

.category-edit-modal {
  background: white;
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

/* 模态框头部 */
.modal-header {
  padding: 40rpx 40rpx 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  border: none;
  color: #666;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模态框内容 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx 40rpx;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.switch-group {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.switch-group .form-label {
  margin-bottom: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 100rpx;
  resize: vertical;
}

.form-hint {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

/* 图标选择器 */
.icon-selector {
  margin-top: 8rpx;
}

.current-icon {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.current-icon:active {
  background: #e9ecef;
}

.icon-display {
  font-size: 48rpx;
}

.icon-text {
  font-size: 26rpx;
  color: #666;
}

/* 颜色选择器 */
.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin: 16rpx 0;
}

.color-item {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  border: 4rpx solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-item.selected {
  border-color: #333;
  transform: scale(1.1);
}

.color-input {
  width: 200rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
}

/* 模态框底部 */
.modal-footer {
  padding: 30rpx 40rpx;
  border-top: 2rpx solid #f0f0f0;
  background: #fafafa;
  display: flex;
  gap: 20rpx;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
}

.save-btn {
  background: #667eea;
  color: white;
}

.save-btn:disabled {
  background: #ccc;
  color: #999;
}

/* 图标选择器弹窗 */
.icon-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 40rpx;
}

.icon-picker-modal {
  background: white;
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.picker-header {
  padding: 30rpx 40rpx;
  border-bottom: 2rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.picker-content {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx 40rpx;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 3rpx solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.icon-option:active {
  transform: scale(0.95);
}

.icon {
  font-size: 36rpx;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .category-edit-overlay,
  .icon-picker-overlay {
    padding: 20rpx;
  }
  
  .modal-header,
  .modal-footer,
  .picker-header {
    padding: 20rpx 30rpx;
  }
  
  .modal-content,
  .picker-content {
    padding: 20rpx 30rpx;
  }
  
  .icons-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 16rpx;
  }
  
  .icon-option {
    width: 60rpx;
    height: 60rpx;
  }
  
  .icon {
    font-size: 28rpx;
  }
}
</style>
