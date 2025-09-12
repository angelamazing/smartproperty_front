<template>
  <view class="verification-container">
    <!-- 头部 -->
    <view class="header">
      <div class="logo-container">
        <image class="logo-icon" src="/static/logo.png" mode="aspectFit"></image>
        <div class="logo-text">
          <text class="logo-title">湖北地质</text>
          <text class="logo-subtitle">HUBEI GEOLOGY</text>
        </div>
      </div>
      <text class="system-title">智慧物业管理系统</text>
      <text class="system-subtitle">湖北省地质局第三地质大队</text>
    </view>

    <!-- 页面标题 -->
    <view class="page-title">
      <text class="title-text">用餐验证</text>
      <text class="subtitle-text">Dining Verification</text>
    </view>

    <!-- 验证方式选择 -->
    <view class="verification-methods">
      <!-- 1. 出示用餐卡片 -->
      <view class="method-item" @click="showDiningCard">
        <view class="method-icon dining-card">🍽️</view>
        <view class="method-content">
          <text class="method-title">出示用餐卡片</text>
          <text class="method-desc">显示个人报餐状态卡片</text>
        </view>
        <view class="method-arrow">></view>
      </view>
      
      <!-- 2. 扫码验证 -->
      <view class="method-item" @click="showQRScanner">
        <view class="method-icon">📱</view>
        <view class="method-content">
          <text class="method-title">扫码验证</text>
          <text class="method-desc">扫描餐桌二维码验证用餐</text>
        </view>
        <view class="method-arrow">></view>
      </view>
      
      <!-- 3. NFC验证 -->
      <view class="method-item" @click="showNFCVerification">
        <view class="method-icon">📡</view>
        <view class="method-content">
          <text class="method-title">NFC验证</text>
          <text class="method-desc">使用NFC卡片快速验证</text>
        </view>
        <view class="method-arrow">></view>
      </view>
    </view>

    <!-- 用餐卡片显示 -->
    <view class="dining-card-display" v-if="showDiningCardView">
      <view class="card-header">
        <text class="card-title">个人用餐卡片</text>
        <text class="card-subtitle">Personal Dining Card</text>
        <view class="close-btn" @click="hideDiningCard">✕</view>
      </view>
      
      <view class="card-content" v-if="diningStatus">
        <!-- 用户信息 -->
        <view class="user-info">
          <view class="user-avatar">
            <text class="avatar-text">{{ diningStatus.userName.charAt(0) }}</text>
          </view>
          <view class="user-details">
            <text class="user-name">{{ diningStatus.userName }}</text>
            <text class="user-dept">{{ diningStatus.department }}</text>
            <text class="query-date">{{ diningStatus.queryDate }}</text>
          </view>
        </view>
        
        <!-- 报餐状态汇总 -->
        <view class="status-summary">
          <view class="summary-item">
            <text class="summary-label">已报餐</text>
            <text class="summary-value">{{ diningStatus.summary.totalRegistered }}餐</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">总金额</text>
            <text class="summary-value">¥{{ diningStatus.summary.totalAmount }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">已确认</text>
            <text class="summary-value confirmed">{{ diningStatus.summary.confirmedCount }}餐</text>
          </view>
        </view>
        
        <!-- 各餐次详情 -->
        <view class="meal-details">
          <view class="meal-item" v-for="(meal, mealType) in diningStatus.mealStatus" :key="mealType">
            <view class="meal-header">
              <text class="meal-type">{{ getMealTypeName(mealType) }}</text>
              <view class="meal-status" :class="getStatusClass(meal.status)">
                <text class="status-text">{{ meal.statusText }}</text>
              </view>
            </view>
            
            <view class="meal-content" v-if="meal.isRegistered">
              <view class="meal-info">
                <text class="menu-name">{{ meal.menuName }}</text>
                <text class="total-amount">¥{{ meal.totalAmount }}</text>
              </view>
              
              <view class="dishes-list" v-if="meal.dishes && meal.dishes.length > 0">
                <view class="dish-item" v-for="dish in meal.dishes" :key="dish.dishId">
                  <text class="dish-name">{{ dish.dishName }}</text>
                  <text class="dish-price">¥{{ dish.menuPrice }}</text>
                </view>
              </view>
              
              <view class="meal-meta">
                <text class="register-time">报餐时间: {{ $formatTime(meal.registerTime) }}</text>
                <text class="registrant">报餐人: {{ meal.registrantName }}</text>
              </view>
            </view>
            
            <view class="meal-empty" v-else>
              <text class="empty-text">未报餐</text>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-actions">
          <button class="action-btn primary" @click="refreshDiningStatus">
            <text class="btn-icon">🔄</text>
            <text class="btn-text">刷新状态</text>
          </button>
          <button class="action-btn secondary" @click="goToDiningPage">
            <text class="btn-icon">🍽️</text>
            <text class="btn-text">去报餐</text>
          </button>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-state" v-else-if="loadingDiningStatus">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载用餐状态中...</text>
      </view>
      
      <!-- 错误状态 -->
      <view class="error-state" v-else-if="diningStatus错误">
        <text class="error-icon">❌</text>
        <text class="error-text">{{ diningStatus错误 }}</text>
        <button class="retry-btn" @click="loadDiningStatus">重试</button>
      </view>
    </view>

    <!-- 手动输入验证码 -->
    <view class="manual-input" v-if="showManualInputForm">
      <view class="input-section">
        <text class="section-title">输入验证信息</text>
        
        <view class="input-item">
          <text class="input-label">验证码/桌号</text>
          <input 
            class="form-input" 
            type="text" 
            placeholder="请输入验证码或桌号" 
            v-model="verificationCode"
            maxlength="10"
          />
        </view>
        
        <view class="input-item">
          <text class="input-label">用餐人数</text>
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入用餐人数" 
            v-model="diningPeople"
            maxlength="2"
          />
        </view>
        
        <view class="input-item">
          <text class="input-label">备注信息</text>
          <textarea 
            class="form-textarea" 
            placeholder="请输入备注信息（可选）" 
            v-model="remarks"
            maxlength="100"
          />
          <text class="char-count">{{ remarks.length }}/100</text>
        </view>
        
        <button 
          class="verify-btn" 
          :disabled="!isManualInputValid" 
          @click="verifyManually"
          :loading="verifying"
        >
          <text class="btn-icon">✅</text>
          <text class="btn-text">{{ verifying ? '验证中...' : '验证用餐' }}</text>
        </button>
      </view>
    </view>

    <!-- 验证结果 -->
    <view class="verification-result" v-if="verificationResult">
      <view class="result-header">
        <view class="result-icon" :class="verificationResult.success ? 'success' : 'error'">
          {{ verificationResult.success ? '✅' : '❌' }}
        </view>
        <text class="result-title">{{ verificationResult.title }}</text>
      </view>
      
      <view class="result-content">
        <text class="result-message">{{ verificationResult.message }}</text>
        
        <view class="result-details" v-if="verificationResult.details">
          <view class="detail-item" v-for="(detail, key) in verificationResult.details" :key="key">
            <text class="detail-label">{{ detail.label }}:</text>
            <text class="detail-value">{{ detail.value }}</text>
          </view>
        </view>
      </view>
      
      <view class="result-actions">
        <button class="action-btn primary" @click="handleResultAction">
          {{ verificationResult.success ? '完成' : '重试' }}
        </button>
        <button class="action-btn secondary" @click="resetVerification">
          重新验证
        </button>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-list">
        <view class="action-item" @click="viewVerificationHistory">
          <view class="action-icon">📊</view>
          <view class="action-text">验证记录</view>
        </view>
        <view class="action-item" @click="view今天Menu">
          <view class="action-icon">📋</view>
          <view class="action-text">今日菜单</view>
        </view>
        <view class="action-item" @click="viewVerificationRules">
          <view class="action-icon">📖</view>
          <view class="action-text">验证规则</view>
        </view>
        <view class="action-item" @click="contactSupport">
          <view class="action-icon">📞</view>
          <view class="action-text">联系客服</view>
        </view>
      </view>
    </view>
    

  </view>
</template>

<script>
import auth from '@/utils/auth.js'
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'Verification',
  mixins: [timeMixin],
  data() {
    return {
      verificationCode: '',
      diningPeople: '',
      remarks: '',
      showManualInputForm: false,
      verifying: false,
      verificationResult: null,
      // 用餐卡片相关数据
      showDiningCardView: false,
      diningStatus: null,
      loadingDiningStatus: false,
      diningStatus错误: null
    }
  },
  
  computed: {
    isManualInputValid() {
      return this.verificationCode && this.diningPeople
    }
  },
  
  methods: {
    /**
     * 显示用餐卡片
     */
    showDiningCard() {
      this.showDiningCardView = true
      this.loadDiningStatus()
    },
    
    /**
     * 隐藏用餐卡片
     */
    hideDiningCard() {
      this.showDiningCardView = false
      this.diningStatus = null
      this.diningStatus错误 = null
    },
    
    /**
     * 加载个人用餐状态
     */
    async loadDiningStatus() {
      this.loadingDiningStatus = true
      this.diningStatus错误 = null
      
      try {
        const today = this.$getCurrentDate()
        const response = await api.get(`/api/dining/personal-status?date=${today}`)
        
        if (response && response.success) {
          this.diningStatus = response.data
        } else {
          throw new Error(response.message || '获取用餐状态失败')
        }
      } catch (error) {
        console.error('加载用餐状态失败:', error)
        this.diningStatus错误 = error.message || '加载失败，请重试'
      } finally {
        this.loadingDiningStatus = false
      }
    },
    
    /**
     * 刷新用餐状态
     */
    refreshDiningStatus() {
      this.loadDiningStatus()
    },
    
    /**
     * 跳转到报餐页面
     */
    goToDiningPage() {
      uni.switchTab({
        url: '/pages/dining/dining'
      })
    },
    
    /**
     * 获取餐次类型名称
     */
    getMealTypeName(mealType) {
      const typeMap = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐'
      }
      return typeMap[mealType] || mealType
    },
    
    /**
     * 获取状态样式类
     */
    getStatusClass(status) {
      const statusMap = {
        pending: 'status-pending',
        confirmed: 'status-confirmed',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
      }
      return statusMap[status] || 'status-default'
    },
    
    /**
     * 格式化时间
     */
    formatTime(timeString) {
      if (!timeString) return '--'
      return this.$formatTime(timeString, 'MM-DD HH:mm')
    },
    
    /**
     * 显示二维码扫描器
     */
    showQRScanner() {
      // 调用微信扫码API
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res)
          this.handleScanResult(res.result)
        },
        fail: (error) => {
          console.error('扫码失败:', error)
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    /**
     * 显示手动输入表单
     */
    showManualInput() {
      this.showManualInputForm = true
      this.resetVerification()
    },
    
    /**
     * 显示NFC验证
     */
    showNFCVerification() {
      uni.showToast({
        title: 'NFC功能开发中',
        icon: 'none'
      })
    },
    
    /**
     * 处理扫码结果
     */
    handleScanResult(scanResult) {
      // 解析扫码结果
      try {
        const result = this.parseScanResult(scanResult)
        this.verificationCode = result.code
        this.diningPeople = result.people || ''
        this.verifyManually()
      } catch (error) {
        uni.showToast({
          title: '无效的二维码',
          icon: 'none'
        })
      }
    },
    
    /**
     * 解析扫码结果
     */
    parseScanResult(scanResult) {
      // 这里可以根据实际的二维码格式进行解析
      // 示例格式：{"code":"T001","people":4,"table":"A1"}
      try {
        return JSON.parse(scanResult)
      } catch {
        // 如果不是JSON格式，尝试其他解析方式
        if (scanResult.includes('T')) {
          const match = scanResult.match(/T(\d+)/)
          if (match) {
            return { code: match[0] }
          }
        }
        return { code: scanResult }
      }
    },
    
    /**
     * 手动验证
     */
    async verifyManually() {
      if (!this.isManualInputValid) {
        uni.showToast({
          title: '请完善验证信息',
          icon: 'none'
        })
        return
      }
      
      this.verifying = true
      
      try {
        // 调用REST API进行验证
        const verificationData = {
          verificationCode: this.verificationCode,
          diningPeople: parseInt(this.diningPeople),
          remarks: this.remarks,
          verifyTime: this.$getCurrentTimestamp()
        }
        
        const result = await api.verification.verify(verificationData)
        
        if (result && result.success) {
          this.showVerificationResult({
            success: true,
            title: '验证成功',
            message: '用餐验证成功，祝您用餐愉快！',
            details: {
              table: { label: '桌号', value: result.data.table信息.tableName },
              time: { label: '验证时间', value: this.$formatTime(this.$getCurrentTimestamp()) },
              people: { label: '用餐人数', value: this.diningPeople + '人' }
            }
          })
        } else {
          throw new Error(result.message || '验证失败')
        }
        
      } catch (error) {
        console.error('验证失败:', error)
        this.showVerificationResult({
          success: false,
          title: '验证失败',
          message: error.message || '验证失败，请检查信息后重试',
          details: {
            code: { label: '验证码', value: this.verificationCode },
            time: { label: '验证时间', value: this.$formatTime(this.$getCurrentTimestamp()) }
          }
        })
      } finally {
        this.verifying = false
      }
    },
    
    /**
     * 显示验证结果
     */
    showVerificationResult(result) {
      this.verificationResult = result
      this.showManualInputForm = false
    },
    
    /**
     * 处理结果操作
     */
    handleResultAction() {
      if (this.verificationResult.success) {
        // 验证成功，返回首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // 验证失败，重新显示输入表单
        this.showManualInputForm = true
        this.verificationResult = null
      }
    },
    
    /**
     * 重置验证
     */
    resetVerification() {
      this.verificationCode = ''
      this.diningPeople = ''
      this.remarks = ''
      this.verificationResult = null
    },
    
    /**
     * 查看验证记录
     */
    viewVerificationHistory() {
      uni.showToast({
        title: '验证记录功能开发中',
        icon: 'none'
      })
    },
    
    /**
     * 查看今日菜单
     */
    view今天Menu() {
      uni.switchTab({
        url: '/pages/dining/dining'
      })
    },
    
    /**
     * 查看验证规则
     */
    viewVerificationRules() {
      uni.showModal({
        title: '用餐验证规则',
        content: '1. 请在用餐前进行验证\n2. 验证码可通过餐桌二维码获取\n3. 用餐人数需与实际人数一致\n4. 验证成功后请及时用餐',
        show取消: false,
        confirmText: '我知道了'
      })
    },
    
    /**
     * 联系客服
     */
    contactSupport() {
      uni.showModal({
        title: '联系客服',
        content: '客服电话：400-123-4567\n工作时间：周一至周五 9:00-18:00\n或发送邮件至：support@example.com',
        show取消: false,
        confirmText: '我知道了'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 严格按照form/index.html模板的样式设计 */

.verification-container {
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

/* 头部 - 严格按照模板的渐变背景和布局 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.logo-text {
  text-align: left;
}

.logo-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.logo-subtitle {
  display: block;
  font-size: 12px;
  opacity: 0.9;
  color: #fff;
}

.system-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.system-subtitle {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  color: #fff;
}

/* 页面标题 */
.page-title {
  text-align: center;
  padding: 20px;
  background: white;
  margin: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.title-text {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.subtitle-text {
  display: block;
  font-size: 14px;
  color: #666;
}

/* 验证方式选择 */
.verification-methods {
  background: white;
  margin: 0 20px 10px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.method-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-item:last-child {
  border-bottom: none;
}

.method-item:active {
  background: #f8f9fa;
}

.method-icon {
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.method-content {
  flex: 1;
}

.method-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  display: block;
  font-size: 14px;
  color: #666;
}

.method-arrow {
  font-size: 18px;
  color: #999;
  font-weight: 600;
}

/* 手动输入表单 */
.manual-input {
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.input-section {
  margin-bottom: 20px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.input-item {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input {
  height: 44px;
}

.form-textarea {
  height: 80px;
  resize: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 验证按钮 */
.verify-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.verify-btn:disabled {
  background: #ccc;
  color: #999;
  box-shadow: none;
}

.verify-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
}

.btn-text {
  font-size: 16px;
}

/* 验证结果 */
.verification-result {
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.result-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.result-icon.success {
  background: #d4edda;
  color: #155724;
}

.result-icon.error {
  background: #f8d7da;
  color: #721c24;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.result-content {
  margin-bottom: 20px;
}

.result-message {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.result-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 快捷操作 - 使用模板的样式 */
.quick-actions {
  padding: 0 20px 20px;
}

.quick-actions .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: none;
  padding-bottom: 0;
}

.action-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.action-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:active {
  transform: scale(0.98);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.action-icon {
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 8px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
}

.action-text {
  font-size: 12px;
  color: #666;
}

/* 用餐卡片样式 */
.dining-card-display {
  background: white;
  margin: 5px 20px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  position: relative;
  text-align: center;
}

.card-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.card-subtitle {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: rgba(255,255,255,0.3);
  transform: scale(0.95);
}

.card-content {
  padding: 20px;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.avatar-text {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-dept {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.query-date {
  display: block;
  font-size: 12px;
  color: #999;
}

/* 状态汇总 */
.status-summary {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-value.confirmed {
  color: #28a745;
}

/* 餐次详情 */
.meal-details {
  margin-bottom: 20px;
}

.meal-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  border-left: 4px solid #e9ecef;
}

.meal-item:last-child {
  margin-bottom: 0;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.meal-type {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.meal-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-default {
  background: #e9ecef;
  color: #6c757d;
}

.meal-content {
  margin-top: 10px;
}

.meal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.menu-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.total-amount {
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.dishes-list {
  margin-bottom: 10px;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
}

.dish-item:last-child {
  border-bottom: none;
}

.dish-name {
  font-size: 13px;
  color: #666;
}

.dish-price {
  font-size: 13px;
  color: #999;
}

.meal-meta {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.register-time,
.registrant {
  display: block;
  margin-bottom: 2px;
}

.meal-empty {
  text-align: center;
  padding: 20px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 卡片操作按钮 */
.card-actions {
  display: flex;
  gap: 12px;
}

.card-actions .action-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.card-actions .action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.card-actions .action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.card-actions .action-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  margin-right: 6px;
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.error-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  display: block;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.retry-btn:active {
  transform: scale(0.98);
}

/* 用餐卡片图标特殊样式 */
.method-icon.dining-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .header {
    padding: 15px;
  }
  
  .verification-methods {
    margin: 0 15px 8px;
    padding: 15px;
  }
  
  .manual-input,
  .verification-result {
    margin: 0 15px 15px;
    padding: 15px;
  }
  
  .dining-card-display {
    margin: 3px 15px 15px;
    padding: 15px;
  }
  
  .page-title {
    margin: 15px;
    padding: 15px;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
  
  .action-list {
    gap: 10px;
  }
  
  .action-item {
    min-width: 100px;
    padding: 12px;
  }
}
</style>
