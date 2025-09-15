<template>
  <view class="date-picker">
    <input 
      class="form-input-text"
      v-model="inputValue" 
      :placeholder="placeholder"
      @input="validateDate"
      @blur="formatDate"
    />
    <text class="date-hint">格式：YYYY-MM-DD</text>
  </view>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入日期，格式：2025-01-27'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      inputValue: this.modelValue || ''
    }
  },
  watch: {
    modelValue(newVal) {
      this.inputValue = newVal || ''
    }
  },
  methods: {
    /**
     * 验证日期格式
     */
    validateDate(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和连字符
      const cleaned = value.replace(/[^\d-]/g, '')
      if (cleaned !== value) {
        this.inputValue = cleaned
      }
    },

    /**
     * 格式化日期
     */
    formatDate() {
      const date = this.inputValue
      if (date && date.length === 8 && !date.includes('-')) {
        // 如果是8位数字，格式化为YYYY-MM-DD
        this.inputValue = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      }
      
      // 验证日期格式
      if (this.inputValue && !this.isValidDate(this.inputValue)) {
        uni.showToast({
          title: '请输入正确的日期格式',
          icon: 'none'
        })
        return
      }
      
      // 发送更新事件
      this.$emit('update:modelValue', this.inputValue)
    },

    /**
     * 验证日期格式是否正确
     */
    isValidDate(dateStr) {
      if (!dateStr) return true
      
      // 检查格式是否为YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateStr)) {
        return false
      }
      
      // 检查日期是否有效
      const date = new Date(dateStr)
      return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateStr
    }
  }
}
</script>

<style lang="scss" scoped>
.date-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 手写输入框样式 */
.form-input-text {
  width: 100%;
  padding: 24rpx 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: white;
  text-align: left;
  min-height: 80rpx;
  height: 80rpx;
  line-height: 1.4;
  transition: all 0.3s ease;
  position: relative;
  z-index: 30001;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.form-input-text:focus {
  border-color: #007aff;
  background: #f8f9ff;
  outline: none;
}

.form-input-text::placeholder {
  color: #999;
  font-size: 26rpx;
}

.date-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
  display: block;
  text-align: left;
  line-height: 1.3;
}
</style>
