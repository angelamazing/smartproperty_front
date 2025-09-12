<template>
  <view class="form-field">
    <view class="field-header">
      <text class="field-label" :class="{ required }">{{ label }}</text>
      <slot name="extra" />
    </view>
    
    <view class="field-input">
      <slot name="input">
        <input 
          class="form-input" 
          :value="modelValue"
          :placeholder="placeholder"
          :type="type"
          :maxlength="maxlength"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
        />
      </slot>
    </view>
    
    <view v-if="$slots.hint" class="field-hint">
      <slot name="hint" />
    </view>
    
    <view v-if="error" class="field-error">
      <text class="error-text">{{ error }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FormField',
  props: {
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    maxlength: {
      type: [String, Number],
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'blur', 'focus'],
  methods: {
    handleInput(e) {
      const value = e.target?.value || e.detail?.value || ''
      this.$emit('update:modelValue', value)
    },
    
    handleBlur(e) {
      this.$emit('blur', e)
    },
    
    handleFocus(e) {
      this.$emit('focus', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
  
  &.required::after {
    content: ' *';
    color: #ef4444;
    font-weight: 700;
  }
}

.field-input {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #ffffff;
  min-height: 80rpx;
  height: 80rpx;
  line-height: 1.4;
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: #f8f9ff;
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.15);
    transform: translateY(-1rpx);
  }
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-size: 26rpx;
    font-weight: 400;
  }
}

.field-hint {
  margin-top: 8rpx;
}

.field-error {
  margin-top: 8rpx;
}

.error-text {
  font-size: 24rpx;
  color: #ff4757;
}
</style>
