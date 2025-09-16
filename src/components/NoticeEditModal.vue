<template>
  <view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ isEdit ? '编辑公告' : '新建公告' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-body">
        <form class="notice-form" @submit.prevent="handleSubmit">
          <!-- 基本信息 -->
          <view class="form-section">
            <view class="section-title">基本信息</view>
            
            <view class="form-item">
              <text class="form-label">公告标题 *</text>
              <textarea 
                class="form-textarea title-textarea" 
                v-model="formData.title"
                placeholder="请输入公告标题"
                maxlength="200"
                required
              />
              <text class="char-count">{{ formData.title.length }}/200</text>
            </view>

            <view class="form-item">
              <text class="form-label">公告内容 *</text>
              <textarea 
                class="form-textarea" 
                v-model="formData.content"
                placeholder="请输入公告内容"
                maxlength="2000"
                required
              />
              <text class="char-count">{{ formData.content.length }}/2000</text>
            </view>
          </view>

          <!-- 公告设置 -->
          <view class="form-section">
            <view class="section-title">公告设置</view>
            
            <view class="form-item">
              <text class="form-label">公告类型</text>
              <view class="type-grid">
                <view 
                  v-for="type in typeOptions" 
                  :key="type.value"
                  class="type-item"
                  :class="{ 'selected': formData.type === type.value }"
                  @click="selectType(type.value)"
                >
                  <view class="type-radio">
                    <view class="radio" :class="{ 'checked': formData.type === type.value }">
                      <view v-if="formData.type === type.value" class="radio-dot"></view>
                    </view>
                  </view>
                  <text class="type-name" :class="'type-' + type.value">{{ type.name }}</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">优先级</text>
              <view class="priority-container">
                <slider 
                  class="priority-slider"
                  :value="formData.priority"
                  @change="onPriorityChange"
                  min="0" 
                  max="10" 
                  step="1"
                  show-value
                  activeColor="#667eea"
                  backgroundColor="#e9ecef"
                />
                <text class="priority-label">{{ getPriorityText(formData.priority) }}</text>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">发布状态</text>
              <view class="status-grid">
                <view 
                  v-for="status in statusOptions" 
                  :key="status.value"
                  class="status-item"
                  :class="{ 'selected': formData.status === status.value }"
                  @click="selectStatus(status.value)"
                >
                  <view class="status-radio">
                    <view class="radio" :class="{ 'checked': formData.status === status.value }">
                      <view v-if="formData.status === status.value" class="radio-dot"></view>
                    </view>
                  </view>
                  <text class="status-name" :class="'status-' + status.value">{{ status.name }}</text>
                </view>
              </view>
            </view>

            <!-- <view class="form-item">
              <view class="checkbox-wrapper">
                <checkbox 
                  :checked="formData.isSticky"
                  @change="onStickyChange"
                  color="#667eea"
                />
                <text class="checkbox-label">置顶显示</text>
              </view>
              <text class="form-hint">置顶的公告将优先显示在列表顶部</text>
            </view> -->
          </view>

          <!-- 时间段设置 -->
          <view class="form-section">
            <view class="section-title">
              生效时间段
              <text class="section-subtitle">只需填写日期，系统自动处理时间</text>
            </view>
            
            <!-- 时间类型选择 -->
            <view class="form-item">
              <text class="form-label">时间类型</text>
              <view class="time-type-selection">
                <view 
                  class="time-type-option"
                  :class="{ 'selected': isPermanentNotice }"
                  @click="selectTimeType(true)"
                >
                  <view class="type-radio">
                    <view class="radio" :class="{ 'checked': isPermanentNotice }">
                      <view v-if="isPermanentNotice" class="radio-dot"></view>
                    </view>
                  </view>
                  <view class="type-content">
                    <text class="type-name">永久公告</text>
                    <text class="type-desc">公告永久有效，不设置过期时间</text>
                  </view>
                </view>
                
                <view 
                  class="time-type-option"
                  :class="{ 'selected': !isPermanentNotice }"
                  @click="selectTimeType(false)"
                >
                  <view class="type-radio">
                    <view class="radio" :class="{ 'checked': !isPermanentNotice }">
                      <view v-if="!isPermanentNotice" class="radio-dot"></view>
                    </view>
                  </view>
                  <view class="type-content">
                    <text class="type-name">时间段公告</text>
                    <text class="type-desc">设置公告的生效时间段</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 时间选择区域 -->
            <view v-if="!isPermanentNotice" class="time-range-section">
              <view class="form-item">
                <text class="form-label">开始日期</text>
                <view class="date-picker-wrapper">
                  <picker 
                    mode="date" 
                    :value="formData.startDate"
                    @change="onStartDateChange"
                  >
                    <view class="date-picker">
                      <text class="date-text">{{ formData.startDate || '请选择开始日期' }}</text>
                      <text class="picker-icon">📅</text>
                    </view>
                  </picker>
                </view>
              </view>

              <view class="form-item">
                <text class="form-label">结束日期</text>
                <view class="date-picker-wrapper">
                  <picker 
                    mode="date" 
                    :value="formData.endDate"
                    @change="onEndDateChange"
                  >
                    <view class="date-picker">
                      <text class="date-text">{{ formData.endDate || '请选择结束日期' }}</text>
                      <text class="picker-icon">📅</text>
                    </view>
                  </picker>
                </view>
              </view>

              <view class="time-preview">
                <text class="preview-label">预览：</text>
                <text class="preview-text">{{ getTimePreview() }}</text>
              </view>
            </view>
          </view>
        </form>
      </view>
      
      <view class="modal-footer">
        <button class="btn btn-cancel" @click="close">取消</button>
        <button class="btn btn-confirm" @click="handleSubmit" :disabled="!isFormValid">
          {{ isEdit ? '更新' : '创建' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { TimeUtils } from '../utils/timeUtils.js'
import { IOSDateFix } from '../utils/iosDateFix.js'

export default {
  name: 'NoticeEditModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    notice: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        title: '',
        content: '',
        type: 'info',
        priority: 0,
        status: 'draft',
        isSticky: false,
        startDate: '',
        endDate: ''
      },
      isPermanentNotice: true
    }
  },
  computed: {
    typeOptions() {
      return [
        { value: 'info', name: '信息' },
        { value: 'warning', name: '警告' },
        { value: 'error', name: '错误' },
        { value: 'success', name: '成功' }
      ]
    },
    
    statusOptions() {
      return [
        { value: 'draft', name: '草稿' },
        { value: 'published', name: '已发布' },
        { value: 'archived', name: '已存档' }
      ]
    },
    
    isFormValid() {
      return this.formData.title.trim() && 
             this.formData.content.trim() && 
             (this.isPermanentNotice || this.isTimeRangeValid())
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initFormData()
      }
    },
    notice: {
      handler() {
        if (this.visible) {
          this.initFormData()
        }
      },
      deep: true
    }
  },
  methods: {
    initFormData() {
      if (this.isEdit && this.notice) {
        // 编辑模式：使用现有数据
        this.formData = {
          title: this.notice.title || '',
          content: this.notice.content || '',
          type: this.notice.type || 'info',
          priority: this.notice.priority || 0,
          status: this.notice.status || 'draft',
          isSticky: this.notice.isSticky || false,
          startDate: this.formatDateForPicker(this.notice.startTime) || '',
          endDate: this.formatDateForPicker(this.notice.endTime) || ''
        }
        
        // 判断是否为永久公告
        this.isPermanentNotice = !this.notice.startTime && !this.notice.endTime
      } else {
        // 新建模式：重置表单
        this.formData = {
          title: '',
          content: '',
          type: 'info',
          priority: 0,
          status: 'draft',
          isSticky: false,
          startDate: '',
          endDate: ''
        }
        this.isPermanentNotice = true
      }
    },
    
    formatDateForPicker(dateTime) {
      if (!dateTime) return ''
      
      try {
        // 🍎 使用iOS兼容的安全日期创建
        const date = IOSDateFix.safeCreateDate(dateTime)
        if (!date || isNaN(date.getTime())) {
          console.warn('⚠️ 无效的日期时间:', dateTime)
          return ''
        }
        
        // 🎯 使用安全的格式化方法
        return TimeUtils.formatDate(date, 'YYYY-MM-DD')
      } catch (error) {
        console.error('❌ formatDateForPicker 失败:', error, '输入:', dateTime)
        return ''
      }
    },
    
    selectType(type) {
      this.formData.type = type
    },
    
    selectStatus(status) {
      this.formData.status = status
    },
    
    selectTimeType(isPermanent) {
      this.isPermanentNotice = isPermanent
      if (this.isPermanentNotice) {
        this.formData.startDate = ''
        this.formData.endDate = ''
      }
    },
    
    onPriorityChange(e) {
      this.formData.priority = e.detail.value
    },
    
    onStickyChange(e) {
      this.formData.isSticky = e.detail.value
    },
    
    onPermanentChange(e) {
      this.isPermanentNotice = e.detail.value
      if (this.isPermanentNotice) {
        this.formData.startDate = ''
        this.formData.endDate = ''
      }
    },
    
    onStartDateChange(e) {
      try {
        const dateValue = e.detail.value
        console.log('📅 开始日期变更:', dateValue)
        
        // 🎯 验证日期格式并设置
        if (dateValue && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          this.formData.startDate = dateValue
        } else {
          console.warn('⚠️ 开始日期格式异常:', dateValue)
          this.formData.startDate = ''
        }
      } catch (error) {
        console.error('❌ 开始日期处理失败:', error)
        this.formData.startDate = ''
      }
    },
    
    onEndDateChange(e) {
      try {
        const dateValue = e.detail.value
        console.log('📅 结束日期变更:', dateValue)
        
        // 🎯 验证日期格式并设置
        if (dateValue && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          this.formData.endDate = dateValue
        } else {
          console.warn('⚠️ 结束日期格式异常:', dateValue)
          this.formData.endDate = ''
        }
      } catch (error) {
        console.error('❌ 结束日期处理失败:', error)
        this.formData.endDate = ''
      }
    },
    
    isTimeRangeValid() {
      if (this.isPermanentNotice) return true
      
      // 按照文档要求：时间段公告至少要有一个时间字段
      if (!this.formData.startDate && !this.formData.endDate) {
        return false // 非永久公告必须至少填写一个日期
      }
      
      // 如果同时填写了开始和结束日期，需要验证顺序
      if (this.formData.startDate && this.formData.endDate) {
        try {
          // 🍎 使用iOS兼容的日期比较
          const startDate = IOSDateFix.safeCreateDate(this.formData.startDate)
          const endDate = IOSDateFix.safeCreateDate(this.formData.endDate)
          
          if (startDate && endDate) {
            return startDate <= endDate
          }
          
          console.warn('⚠️ 日期验证失败，使用字符串比较')
          return this.formData.startDate <= this.formData.endDate
        } catch (error) {
          console.error('❌ 日期顺序验证失败:', error)
          return this.formData.startDate <= this.formData.endDate
        }
      }
      
      return true
    },
    
    getTimePreview() {
      if (this.isPermanentNotice) return '永久有效'
      
      // 按照文档说明显示预览
      if (this.formData.startDate && this.formData.endDate) {
        if (this.formData.startDate === this.formData.endDate) {
          return `${this.formData.startDate}（单日公告）`
        } else {
          return `${this.formData.startDate} 至 ${this.formData.endDate}`
        }
      }
      
      if (this.formData.startDate) {
        return `从 ${this.formData.startDate} 开始（结束时间自动为当天 23:59:59）`
      }
      
      if (this.formData.endDate) {
        return `至 ${this.formData.endDate} 结束（开始时间自动为当天 00:00:00）`
      }
      
      return '请至少选择一个日期'
    },
    
    getPriorityText(priority) {
      if (priority >= 8) return '高优先级'
      if (priority >= 5) return '中优先级'
      if (priority >= 1) return '低优先级'
      return '普通'
    },
    
    handleSubmit() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'error'
        })
        return
      }
      
      // 验证时间设置
      if (!this.isPermanentNotice && !this.isTimeRangeValid()) {
        if (!this.formData.startDate && !this.formData.endDate) {
          uni.showToast({
            title: '时间段公告请至少选择一个日期',
            icon: 'error'
          })
        } else {
          uni.showToast({
            title: '开始日期不能晚于结束日期',
            icon: 'error'
          })
        }
        return
      }
      
      // 构建提交数据
      const submitData = {
        title: this.formData.title.trim(),
        content: this.formData.content.trim(),
        type: this.formData.type,
        priority: this.formData.priority,
        status: this.formData.status,
        isSticky: this.formData.isSticky
      }
      
      // 按照文档要求添加时间段信息
      if (this.isPermanentNotice) {
        // 永久公告：不添加任何时间字段（startDate 和 endDate 都不传）
        // 这样后端会创建永久公告
      } else {
        // 时间段公告：根据用户填写情况传递相应字段
        // 文档说明：
        // - 只填写 startDate：结束时间默认为当天 23:59:59
        // - 只填写 endDate：开始时间默认为当天 00:00:00  
        // - 都填写：指定时间段
        // - 都不填写：创建永久公告（但这里用户已选择非永久，所以至少传一个）
        
        if (this.formData.startDate) {
  
          submitData.startDate = this.formData.startDate
        }
        if (this.formData.endDate) {
          submitData.endDate = this.formData.endDate
        }
      }
      
      this.$emit('save', submitData)
    },
    
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 800rpx;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  background: #fafbfc;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: #f5f5f5;
  color: #666;
  border-radius: 50%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: #e9ecef;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx;
}

