<template>
  <view v-if="visible" class="timeslot-edit-overlay" @click="handleOverlayClick">
    <view class="timeslot-edit-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ timeSlot ? '编辑时间段' : '添加时间段' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-content">
        <form class="timeslot-form">
          <!-- 日期选择 -->
          <view class="form-section">
            <text class="section-title">日期设置</text>
            
            <view class="form-group">
              <text class="form-label">选择日期 *</text>
              <picker mode="date" :value="timeslotData.date" @change="onDateChange">
                <view class="form-picker">
                  <text>{{ timeslotData.date || '请选择日期' }}</text>
                  <text class="picker-icon">📅</text>
                </view>
              </picker>
            </view>
          </view>
          
          <!-- 时间设置 */
          <view class="form-section">
            <text class="section-title">时间设置</text>
            
            <view class="time-grid">
              <view class="form-group">
                <text class="form-label">开始时间 *</text>
                <picker mode="time" :value="timeslotData.startTime" @change="onStartTimeChange">
                  <view class="time-picker">
                    <text>{{ timeslotData.startTime || '请选择开始时间' }}</text>
                    <text class="picker-icon">🕐</text>
                  </view>
                </picker>
              </view>
              
              <view class="form-group">
                <text class="form-label">结束时间 *</text>
                <picker mode="time" :value="timeslotData.endTime" @change="onEndTimeChange">
                  <view class="time-picker">
                    <text>{{ timeslotData.endTime || '请选择结束时间' }}</text>
                    <text class="picker-icon">🕐</text>
                  </view>
                </picker>
              </view>
            </view>
            
            <view class="duration-display" v-if="duration > 0">
              <text class="duration-text">时长：{{ duration }} 小时</text>
            </view>
          </view>
          
          <!-- 价格设置 */
          <view class="form-section">
            <text class="section-title">价格设置</text>
            
            <view class="form-group">
              <text class="form-label">价格（元）</text>
              <input 
                class="form-input" 
                v-model="timeslotData.price" 
                placeholder="请输入价格"
                type="digit"
              />
              <text class="form-hint">不填写将使用场地默认价格</text>
            </view>
          </view>
          
          <!-- 状态设置 */
          <view class="form-section">
            <text class="section-title">状态设置</text>
            
            <view class="form-group">
              <text class="form-label">时间段状态</text>
              <picker :range="statusOptions" @change="onStatusChange">
                <view class="form-picker">
                  <text>{{ statusOptions[statusIndex] || '请选择状态' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            
            <view class="status-description">
              <text class="status-desc-text">{{ getStatusDescription() }}</text>
            </view>
          </view>
          
          <!-- 重复设置 -->
          <view class="form-section" v-if="!timeSlot">
            <text class="section-title">重复设置</text>
            
            <view class="form-group switch-group">
              <text class="form-label">批量创建</text>
              <switch :checked="enableBatch" @change="onBatchChange" />
              <text class="switch-hint">开启后可批量创建多个时间段</text>
            </view>
            
            <view v-if="enableBatch" class="batch-settings">
              <view class="form-group">
                <text class="form-label">结束日期</text>
                <picker mode="date" :value="batchEndDate" @change="onBatchEndDateChange">
                  <view class="form-picker">
                    <text>{{ batchEndDate || '请选择结束日期' }}</text>
                    <text class="picker-icon">📅</text>
                  </view>
                </picker>
              </view>
              
              <view class="form-group">
                <text class="form-label">重复方式</text>
                <picker :range="repeatOptions" @change="onRepeatTypeChange">
                  <view class="form-picker">
                    <text>{{ repeatOptions[repeatTypeIndex] || '请选择重复方式' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
              
              <view v-if="repeatType === 'weekly'" class="weekly-settings">
                <text class="weekly-label">选择重复的星期：</text>
                <checkbox-group @change="onWeeklyDaysChange">
                  <view class="days-grid">
                    <label v-for="(day, index) in weekDays" :key="index" class="day-item">
                      <checkbox 
                        :value="index.toString()" 
                        :checked="weeklyDays.includes(index)"
                      />
                      <text class="day-text">{{ day }}</text>
                    </label>
                  </view>
                </checkbox-group>
              </view>
              
              <view class="batch-preview" v-if="batchPreview.length > 0">
                <text class="preview-title">将创建以下时间段：</text>
                <view class="preview-list">
                  <view 
                    v-for="(preview, index) in batchPreview.slice(0, 5)" 
                    :key="index"
                    class="preview-item"
                  >
                    <text>{{ preview.date }} {{ preview.startTime }}-{{ preview.endTime }}</text>
                  </view>
                  <view v-if="batchPreview.length > 5" class="preview-more">
                    <text>还有 {{ batchPreview.length - 5 }} 个时间段...</text>
                  </view>
                </view>
                <text class="preview-total">共 {{ batchPreview.length }} 个时间段</text>
              </view>
            </view>
          </view>
          
          <!-- 备注信息 -->
          <view class="form-section">
            <text class="section-title">备注信息</text>
            
            <view class="form-group">
              <text class="form-label">备注</text>
              <textarea 
                class="form-textarea" 
                v-model="timeslotData.remark" 
                placeholder="请输入备注信息"
                maxlength="200"
              />
            </view>
          </view>
        </form>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="save-btn" @click="saveTimeSlot" :disabled="!isFormValid || saving">
          {{ saving ? '保存中...' : (timeSlot ? '保存' : (enableBatch ? '批量创建' : '创建')) }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'TimeSlot编辑Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    timeSlot: {
      type: Object,
      default: null
    },
    venueId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      timeslotData: {
        date: '',
        startTime: '',
        endTime: '',
        price: '',
        status: 'available',
        remark: ''
      },
      statusIndex: 0,
      statusOptions: ['可预约', '维护中', '已关闭'],
      statusValues: ['available', 'maintenance', 'closed'],
      enableBatch: false,
      batchEndDate: '',
      repeatTypeIndex: 0,
      repeatOptions: ['每天', '每周', '工作日', '周末'],
      repeatValues: ['daily', 'weekly', 'weekdays', 'weekends'],
      weeklyDays: [],
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      batchPreview: [],
      saving: false
    }
  },
  computed: {
    duration() {
      if (!this.timeslotData.startTime || !this.timeslotData.endTime) return 0
      
      const start = new Date(`2000-01-01 ${this.timeslotData.startTime}`)
      const end = new Date(`2000-01-01 ${this.timeslotData.endTime}`)
      
      if (end <= start) return 0
      
      return (end - start) / (1000 * 60 * 60) // 转换为小时
    },
    repeatType() {
      return this.repeatValues[this.repeatTypeIndex]
    },
    isFormValid() {
      return this.timeslotData.date && 
             this.timeslotData.startTime && 
             this.timeslotData.endTime &&
             this.duration > 0
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    },
    // 监听批量设置变化，生成预览
    enableBatch() {
      this.generateBatchPreview()
    },
    batchEndDate() {
      this.generateBatchPreview()
    },
    repeatTypeIndex() {
      this.generateBatchPreview()
    },
    weeklyDays() {
      this.generateBatchPreview()
    },
    'timeslotData.date'() {
      this.generateBatchPreview()
    },
    'timeslotData.startTime'() {
      this.generateBatchPreview()
    },
    'timeslotData.endTime'() {
      this.generateBatchPreview()
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    initializeForm() {
      if (this.timeSlot) {
        // 编辑模式
        this.timeslotData = {
          ...this.timeslotData,
          ...this.timeSlot
        }
        
        // 设置状态索引
        this.statusIndex = this.statusValues.indexOf(this.timeSlot.status)
        if (this.statusIndex === -1) this.statusIndex = 0
        
        this.enableBatch = false
      } else {
        // 新建模式
        this.timeslotData = {
          date: this.get今天Date(),
          startTime: '',
          endTime: '',
          price: '',
          status: 'available',
          remark: ''
        }
        this.statusIndex = 0
        this.enableBatch = false
        this.batchEndDate = ''
        this.repeatTypeIndex = 0
        this.weeklyDays = []
        this.batchPreview = []
      }
    },

    /**
     * 表单控件事件
     */
    onDateChange(e) {
      this.timeslotData.date = e.detail.value
    },

    onStartTimeChange(e) {
      this.timeslotData.startTime = e.detail.value
    },

    onEndTimeChange(e) {
      this.timeslotData.endTime = e.detail.value
    },

    onStatusChange(e) {
      this.statusIndex = e.detail.value
      this.timeslotData.status = this.statusValues[e.detail.value]
    },

    onBatchChange(e) {
      this.enableBatch = e.detail.value
      if (e.detail.value) {
        // 设置默认结束日期为一周后
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        this.batchEndDate = nextWeek.toISOString().split('T')[0]
      }
    },

    onBatchEndDateChange(e) {
      this.batchEndDate = e.detail.value
    },

    onRepeatTypeChange(e) {
      this.repeatTypeIndex = e.detail.value
      // 如果选择每周，初始化为工作日
      if (this.repeatValues[e.detail.value] === 'weekly' && this.weeklyDays.length === 0) {
        this.weeklyDays = [1, 2, 3, 4, 5] // 周一到周五
      }
    },

    onWeeklyDaysChange(e) {
      this.weeklyDays = e.detail.value.map(day => parseInt(day))
    },

    /**
     * 生成批量预览
     */
    generateBatchPreview() {
      if (!this.enableBatch || !this.timeslotData.date || !this.batchEndDate || 
          !this.timeslotData.startTime || !this.timeslotData.endTime) {
        this.batchPreview = []
        return
      }

      const preview = []
      const startDate = new Date(this.timeslotData.date)
      const endDate = new Date(this.batchEndDate)
      
      if (endDate < startDate) {
        this.batchPreview = []
        return
      }

      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        let should添加 = false
        
        switch (this.repeatType) {
          case 'daily':
            should添加 = true
            break
          case 'weekly':
            should添加 = this.weeklyDays.includes(currentDate.getDay())
            break
          case 'weekdays':
            should添加 = currentDate.getDay() >= 1 && currentDate.getDay() <= 5
            break
          case 'weekends':
            should添加 = currentDate.getDay() === 0 || currentDate.getDay() === 6
            break
        }
        
        if (should添加) {
          preview.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: this.timeslotData.startTime,
            endTime: this.timeslotData.endTime
          })
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      this.batchPreview = preview
    },

    /**
     * 保存时间段
     */
    async saveTimeSlot() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写必填项',
          icon: 'error'
        })
        return
      }

      // 验证时间
      if (this.duration <= 0) {
        uni.showToast({
          title: '结束时间必须大于开始时间',
          icon: 'error'
        })
        return
      }

      // 验证批量设置
      if (this.enableBatch && !this.timeSlot) {
        if (!this.batchEndDate) {
          uni.showToast({
            title: '请选择结束日期',
            icon: 'error'
          })
          return
        }
        
        if (new Date(this.batchEndDate) < new Date(this.timeslotData.date)) {
          uni.showToast({
            title: '结束日期不能早于开始日期',
            icon: 'error'
          })
          return
        }
        
        if (this.batchPreview.length === 0) {
          uni.showToast({
            title: '没有可创建的时间段',
            icon: 'error'
          })
          return
        }
      }

      this.saving = true
      try {
        const saveData = {
          ...this.timeslotData,
          venueId: this.venueId,
          price: parseFloat(this.timeslotData.price) || null
        }

        let response
        if (this.timeSlot) {
          // 更新时间段
          response = await api.admin.updateTimeSlot(this.timeSlot.id, saveData)
        } else if (this.enableBatch) {
          // 批量创建时间段
          const batchData = this.batchPreview.map(preview => ({
            ...saveData,
            date: preview.date,
            startTime: preview.startTime,
            endTime: preview.endTime
          }))
          response = await api.admin.batchCreateTimeSlots(batchData)
        } else {
          // 创建单个时间段
          response = await api.admin.createTimeSlot(saveData)
        }

        if (response.success) {
          const successText = this.timeSlot ? '更新成功' : 
                             this.enableBatch ? `批量创建成功，共创建 ${this.batchPreview.length} 个时间段` : 
                             '创建成功'
          
          uni.showToast({
            title: successText,
            icon: 'success'
          })
          this.$emit('saved', response.data)
          this.close()
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存时间段失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        this.saving = false
      }
    },

    /**
     * 工具方法
     */
    get今天Date() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },

    getStatusDescription() {
      const descriptions = {
        available: '用户可以预约此时间段',
        maintenance: '时间段处于维护状态，不可预约',
        closed: '时间段已关闭，不可预约'
      }
      return descriptions[this.timeslotData.status] || ''
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.$emit('close')
    },

    handleOverlayClick() {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.timeslot-edit-overlay {
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

.timeslot-edit-modal {
  background: white;
  border-radius: 24rpx;
  width: 100%;
  max-width: 700rpx;
  max-height: 90vh;
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
  padding: 0 40rpx;
}

.timeslot-form {
  padding: 30rpx 0;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-group.switch-group {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  font-weight: 500;
}

.switch-group .form-label {
  margin-bottom: 0;
  flex-shrink: 0;
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
  min-height: 120rpx;
  resize: vertical;
}

.form-picker,
.time-picker {
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.picker-icon {
  font-size: 28rpx;
}

.form-hint,
.switch-hint {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.switch-group .switch-hint {
  margin-top: 0;
}

/* 时间网格 */
.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.duration-display {
  background: #e8f4fd;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  margin-top: 20rpx;
  text-align: center;
}

.duration-text {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 500;
}

/* 状态描述 */
.status-description {
  background: #f8f9fa;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  margin-top: 12rpx;
}

.status-desc-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* 批量设置 */
.batch-settings {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-top: 20rpx;
}

.weekly-settings {
  margin-top: 20rpx;
}

.weekly-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.day-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx;
  background: white;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.day-text {
  color: #333;
}

/* 批量预览 */
.batch-preview {
  background: white;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-top: 20rpx;
  border: 2rpx solid #e9ecef;
}

.preview-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.preview-list {
  margin-bottom: 16rpx;
}

.preview-item {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 24rpx;
  color: #666;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-more {
  padding: 12rpx 0;
  font-size: 24rpx;
  color: #999;
  font-style: italic;
}

.preview-total {
  font-size: 26rpx;
  font-weight: 500;
  color: #667eea;
  text-align: center;
  display: block;
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

/* 响应式设计 */
@media (max-width: 750rpx) {
  .timeslot-edit-overlay {
    padding: 20rpx;
  }
  
  .modal-header,
  .modal-footer {
    padding: 20rpx 30rpx;
  }
  
  .modal-content {
    padding: 0 30rpx;
  }
  
  .time-grid {
    grid-template-columns: 1fr;
  }
  
  .days-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-group.switch-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 8rpx;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4rpx;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4rpx;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
