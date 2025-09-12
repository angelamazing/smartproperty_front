<template>
  <view class="gender-selector">
    <!-- H5环境下的自定义选择器 -->
    <view v-if="isH5" class="h5-picker">
      <view 
        v-for="(option, index) in options" 
        :key="index"
        class="h5-option"
        :class="{ 
          active: modelValue === index,
          'no-selection': modelValue === -1
        }"
        @click="selectGender(index)"
      >
        <text>{{ option }}</text>
        <text v-if="modelValue === index" class="check-icon">✓</text>
      </view>
      
      <!-- 取消选择按钮 -->
      <view 
        v-if="modelValue !== -1"
        class="clear-selection-btn"
        @click="clearSelection"
      >
        <text class="clear-icon">✕</text>
        <text>取消选择</text>
      </view>
    </view>
    
    <!-- 非H5环境使用原生picker -->
    <picker v-else :range="options" @change="onPickerChange">
      <view class="form-picker">
        <text>{{ modelValue >= 0 ? options[modelValue] : '请选择性别' }}</text>
        <text class="picker-arrow">▼</text>
      </view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'GenderSelector',
  props: {
    modelValue: {
      type: Number,
      default: -1
    },
    options: {
      type: Array,
      default: () => ['未知', '男', '女']
    },
    isH5: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    selectGender(index) {
      this.$emit('update:modelValue', index)
    },
    
    clearSelection() {
      this.$emit('update:modelValue', -1)
    },
    
    onPickerChange(e) {
      const index = parseInt(e.detail.value)
      this.$emit('update:modelValue', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.gender-selector {
  width: 100%;
}

.h5-picker {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.h5-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &:active {
    transform: translateY(1rpx);
  }
  
  &.active {
    border-color: #667eea;
    background: #667eea;
    color: white;
  }
  
  &.no-selection {
    color: #999;
    font-style: italic;
  }
}

.check-icon {
  font-size: 32rpx;
  color: inherit;
}

.clear-selection-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 8rpx;
  background: #f8f9fa;
  color: #666;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8rpx;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:active {
    transform: translateY(1rpx);
  }
}

.clear-icon {
  font-size: 24rpx;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
  }
  
  &:active {
    transform: translateY(1rpx);
  }
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.2s ease;
}

.form-picker:active .picker-arrow {
  transform: rotate(180deg);
}
</style>
