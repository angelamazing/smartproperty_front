<template>
  <view class="modal-overlay" @click="handleOverlayClick">
    <view class="modal-container" @click.stop>
      <view class="modal-header">
        <text class="modal-title">预约场地</text>
        <button class="close-btn" @click="handleCancel">
          <text class="close-icon">✕</text>
        </button>
      </view>
      
      <view class="modal-content">
        <!-- 场地信息 -->
        <view class="venue-info">
          <text class="venue-name">{{ venue?.name }}</text>
          <text class="venue-type">{{ getVenueTypeText(venue?.type) }}</text>
          <text class="venue-price">¥{{ venue?.price }}/小时</text>
        </view>
        
        <!-- 预约日期 -->
        <view class="form-group">
          <text class="form-label">预约日期</text>
          <text class="form-value">{{ formatDisplayDate(selectedDate) }}</text>
        </view>
        
        <!-- 时间段选择 -->
        <view class="form-group">
          <text class="form-label">预约时间段</text>
          <view class="time-slots">
            <view 
              v-for="slot in timeSlots"
              :key="slot.id"
              class="time-slot"
              :class="{ 
                selected: selectedTimeSlot?.id === slot.id,
                disabled: !slot.available
              }"
              @click="selectTimeSlot(slot)"
            >
              <text class="slot-time">{{ slot.startTime }}-{{ slot.endTime }}</text>
              <text class="slot-price" v-if="slot.price > 0">¥{{ slot.price }}</text>
            </view>
          </view>
        </view>
        
        <!-- 预约人信息 -->
        <view class="form-group">
          <text class="form-label">预约人姓名</text>
          <input 
            class="form-input"
            v-model="formData.userName"
            placeholder="请输入预约人姓名"
            maxlength="20"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">联系电话</text>
          <input 
            class="form-input"
            v-model="formData.phoneNumber"
            placeholder="请输入联系电话"
            type="number"
            maxlength="11"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">备注信息</text>
          <textarea 
            class="form-textarea"
            v-model="formData.notes"
            placeholder="请输入备注信息（可选）"
            maxlength="200"
          />
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="btn cancel" @click="handleCancel">
          <text class="btn-text">取消</text>
        </button>
        <button 
          class="btn confirm" 
          @click="handleConfirm"
          :disabled="!canSubmit"
        >
          <text class="btn-text">{{ submitText }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

export default {
  name: 'ReservationModal',
  props: {
    venue: {
      type: Object,
      default: null
    },
    selectedDate: {
      type: String,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const { formatDisplayDate } = useDateFormatter()
    
    // 表单数据
    const formData = ref({
      userName: '',
      phoneNumber: '',
      notes: ''
    })
    
    // 选中的时间段
    const selectedTimeSlot = ref(null)
    
    // 时间段列表
    const timeSlots = ref([])
    
    // 是否可以提交
    const canSubmit = computed(() => {
      return formData.value.userName.trim() && 
             formData.value.phoneNumber.trim() && 
             selectedTimeSlot.value &&
             !isLoading.value
    })
    
    // 提交按钮文本
    const submitText = computed(() => {
      return isLoading.value ? '提交中...' : '确认预约'
    })
    
    // 加载状态
    const isLoading = ref(false)
    
    // 获取场地类型文本
    const getVenueTypeText = (type) => {
      const typeMap = {
        'basketball': '篮球场',
        'football': '足球场',
        'tennis': '网球场',
        'badminton': '羽毛球场',
        'table_tennis': '乒乓球场',
        'volleyball': '排球场',
        'gym': '健身房',
        'swimming': '游泳池',
        'dance': '舞蹈室',
        'yoga': '瑜伽室',
        'other': '其他'
      }
      return typeMap[type] || '其他'
    }
    
    // 选择时间段
    const selectTimeSlot = (slot) => {
      if (!slot.available) return
      selectedTimeSlot.value = slot
    }
    
    // 处理确认
    const handleConfirm = async () => {
      if (!canSubmit.value) return
      
      isLoading.value = true
      try {
        const reservationData = {
          venueId: props.venue._id,
          venueName: props.venue.name,
          reservationDate: props.selectedDate,
          startTime: selectedTimeSlot.value.startTime,
          endTime: selectedTimeSlot.value.endTime,
          userName: formData.value.userName.trim(),
          phoneNumber: formData.value.phoneNumber.trim(),
          notes: formData.value.notes.trim(),
          price: selectedTimeSlot.value.price || props.venue.price
        }
        
        emit('confirm', reservationData)
      } catch (error) {
        console.error('提交预约失败:', error)
        uni.showToast({
          title: '提交失败',
          icon: 'error'
        })
      } finally {
        isLoading.value = false
      }
    }
    
    // 处理取消
    const handleCancel = () => {
      emit('cancel')
    }
    
    // 处理遮罩点击
    const handleOverlayClick = () => {
      handleCancel()
    }
    
    // 加载时间段数据
    const loadTimeSlots = () => {
      // 模拟时间段数据，实际应该从API获取
      const slots = [
        { id: 1, startTime: '08:00', endTime: '09:00', price: props.venue?.price || 0, available: true },
        { id: 2, startTime: '09:00', endTime: '10:00', price: props.venue?.price || 0, available: true },
        { id: 3, startTime: '10:00', endTime: '11:00', price: props.venue?.price || 0, available: false },
        { id: 4, startTime: '11:00', endTime: '12:00', price: props.venue?.price || 0, available: true },
        { id: 5, startTime: '14:00', endTime: '15:00', price: props.venue?.price || 0, available: true },
        { id: 6, startTime: '15:00', endTime: '16:00', price: props.venue?.price || 0, available: true },
        { id: 7, startTime: '16:00', endTime: '17:00', price: props.venue?.price || 0, available: true },
        { id: 8, startTime: '17:00', endTime: '18:00', price: props.venue?.price || 0, available: true },
        { id: 9, startTime: '18:00', endTime: '19:00', price: props.venue?.price || 0, available: true },
        { id: 10, startTime: '19:00', endTime: '20:00', price: props.venue?.price || 0, available: true }
      ]
      
      timeSlots.value = slots
    }
    
    // 监听场地变化
    watch(() => props.venue, () => {
      if (props.venue) {
        loadTimeSlots()
      }
    }, { immediate: true })
    
    // 组件挂载
    onMounted(() => {
      loadTimeSlots()
    })
    
    return {
      formData,
      selectedTimeSlot,
      timeSlots,
      canSubmit,
      submitText,
      isLoading,
      getVenueTypeText,
      selectTimeSlot,
      handleConfirm,
      handleCancel,
      handleOverlayClick,
      formatDisplayDate
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.modal-container {
  background: #fff;
  border-radius: 20rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
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

.close-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.close-icon {
  font-size: 24rpx;
  color: #666;
}

.modal-content {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.venue-info {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.venue-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.venue-type {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.venue-price {
  font-size: 28rpx;
  color: #007bff;
  font-weight: 600;
  display: block;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.form-value {
  font-size: 28rpx;
  color: #666;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  display: block;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #007bff;
  outline: none;
}

.form-textarea {
  height: 120rpx;
  resize: none;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.time-slot {
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.time-slot:not(.disabled):active {
  transform: scale(0.98);
}

.time-slot.selected {
  border-color: #007bff;
  background: #e7f3ff;
}

.time-slot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slot-time {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.slot-price {
  font-size: 24rpx;
  color: #007bff;
  font-weight: 600;
  display: block;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
  border-top: 2rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn.cancel {
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
}

.btn.cancel:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.btn.confirm {
  background: #007bff;
  color: #fff;
}

.btn.confirm:not(:disabled):active {
  background: #0056b3;
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  color: inherit;
}
</style>
