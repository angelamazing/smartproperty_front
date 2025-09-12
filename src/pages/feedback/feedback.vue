<template>
  <view class="feedback-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">意见反馈</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <view class="form-section">
        <text class="section-title">反馈信息</text>
        
        <view class="form-item">
          <text class="item-label">反馈类型</text>
          <view class="type-selector">
            <view 
              v-for="type in feedbackTypes" 
              :key="type.value"
              class="type-option"
              :class="{ active: formData.type === type.value }"
              @click="selectType(type.value)"
            >
              <text>{{ type.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">反馈标题</text>
          <input 
            class="item-input"
            v-model="formData.title"
            placeholder="请输入反馈标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">反馈内容</text>
          <textarea 
            class="item-textarea"
            v-model="formData.content"
            placeholder="请详细描述您的问题或建议..."
            maxlength="500"
            :show-confirm-bar="false"
          />
          <text class="char-count">{{ formData.content.length }}/500</text>
        </view>

        <view class="form-item">
          <text class="item-label">联系方式</text>
          <input 
            class="item-input"
            v-model="formData.contact"
            placeholder="请输入您的联系方式（选填）"
            maxlength="50"
          />
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="submit-btn" @click="submitForm" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交反馈' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Feedback',
  data() {
    return {
      submitting: false,
      formData: {
        type: 'bug',
        title: '',
        content: '',
        contact: ''
      },
      feedbackTypes: [
        { label: '功能建议', value: 'suggestion' },
        { label: '问题反馈', value: 'bug' },
        { label: '其他', value: 'other' }
      ]
    }
  },
  methods: {
    /**
     * 选择反馈类型
     */
    selectType(type) {
      this.formData.type = type
    },

    /**
     * 提交表单
     */
    async submitForm() {
      // 验证表单
      if (!this.validateForm()) {
        return
      }

      this.submitting = true
      try {
        const response = await api.user.submitFeedback(this.formData)
        if (response.success) {
          this.show成功('反馈提交成功')
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          this.show错误(response.message || '反馈提交失败')
        }
      } catch (error) {
        console.error('反馈提交失败:', error)
        this.show错误('反馈提交失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    /**
     * 验证表单
     */
    validateForm() {
      if (!this.formData.title.trim()) {
        this.show错误('请输入反馈标题')
        return false
      }

      if (!this.formData.content.trim()) {
        this.show错误('请输入反馈内容')
        return false
      }

      if (this.formData.content.length < 10) {
        this.show错误('反馈内容至少10个字符')
        return false
      }

      return true
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 显示成功提示
     */
    show成功(message) {
      uni.showToast({
        title: message,
        icon: 'success'
      })
    },

    /**
     * 显示错误提示
     */
    show错误(message) {
      uni.showToast({
        title: message,
        icon: 'error'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 30rpx;
  color: white;
  display: flex;
  align-items: center;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

/* 表单容器 */
.form-container {
  padding: 30rpx;
}

.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-item {
  margin-bottom: 30rpx;
}

.item-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

/* 类型选择器 */
.type-selector {
  display: flex;
  gap: 20rpx;
}

.type-option {
  padding: 16rpx 32rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-option.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* 输入框 */
.item-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #ffffff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.item-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

/* 文本域 */
.item-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #ffffff;
  transition: all 0.3s ease;
  box-sizing: border-box;
  resize: none;
}

.item-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
  display: block;
}

/* 操作按钮 */
.action-buttons {
  margin-top: 40rpx;
}

.submit-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
