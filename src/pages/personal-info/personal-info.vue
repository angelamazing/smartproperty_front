<template>
  <view class="personal-info-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-btn" @click="goBack">
          <text class="btn-icon">←</text>
        </button>
        <view class="title-section">
          <text class="page-title">个人信息</text>
          <text class="page-subtitle">管理您的个人资料</text>
        </view>
        <button class="edit-btn" @click="toggle编辑Mode" :disabled="saving">
          <text class="btn-icon">{{ isEditMode ? '💾' : '✏️' }}</text>
          <text>{{ saving ? '保存中...' : (isEditMode ? '保存' : '编辑') }}</text>
        </button>
      </view>
    </view>

    <!-- 用户头像区域 -->
    <view class="avatar-section">
      <view class="avatar-container">
        <UserAvatar
          :user="userInfo"
          size="medium"
        />
        <view class="avatar-badge" v-if="userInfo.status === 'active'">
          <text class="badge-icon">✓</text>
        </view>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.nickName || userInfo.realName || '未设置姓名' }}</text>
        <text class="user-role">{{ userRoleName }}</text>
        <view class="user-status" :class="userInfo.status">
          <text class="status-icon">{{ userInfo.status === 'active' ? '🟢' : '🔴' }}</text>
          <text class="status-text">{{ userInfo.status === 'active' ? 'normal' : '禁用' }}</text>
        </view>
      </view>
    </view>

    <!-- 信息表单 -->
    <view class="info-form">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-icon">👤</text>
          <text class="section-title">基本信息</text>
        </view>
        
                 <view class="form-item">
           <text class="item-label">真实姓名</text>
           <input 
             v-if="isEditMode"
             class="item-input"
             v-model="editData.nickName"
             placeholder="请输入真实姓名"
             maxlength="20"
           />
           <text v-else class="item-value">{{ userInfo.nickName || '未设置' }}</text>
         </view>

        <view class="form-item">
          <text class="item-label">手机号码</text>
          <input 
            v-if="isEditMode"
            class="item-input"
            v-model="editData.phoneNumber"
            placeholder="请输入手机号码"
            type="number"
            maxlength="11"
          />
          <text v-else class="item-value">{{ userInfo.phoneNumber || '未设置' }}</text>
        </view>

        <view class="form-item">
          <text class="item-label">邮箱地址</text>
          <input 
            v-if="isEditMode"
            class="item-input"
            v-model="editData.email"
            placeholder="请输入邮箱地址"
            type="email"
          />
          <text v-else class="item-value">{{ userInfo.email || '未设置' }}</text>
        </view>

        <view class="form-item">
          <text class="item-label">性别</text>
          <view v-if="isEditMode" class="gender-selector">
            <view 
              v-for="(option, index) in genderOptions" 
              :key="index"
              class="gender-option"
              :class="{ active: editData.gender === index }"
              @click="selectGender(index)"
            >
              <text>{{ option }}</text>
            </view>
          </view>
          <text v-else class="item-value">{{ genderOptions[userInfo.gender] || '未设置' }}</text>
        </view>
      </view>

      <!-- 工作信息 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-icon">💼</text>
          <text class="section-title">工作信息</text>
        </view>
        
                 <view class="form-item">
           <text class="item-label">所属部门</text>
           <text class="item-value">{{ userInfo.department || '未设置' }}</text>
         </view>

        <view class="form-item">
          <text class="item-label">职位</text>
          <input 
            v-if="isEditMode"
            class="item-input"
            v-model="editData.position"
            placeholder="请输入职位"
            maxlength="30"
          />
          <text v-else class="item-value">{{ userInfo.position || '未设置' }}</text>
        </view>

        <view class="form-item">
          <text class="item-label">工号</text>
          <input 
            v-if="isEditMode"
            class="item-input"
            v-model="editData.employeeId"
            placeholder="请输入工号"
            maxlength="20"
          />
          <text v-else class="item-value">{{ userInfo.employeeId || '未设置' }}</text>
        </view>

        <view class="form-item">
          <text class="item-label">入职时间</text>
          <view v-if="isEditMode" class="date-input-group">
            <input 
              class="date-input-text"
              v-model="editData.joinDate" 
              placeholder="请输入日期，格式：2025-01-27"
              @input="validateJoinDate"
              @blur="formatJoinDate"
            />
            <text class="date-hint">格式：YYYY-MM-DD</text>
          </view>
          <text v-else class="item-value">{{ userInfo.joinDate || '未设置' }}</text>
        </view>
      </view>

      <!-- 账户信息 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-icon">🔐</text>
          <text class="section-title">账户信息</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">用户角色</text>
          <text class="item-value">{{ userRoleName }}</text>
        </view>

        <view class="form-item">
          <text class="item-label">账户状态</text>
          <view class="status-badge" :class="userInfo.status">
            <text>{{ userInfo.status === 'active' ? 'normal' : '禁用' }}</text>
          </view>
        </view>

                 <view class="form-item">
           <text class="item-label">注册时间</text>
           <text class="item-value">{{ formatDate(userInfo.createTime) }}</text>
         </view>

         <view class="form-item">
           <text class="item-label">最后登录</text>
           <text class="item-value">{{ formatDate(userInfo.lastLoginTime) }}</text>
         </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view v-if="isEditMode" class="action-buttons">
      <button class="cancel-btn" @click="cancel编辑">
        <text class="btn-icon">✕</text>
        <text>取消</text>
      </button>
      <button class="save-btn" @click="saveChanges" :disabled="saving">
        <text class="btn-icon" v-if="!saving">💾</text>
        <text class="btn-icon spinning" v-else>⏳</text>
        <text>{{ saving ? '保存中...' : '保存' }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
  import UserAvatar from '@/components/UserAvatar.vue'

export default {
  name: 'PersonalInfo',
  components: {
    UserAvatar
  },
  data() {
    return {
      isEditMode: false,
      saving: false,
      userInfo: {},
      editData: {},
      genderOptions: ['男', '女']
    }
  },
  computed: {
         userRoleName() {
       // 根据角色代码返回对应的中文名称
       const roleMap = {
         'user': '普通用户',
         'dept_admin': '部门管理员',
         'sys_admin': '系统管理员'
       }
       
       // 处理角色字段，可能是字符串或数组
       let role = this.userInfo.role
       
       // 如果是数组，取第一个非调试角色
       if (Array.isArray(role)) {
         role = role.find(r => r !== 'debug' && r !== '调试' && r !== 'test')
       }
       
       // 如果是字符串，检查是否包含调试相关词汇
       if (typeof role === 'string') {
         // 如果包含调试相关词汇，替换为普通用户
         if (role.includes('调试') || role.includes('debug') || role.includes('test')) {
           role = 'user'
         }
       }
       
       return roleMap[role] || '普通用户'
     }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        const response = await api.user.getInfo()
        if (response.success) {
          this.userInfo = response.data
          this.editData = { ...response.data }
        } else {
          this.show错误('加载用户信息失败')
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.show错误('加载用户信息失败')
      }
    },

    toggle编辑Mode() {
      if (this.isEditMode) {
        this.saveChanges()
      } else {
        this.isEditMode = true
        this.editData = { ...this.userInfo }
      }
    },

    selectGender(index) {
      this.editData.gender = index
    },

    onJoinDateChange(e) {
      this.editData.joinDate = e.detail.value
    },

    /**
     * 验证入职日期格式
     */
    validateJoinDate(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和连字符
      const cleaned = value.replace(/[^\d-]/g, '')
      if (cleaned !== value) {
        this.editData.joinDate = cleaned
      }
    },

    /**
     * 格式化入职日期
     */
    formatJoinDate() {
      const date = this.editData.joinDate
      if (date && date.length === 8 && !date.includes('-')) {
        // 如果是8位数字，格式化为YYYY-MM-DD
        this.editData.joinDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      }
      
      // 验证日期格式
      if (this.editData.joinDate && !this.isValidDate(this.editData.joinDate)) {
        uni.showToast({
          title: '请输入正确的日期格式',
          icon: 'none'
        })
        return
      }
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
    },

    cancel编辑() {
      this.isEditMode = false
      this.editData = { ...this.userInfo }
    },

         async saveChanges() {
       if (!this.editData.nickName?.trim()) {
         this.show错误('请输入真实姓名')
         return
       }

       if (!this.editData.phoneNumber?.trim()) {
         this.show错误('请输入手机号码')
         return
       }

      this.saving = true
      try {
                 const response = await api.user.updateProfile({
           nickName: this.editData.nickName,
           phoneNumber: this.editData.phoneNumber,
           email: this.editData.email,
           gender: this.editData.gender,
           position: this.editData.position,
           employeeId: this.editData.employeeId,
           joinDate: this.editData.joinDate
         })
        if (response.success) {
          this.show成功('保存成功')
          this.userInfo = { ...this.editData }
          this.isEditMode = false
        } else {
          this.show错误(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        this.show错误('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },

    // changeAvatar method removed - avatar functionality simplified

    async uploadAvatar(filePath) {
      // 头像功能已简化，不再需要上传
      uni.showToast({
        title: '头像功能已简化，使用默认头像',
        icon: 'none'
      })
    },
    
    /**
     * 更新用户头像 - 已禁用
     */
      async updateUserAvatar(avatarUrl) {
      // 头像功能已简化，不再需要更新
      console.log('头像功能已简化，使用静态头像')
    },



    formatDate(dateString) {
      if (!dateString) return '未设置'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateString)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未设置'
      }
    },

    goBack() {
      uni.navigateBack()
    },

    show成功(message) {
      uni.showToast({
        title: message,
        icon: 'success'
      })
    },

    show错误(message) {
      uni.showToast({
        title: message,
        icon: 'error'
      })
    },
     // debug用户信息 method removed - debug functionality simplified
  }
}
</script>

<style lang="scss" scoped>
.personal-info-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32rpx 24rpx 24rpx;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.back-btn {
  width: 48rpx;
  height: 48rpx;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.title-section {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
  display: block;
}

.page-subtitle {
  font-size: 20rpx;
  opacity: 0.8;
  display: block;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.edit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 18rpx;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-section {
  background: white;
  padding: 32rpx 24rpx;
  text-align: center;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border-radius: 12rpx;
  margin: 16rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 24rpx;
  height: 24rpx;
  background: #52c41a;
  border: 2rpx solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  font-size: 12rpx;
  color: white;
  font-weight: bold;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
  display: block;
}

.user-role {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  width: fit-content;
}

.user-status.active {
  background: #f6ffed;
  color: #52c41a;
}

.user-status.inactive {
  background: #fff2f0;
  color: #ff4d4f;
}

.status-icon {
  font-size: 16rpx;
}

.status-text {
  font-weight: 500;
}

/* 移除重复样式 */

.info-form {
  padding: 0 16rpx;
}

.form-section {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-icon {
  font-size: 24rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f8f9fa;
}

.form-item:last-child {
  border-bottom: none;
}

.item-label {
  width: 160rpx;
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
  font-weight: 500;
}

.item-input {
  flex: 1;
  width: 100%;
  padding: 16rpx 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
  background: #ffffff;
  min-height: 48rpx;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.item-input:focus {
  border-color: #007aff;
  background: #f8f9ff;
  outline: none;
}

.item-value {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  padding: 16rpx 0;
}

.gender-selector {
  display: flex;
  gap: 12rpx;
}

.gender-option {
  padding: 12rpx 24rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.gender-option:hover {
  border-color: #007aff;
  color: #007aff;
}

.gender-option.active {
  border-color: #007aff;
  background: #007aff;
  color: white;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #ffffff;
  cursor: pointer;
}

.picker-icon {
  font-size: 28rpx;
  color: #667eea;
}

/* 日期输入组样式 */
.date-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 手写输入框样式 */
.date-input-text {
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

.date-input-text:focus {
  border-color: #007aff;
  background: #f8f9ff;
  outline: none;
}

.date-input-text::placeholder {
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

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
}

.status-badge.active {
  background: #52c41a;
}

.status-badge.inactive {
  background: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 16rpx;
  background: white;
  margin: 16rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 16rpx 20rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-height: 48rpx;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e9ecef;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2rpx 4rpx rgba(102, 126, 234, 0.2);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 8rpx rgba(102, 126, 234, 0.3);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

  /* Debug button styles removed - functionality simplified */
</style>
