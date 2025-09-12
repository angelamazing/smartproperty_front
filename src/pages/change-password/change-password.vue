<template>
  <view class="change-password-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">修改密码</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <view class="form-section">
        <text class="section-title">密码修改</text>
        
        <view class="form-item">
          <view class="input-container">
            <text class="input-label">当前密码</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'current', 'error': password错误s.current }">
                <input 
                  class="input-text"
                  :value="formData.currentPassword"
                  @input="handleCurrentPasswordInput"
                  placeholder="请输入当前密码"
                  :type="passwordVisibility.current ? 'text' : 'password'"
                  maxlength="20"
                  @focus="onPasswordFocus('current')"
                  @blur="onPasswordBlur('current')"
                />
                <button 
                  class="visibility-toggle"
                  @click="togglePasswordVisibility('current')"
                  type="button"
                >
                  <text class="toggle-icon">{{ passwordVisibility.current ? '👁️' : '🙈' }}</text>
                </button>
              </view>
              <view class="input-footer">
                <text v-if="password错误s.current" class="error-message">{{ password错误s.current }}</text>
                <text class="char-counter">{{ formData.currentPassword.length }}/20</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">新密码</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'new', 'error': password错误s.new }">
                <input 
                  class="input-text"
                  :value="formData.newPassword"
                  @input="handleNewPasswordInput"
                  placeholder="请输入新密码"
                  :type="passwordVisibility.new ? 'text' : 'password'"
                  maxlength="20"
                  @focus="onPasswordFocus('new')"
                  @blur="onPasswordBlur('new')"
                />
                <button 
                  class="visibility-toggle"
                  @click="togglePasswordVisibility('new')"
                  type="button"
                >
                  <text class="toggle-icon">{{ passwordVisibility.new ? '👁️' : '🙈' }}</text>
                </button>
              </view>
              <view class="input-footer">
                <text v-if="password错误s.new" class="error-message">{{ password错误s.new }}</text>
                <text class="char-counter">{{ formData.newPassword.length }}/20</text>
              </view>
              <view v-if="formData.newPassword" class="password-strength">
                <text class="strength-label">密码强度：</text>
                <view class="strength-bar">
                  <view 
                    class="strength-segment"
                    :class="getPasswordStrengthClass(0)"
                  ></view>
                  <view 
                    class="strength-segment"
                    :class="getPasswordStrengthClass(1)"
                  ></view>
                  <view 
                    class="strength-segment"
                    :class="getPasswordStrengthClass(2)"
                  ></view>
                  <view 
                    class="strength-segment"
                    :class="getPasswordStrengthClass(3)"
                  ></view>
                </view>
                <text class="strength-text">{{ getPasswordStrengthText() }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">确认密码</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'confirm', 'error': password错误s.confirm }">
                <input 
                  class="input-text"
                  :value="formData.confirmPassword"
                  @input="handle确认PasswordInput"
                  placeholder="请再次输入新密码"
                  :type="passwordVisibility.confirm ? 'text' : 'password'"
                  maxlength="20"
                  @focus="onPasswordFocus('confirm')"
                  @blur="onPasswordBlur('confirm')"
                />
                <button 
                  class="visibility-toggle"
                  @click="togglePasswordVisibility('confirm')"
                  type="button"
                >
                  <text class="toggle-icon">{{ passwordVisibility.confirm ? '👁️' : '🙈' }}</text>
                </button>
              </view>
              <view class="input-footer">
                <text v-if="password错误s.confirm" class="error-message">{{ password错误s.confirm }}</text>
                <text v-if="formData.confirmPassword && formData.newPassword === formData.confirmPassword" class="success-message">✓ 密码匹配</text>
                <text class="char-counter">{{ formData.confirmPassword.length }}/20</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 密码要求提示 -->
      <view class="password-tips">
        <text class="tips-title">密码要求：</text>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">密码长度至少6位</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">建议包含字母、数字和特殊字符</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">不要使用过于简单的密码</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="submit-btn" @click="submitForm" :disabled="submitting">
          {{ submitting ? '提交中...' : '确认修改' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'ChangePassword',
  data() {
    return {
      submitting: false,
      focusedField: null,
      formData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordVisibility: {
        current: false,
        new: false,
        confirm: false
      },
      password错误s: {
        current: '',
        new: '',
        confirm: ''
      },
      passwordStrength: 0
    }
  },
  methods: {
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
        // 按照接口文档格式发送请求
        const response = await api.user.changePassword({
          oldPassword: this.formData.currentPassword,
          newPassword: this.formData.newPassword
        })
        
        if (response.success) {
          this.show成功('密码修改成功')
          // 清空表单
          this.resetForm()
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          this.show错误(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        // 处理具体的错误信息
        const errorMessage = error.message || '密码修改失败，请重试'
        this.show错误(errorMessage)
      } finally {
        this.submitting = false
      }
    },

    /**
     * 验证表单
     */
    validateForm() {
      // 验证当前密码
      if (!this.validateCurrentPassword()) {
        return false
      }

      // 验证新密码
      if (!this.validateNewPassword()) {
        return false
      }

      // 验证确认密码
      if (!this.validate确认Password()) {
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
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.password错误s = {
        current: '',
        new: '',
        confirm: ''
      }
      this.passwordVisibility = {
        current: false,
        new: false,
        confirm: false
      }
      this.passwordStrength = 0
    },

    /**
     * 切换密码可见性
     */
    togglePasswordVisibility(type) {
      this.passwordVisibility[type] = !this.passwordVisibility[type]
    },

    /**
     * 当前密码输入处理
     */
    handleCurrentPasswordInput(e) {
      this.formData.currentPassword = e.detail.value
      this.password错误s.current = ''
      console.log('当前密码输入:', e.detail.value)
    },

    /**
     * 新密码输入处理
     */
    handleNewPasswordInput(e) {
      this.formData.newPassword = e.detail.value
      this.password错误s.new = ''
      this.passwordStrength = this.calculatePasswordStrength(this.formData.newPassword)
      
      // 如果确认密码已输入，重新验证
      if (this.formData.confirmPassword) {
        this.validate确认Password()
      }
      console.log('新密码输入:', e.detail.value)
    },

    /**
     * 确认密码输入处理
     */
    handle确认PasswordInput(e) {
      this.formData.confirmPassword = e.detail.value
      this.password错误s.confirm = ''
      this.validate确认Password()
      console.log('确认密码输入:', e.detail.value)
    },

    /**
     * 当前密码输入处理（保持向后兼容）
     */
    onCurrentPasswordInput() {
      this.password错误s.current = ''
    },

    /**
     * 新密码输入处理（保持向后兼容）
     */
    onNewPasswordInput() {
      this.password错误s.new = ''
      this.passwordStrength = this.calculatePasswordStrength(this.formData.newPassword)
      
      // 如果确认密码已输入，重新验证
      if (this.formData.confirmPassword) {
        this.validate确认Password()
      }
    },

    /**
     * 确认密码输入处理（保持向后兼容）
     */
    on确认PasswordInput() {
      this.password错误s.confirm = ''
      this.validate确认Password()
    },

    /**
     * 密码输入框获得焦点
     */
    onPasswordFocus(type) {
      this.focusedField = type
    },

    /**
     * 密码输入框失去焦点
     */
    onPasswordBlur(type) {
      this.focusedField = null
      // 失去焦点时进行验证
      if (type === 'current' && this.formData.currentPassword) {
        this.validateCurrentPassword()
      } else if (type === 'new' && this.formData.newPassword) {
        this.validateNewPassword()
      } else if (type === 'confirm' && this.formData.confirmPassword) {
        this.validate确认Password()
      }
    },

    /**
     * 验证当前密码
     */
    validateCurrentPassword() {
      if (!this.formData.currentPassword.trim()) {
        this.password错误s.current = '请输入当前密码'
        return false
      }
      return true
    },

    /**
     * 验证新密码
     */
    validateNewPassword() {
      if (!this.formData.newPassword.trim()) {
        this.password错误s.new = '请输入新密码'
        return false
      }
      
      if (this.formData.newPassword.length < 6) {
        this.password错误s.new = '密码长度至少6位'
        return false
      }
      
      if (this.formData.newPassword.length > 20) {
        this.password错误s.new = '密码长度不能超过20位'
        return false
      }
      
      if (this.formData.currentPassword === this.formData.newPassword) {
        this.password错误s.new = '新密码不能与当前密码相同'
        return false
      }
      
      return true
    },

    /**
     * 验证确认密码
     */
    validate确认Password() {
      if (!this.formData.confirmPassword.trim()) {
        this.password错误s.confirm = '请确认新密码'
        return false
      }
      
      if (this.formData.newPassword !== this.formData.confirmPassword) {
        this.password错误s.confirm = '两次输入的密码不一致'
        return false
      }
      
      return true
    },

    /**
     * 计算密码强度
     */
    calculatePasswordStrength(password) {
      if (!password) return 0
      
      let strength = 0
      
      // 长度检查
      if (password.length >= 6) strength++
      if (password.length >= 10) strength++
      
      // 字符类型检查
      if (/[a-z]/.test(password)) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^a-zA-Z0-9]/.test(password)) strength++
      
      // 返回0-4的强度值
      return Math.min(strength, 4)
    },

    /**
     * 获取密码强度样式类
     */
    getPasswordStrengthClass(index) {
      const strength = this.passwordStrength
      if (index < strength) {
        if (strength <= 1) return 'weak'
        if (strength <= 2) return 'fair'
        if (strength <= 3) return 'good'
        return 'strong'
      }
      return 'empty'
    },

    /**
     * 获取密码强度文本
     */
    getPasswordStrengthText() {
      const strength = this.passwordStrength
      if (strength === 0) return '请输入 password'
      if (strength === 1) return '弱'
      if (strength === 2) return '一般'
      if (strength === 3) return '良好'
      return '强'
    }
  }
}
</script>

<style lang="scss" scoped>
.change-password-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Page Header */
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

/* Form Container */
.form-container {
  padding: 24rpx;
}

.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  /* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05); */ /* 否t supported in WeChat Mini Program */
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-item {
  margin-bottom: 32rpx;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.input-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6rpx;
}

.input-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  /* box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1); */ /* 否t supported in WeChat Mini Program */
  min-height: 88rpx;
}

