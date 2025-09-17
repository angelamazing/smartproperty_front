<template>
  <view class="reservation-detail-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">❮</text>
        </button>
        <text class="header-title">预约详情</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 预约详情内容 -->
    <view v-else-if="reservationInfo" class="reservation-content">
      <!-- 预约状态卡片 -->
      <view class="status-card" :class="getStatusClass(reservationInfo.status)">
        <view class="status-icon">{{ getStatusIcon(reservationInfo.status) }}</view>
        <view class="status-info">
          <text class="status-text">{{ getStatusText(reservationInfo.status) }}</text>
          <text class="status-desc">{{ getStatusDesc(reservationInfo.status) }}</text>
        </view>
      </view>

      <!-- 预约基本信息 -->
      <view class="info-section">
        <text class="section-title">预约信息</text>
        
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">场地名称</text>
            <text class="info-value">{{ reservationInfo.venueName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">预约日期</text>
            <text class="info-value">{{ formatDate(reservationInfo.reservationDate) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">预约时间</text>
            <text class="info-value">{{ reservationInfo.startTime }} - {{ reservationInfo.endTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">预约时长</text>
            <text class="info-value">{{ reservationInfo.duration || 0 }}分钟</text>
          </view>
          <view class="info-item">
            <text class="info-label">预约费用</text>
            <text class="info-value price">¥{{ reservationInfo.totalAmount || '0.00' }}</text>
          </view>
        </view>
      </view>

      <!-- 预约人信息 -->
      <view class="info-section">
        <text class="section-title">预约人信息</text>
        
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">预约人</text>
            <text class="info-value">{{ reservationInfo.userName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ reservationInfo.phoneNumber }}</text>
          </view>
          <view class="info-item" v-if="reservationInfo.department">
            <text class="info-label">所属部门</text>
            <text class="info-value">{{ reservationInfo.department }}</text>
          </view>
        </view>
      </view>

      <!-- 预约详情 -->
      <view class="info-section">
        <text class="section-title">预约详情</text>
        
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">使用目的</text>
            <text class="info-value">{{ reservationInfo.purpose }}</text>
          </view>
          <view class="info-item" v-if="reservationInfo.participantCount">
            <text class="info-label">参与人数</text>
            <text class="info-value">{{ reservationInfo.participantCount }}人</text>
          </view>
          <view class="info-item" v-if="reservationInfo.participants && reservationInfo.participants.length > 0">
            <text class="info-label">参与人员</text>
            <view class="participants-list">
              <text 
                v-for="(participant, index) in reservationInfo.participants" 
                :key="index"
                class="participant-item"
              >
                {{ participant.name }}{{ participant.phone ? ` (${participant.phone})` : '' }}
              </text>
            </view>
          </view>
          <view class="info-item" v-if="reservationInfo.remark">
            <text class="info-label">备注信息</text>
            <text class="info-value">{{ reservationInfo.remark }}</text>
          </view>
        </view>
      </view>

      <!-- 时间记录 -->
      <view class="info-section">
        <text class="section-title">时间记录</text>
        
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">预约时间</text>
            <text class="info-value">{{ formatDateTime(reservationInfo.createTime) }}</text>
          </view>
          <view class="info-item" v-if="reservationInfo.updateTime">
            <text class="info-label">更新时间</text>
            <text class="info-value">{{ formatDateTime(reservationInfo.updateTime) }}</text>
          </view>
          <view class="info-item" v-if="reservationInfo.approveTime">
            <text class="info-label">审批时间</text>
            <text class="info-value">{{ formatDateTime(reservationInfo.approveTime) }}</text>
          </view>
          <view class="info-item" v-if="reservationInfo.approvedBy">
            <text class="info-label">审批人</text>
            <text class="info-value">{{ reservationInfo.approvedBy }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button 
          v-if="canCancel" 
          class="action-btn danger" 
          @click="cancelReservation"
          :loading="isCancelling"
        >
          {{ isCancelling ? '取消中...' : '取消预约' }}
        </button>
        <button 
          v-if="canReschedule" 
          class="action-btn secondary" 
          @click="rescheduleReservation"
        >
          重新预约
        </button>
        <button 
          class="action-btn primary" 
          @click="contactVenue"
        >
          联系场地
        </button>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">预约信息加载失败</text>
      <button class="retry-btn" @click="loadReservationDetail">重试</button>
    </view>

    <!-- 取消确认弹窗 -->
    <view class="cancel-modal" v-if="showCancelModal">
      <view class="modal-mask" @click="closeCancelModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">取消预约</text>
        </view>
        
        <view class="modal-body">
          <text class="modal-text">确定要取消这个预约吗？</text>
          <text class="modal-warning">取消后该时间段将重新开放预约</text>
          
          <view class="cancel-reason">
            <text class="reason-label">取消原因（可选）</text>
            <textarea 
              class="reason-input" 
              v-model="cancelReason" 
              placeholder="请输入取消原因"
              maxlength="200"
            ></textarea>
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-secondary" @click="closeCancelModal">不取消</button>
          <button 
            class="btn-danger" 
            @click="confirmCancel"
            :loading="isCancelling"
          >
            {{ isCancelling ? '取消中...' : '确认取消' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'ReservationDetail',
  mixins: [timeMixin],
  data() {
    return {
      reservationId: '',
      isLoading: true,
      reservationInfo: null,
      showCancelModal: false,
      cancelReason: '',
      isCancelling: false
    }
  },

  computed: {
    canCancel() {
      if (!this.reservationInfo) return false
      return ['pending', 'confirmed'].includes(this.reservationInfo.status)
    },

    canReschedule() {
      if (!this.reservationInfo) return false
      return ['rejected', 'cancelled'].includes(this.reservationInfo.status)
    }
  },

  onLoad(options) {
    if (options.id) {
      this.reservationId = options.id
      this.loadReservationDetail()
    } else {
      uni.showToast({
        title: '预约ID不能为空',
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },

  methods: {
    /**
     * 加载预约详情
     */
    async loadReservationDetail() {
      try {
        this.isLoading = true
        
        const result = await api.venue.getReservationDetail(this.reservationId)
        
        if (result && result.success) {
          this.reservationInfo = result.data
        } else {
          throw new Error(result.message || '加载失败')
        }
      } catch (error) {
        console.error('加载预约详情失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'error'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 取消预约
     */
    cancelReservation() {
      this.showCancelModal = true
    },

    /**
     * 确认取消预约
     */
    async confirmCancel() {
      try {
        this.isCancelling = true
        
        const result = await api.venue.cancelReservation(this.reservationId)
        
        if (result && result.success) {
          uni.showToast({
            title: '取消成功',
            icon: 'success'
          })
          
          this.closeCancelModal()
          await this.loadReservationDetail()
        } else {
          throw new Error(result.message || '取消失败')
        }
      } catch (error) {
        console.error('取消预约失败:', error)
        uni.showToast({
          title: error.message || '取消失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isCancelling = false
      }
    },

    /**
     * 重新预约
     */
    rescheduleReservation() {
      if (this.reservationInfo) {
        uni.navigateTo({
          url: `/pages/reservation/reservation?venueType=${this.reservationInfo.venueType || 'all'}`
        })
      }
    },

    /**
     * 联系场地
     */
    contactVenue() {
      if (this.reservationInfo && this.reservationInfo.venuePhone) {
        uni.makePhoneCall({
          phoneNumber: this.reservationInfo.venuePhone
        })
      } else {
        uni.showToast({
          title: '暂无联系方式',
          icon: 'none'
        })
      }
    },

    /**
     * 关闭取消弹窗
     */
    closeCancelModal() {
      this.showCancelModal = false
      this.cancelReason = ''
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      try {
        return this.$formatDate(dateStr)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知'
      try {
        return this.$formatDateTime(dateTimeStr)
      } catch (error) {
        console.error('日期时间格式化错误:', error)
        return '未知'
      }
    },

    /**
     * 获取状态样式类
     */
    getStatusClass(status) {
      return `status-${status}`
    },

    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
      const iconMap = {
        'pending': '⏳',
        'confirmed': '✅',
        'rejected': '❌',
        'cancelled': '🚫',
        'completed': '🎉'
      }
      return iconMap[status] || '❓'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'rejected': '已拒绝',
        'cancelled': '已取消',
        'completed': '已完成'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取状态描述
     */
    getStatusDesc(status) {
      const descMap = {
        'pending': '等待管理员审批',
        'confirmed': '预约已确认，请按时使用',
        'rejected': '预约被拒绝，请联系管理员',
        'cancelled': '预约已取消',
        'completed': '预约已完成'
      }
      return descMap[status] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.reservation-detail-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 30rpx 30rpx;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

.back-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
}

.header-placeholder {
  width: 60rpx;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #666;
}

/* 预约内容 */
.reservation-content {
  padding: 0 30rpx 30rpx;
}

/* 状态卡片 */
.status-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: -20rpx -30rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.status-pending {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-left: 6rpx solid #f39c12;
}

.status-confirmed {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left: 6rpx solid #27ae60;
}

.status-rejected {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-left: 6rpx solid #e74c3c;
}

.status-cancelled {
  background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
  border-left: 6rpx solid #6c757d;
}

.status-completed {
  background: linear-gradient(135deg, #cce5ff 0%, #b3d9ff 100%);
  border-left: 6rpx solid #007bff;
}

.status-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.status-info {
  flex: 1;
}

.status-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 24rpx;
  color: #666;
}

/* 信息区域 */
.info-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.info-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.info-value.price {
  color: #e74c3c;
  font-weight: bold;
}

/* 参与人员列表 */
.participants-list {
  flex: 1;
  text-align: right;
}

.participant-item {
  display: block;
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  padding: 8rpx 12rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.participant-item:last-child {
  margin-bottom: 0;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 200rpx;
  height: 88rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 100rpx 40rpx;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.error-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 26rpx;
}

/* 取消弹窗 */
.cancel-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 30rpx;
}

.modal-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  text-align: center;
}

.modal-warning {
  display: block;
  font-size: 24rpx;
  color: #e74c3c;
  margin-bottom: 30rpx;
  text-align: center;
}

.cancel-reason {
  margin-top: 30rpx;
}

.reason-label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.reason-input {
  width: 100%;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  height: 120rpx;
  resize: none;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
}

.btn-secondary,
.btn-danger {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2rpx solid #dee2e6;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-secondary:active,
.btn-danger:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .action-section {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: auto;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
    width: auto;
    margin-bottom: 8rpx;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>
