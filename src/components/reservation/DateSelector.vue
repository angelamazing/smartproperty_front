<template>
  <view class="date-selector">
    <text class="section-title">选择日期</text>
    <view class="date-selector-wrapper">
      <view class="date-navigation">
        <button class="nav-btn" @click="handlePrevious" :disabled="isLoading">
          <text class="nav-icon">❮</text>
        </button>
        <picker
          mode="date"
          :value="selectedDate"
          :start="minDate"
          :end="maxDate"
          @change="handleDateChange"
          class="date-picker-container"
        >
          <view class="date-display">
            <text class="date-text">{{ displayDate }}</text>
            <text class="date-hint">点击选择日期</text>
          </view>
        </picker>
        <button class="nav-btn" @click="handleNext" :disabled="isLoading">
          <text class="nav-icon">❯</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

export default {
  name: 'DateSelector',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    minDate: {
      type: String,
      default: ''
    },
    maxDate: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const { formatDisplayDate, addDays, formatDateForPicker } = useDateFormatter()
    
    const selectedDate = ref(props.modelValue)
    
    const displayDate = computed(() => {
      return formatDisplayDate(selectedDate.value)
    })
    
    // 监听外部值变化
    watch(() => props.modelValue, (newValue) => {
      selectedDate.value = newValue
    })
    
    // 处理日期选择器变化
    const handleDateChange = (event) => {
      const newDate = event.detail.value
      selectedDate.value = newDate
      emit('update:modelValue', newDate)
      emit('change', newDate)
    }
    
    // 处理前一天
    const handlePrevious = () => {
      if (props.isLoading) return
      
      try {
        const currentDate = formatDateForPicker(selectedDate.value)
        const previousDay = addDays(currentDate, -1)
        const formattedDate = formatDateForPicker(previousDay)
        
        selectedDate.value = formattedDate
        emit('update:modelValue', formattedDate)
        emit('change', formattedDate)
      } catch (error) {
        console.error('切换到前一天失败:', error)
      }
    }
    
    // 处理下一天
    const handleNext = () => {
      if (props.isLoading) return
      
      try {
        const currentDate = formatDateForPicker(selectedDate.value)
        const nextDay = addDays(currentDate, 1)
        const formattedDate = formatDateForPicker(nextDay)
        
        selectedDate.value = formattedDate
        emit('update:modelValue', formattedDate)
        emit('change', formattedDate)
      } catch (error) {
        console.error('切换到下一天失败:', error)
      }
    }
    
    return {
      selectedDate,
      displayDate,
      handleDateChange,
      handlePrevious,
      handleNext
    }
  }
}
</script>

<style scoped>
.date-selector {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.date-selector-wrapper {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:not(:disabled):active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 24rpx;
  color: #666;
}

.date-picker-container {
  flex: 1;
}

.date-display {
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.date-display:active {
  background: #e9ecef;
  border-color: #007bff;
}

.date-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.date-hint {
  font-size: 24rpx;
  color: #666;
  display: block;
}
</style>