.input-field.focused {
  border-color: #667eea;
  /* box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1); */ /* 否t supported in WeChat Mini Program */
  transform: translateY(-1rpx);
}

.input-field.error {
  border-color: #e53e3e;
  /* box-shadow: 0 0 0 6rpx rgba(229, 62, 62, 0.1); */ /* 否t supported in WeChat Mini Program */
}

.input-text {
  flex: 1;
  width: 100%;
  padding: 20rpx 16rpx;
  border: none;
  outline: none;
  font-size: 26rpx;
  color: #2d3748;
  background: transparent;
  line-height: 1.4;
}

.input-text::placeholder {
  color: #a0aec0;
  font-size: 24rpx;
}

.visibility-toggle {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 2;
}

/* Remove unsupported :hover and :active pseudo-classes for WeChat Mini Program */

.toggle-icon {
  font-size: 26rpx;
  color: #718096;
  transition: color 0.2s ease;
}

/* Remove unsupported :hover pseudo-class for WeChat Mini Program */

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
  min-height: 28rpx;
}

.error-message {
  color: #e53e3e;
  font-size: 22rpx;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
}

.success-message {
  color: #38a169;
  font-size: 22rpx;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
}

.char-counter {
  color: #718096;
  font-size: 20rpx;
  font-weight: 500;
  text-align: right;
  min-width: 70rpx;
  background: #f7fafc;
  padding: 3rpx 10rpx;
  border-radius: 10rpx;
  border: 1rpx solid #e2e8f0;
}