.notice-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-section {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #e9ecef;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-subtitle {
  font-size: 22rpx;
  font-weight: normal;
  color: #999;
  font-style: italic;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 12rpx;
}

.input-wrapper {
  margin-bottom: 8rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #2d3748;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #2d3748;
  background: white;
  transition: all 0.3s ease;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

/* 标题 textarea 特殊样式 */
.title-textarea {
  min-height: 80rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.form-hint {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 类型选择 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.type-radio {
  margin-right: 12rpx;
}

.radio {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio.checked {
  border-color: #667eea;
}

.radio-dot {
  width: 18rpx;
  height: 18rpx;
  background: #667eea;
  border-radius: 50%;
}

.type-name {
  font-size: 26rpx;
  font-weight: 500;
}

.type-name.type-info {
  color: #3498db;
}

.type-name.type-warning {
  color: #f39c12;
}

.type-name.type-error {
  color: #e74c3c;
}

.type-name.type-success {
  color: #27ae60;
}

/* 优先级滑块 */
.priority-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.priority-slider {
  flex: 1;
}

.priority-label {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
  min-width: 120rpx;
}

/* 状态选择 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: white;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.status-radio {
  margin-right: 8rpx;
}

.status-name {
  font-size: 24rpx;
  font-weight: 500;
}

.status-name.status-draft {
  color: #95a5a6;
}

.status-name.status-published {
  color: #27ae60;
}

.status-name.status-archived {
  color: #f39c12;
}

/* 复选框 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.checkbox-label {
  font-size: 26rpx;
  color: #2d3748;
  font-weight: 500;
}

/* 时间段设置 */
.time-type-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

/* 时间类型选择 */
.time-type-selection {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.time-type-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: white;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-type-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.1);
}

.time-type-option:active {
  transform: translateY(1rpx);
}

.type-content {
  flex: 1;
  margin-left: 16rpx;
}

.type-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d3748;
  display: block;
  margin-bottom: 6rpx;
}

.type-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

.time-range-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #e9ecef;
}

.date-picker-wrapper {
  margin-bottom: 8rpx;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: white;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-picker:active {
  background: #f8f9fa;
  border-color: #667eea;
}

.date-text {
  font-size: 26rpx;
  color: #2d3748;
}

.picker-icon {
  font-size: 24rpx;
}

.time-preview {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #e8f2ff;
  border-radius: 8rpx;
  border: 2rpx solid #bee3f8;
}

.preview-label {
  font-size: 22rpx;
  color: #3182ce;
  font-weight: 500;
}

.preview-text {
  font-size: 24rpx;
  color: #2c5aa0;
  font-weight: 600;
  margin-left: 8rpx;
}

/* 底部按钮 */
.modal-footer {
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  background: #fafbfc;
}

.btn {
  padding: 24rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120rpx;
  text-align: center;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 2rpx solid #e9ecef;
}

.btn-cancel:active {
  background: #f8f9fa;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.btn-confirm:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.btn-confirm:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .type-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