.password-strength {
  margin-top: 12rpx;
  padding: 12rpx;
  background: #f8fafc;
  border-radius: 10rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.strength-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #4a5568;
}

.strength-bar {
  display: flex;
  gap: 4rpx;
  height: 6rpx;
  background: #e2e8f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.strength-segment {
  flex: 1;
  height: 100%;
  border-radius: 4rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
}

.strength-segment.empty {
  background: #e2e8f0;
}

.strength-segment.weak {
  background: linear-gradient(90deg, #fc8181, #f56565);
}

.strength-segment.fair {
  background: linear-gradient(90deg, #f6ad55, #ed8936);
}

.strength-segment.good {
  background: linear-gradient(90deg, #63b3ed, #4299e1);
}

.strength-segment.strong {
  background: linear-gradient(90deg, #68d391, #48bb78);
}

.strength-text {
  font-size: 20rpx;
  font-weight: 600;
  text-align: center;
  padding: 3rpx 10rpx;
  border-radius: 6rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  min-width: 70rpx;
}

/* Remove incompatible :contains() pseudo-class selector */

/* Password Tips */
.password-tips {
  background: #f0f8ff;
  border: 2rpx solid #bee3f8;
  border-radius: 10rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
}

.tips-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #3182ce;
  margin-bottom: 12rpx;
  display: block;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 6rpx;
}

.tip-dot {
  font-size: 22rpx;
  color: #3182ce;
}

.tip-text {
  font-size: 22rpx;
  color: #4a5568;
  line-height: 1.4;
}

/* Action Buttons */
.action-buttons {
  margin-top: 32rpx;
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
  /* box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3); */ /* 否t supported in WeChat Mini Program */
  transition: all 0.3s ease;
}

/* Remove unsupported :hover pseudo-class for WeChat Mini Program, keep :disabled */
.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  /* box-shadow: none; */ /* 否t supported in WeChat Mini Program */
}
</style>
