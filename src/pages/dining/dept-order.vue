<template>
  <view class="dept-order-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">部门报餐</text>
      <text class="page-subtitle">{{ department信息.departmentName || '加载中...' }}</text>
      <view class="header-actions">
        <button class="action-btn" @click="goToOverview">
          <text class="btn-icon">📊</text>
          <text>概览</text>
        </button>
        <button class="action-btn" @click="goToStats">
          <text class="btn-icon">📈</text>
          <text>统计</text>
        </button>
      </view>
    </view>

    <!-- 报餐表单 -->
    <view class="order-form">
      <view class="form-section">
        <text class="section-title">报餐信息</text>
        
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">报餐日期</text>
            <picker 
              mode="date" 
              :value="orderForm.date" 
              @change="onDateChange"
              :start="today"
            >
              <view class="picker-input">
                {{ orderForm.date || '请选择日期' }}
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">餐次类型</text>
            <picker 
              :value="mealTypeIndex" 
              :range="mealTypes" 
              range-key="label"
              @change="onMealTypeChange"
            >
              <view class="picker-input">
                {{ mealTypes[mealTypeIndex]?.label || '请选择餐次' }}
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 成员选择 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">选择成员</text>
          <view class="selection-actions">
            <button class="action-btn small" @click="selectAll">全选</button>
            <button class="action-btn small secondary" @click="clearAll">清空</button>
          </view>
        </view>
        
        <view class="members-grid">
          <view 
            v-for="member in departmentMembers" 
            :key="member._id"
            class="member-card"
            :class="{ selected: selectedMembers.includes(member._id) }"
            @click="toggleMember(member._id)"
          >
            <view class="member-avatar">
              <UserAvatar :user="member" size="small" />
            </view>
            
            <view class="member-info">
              <text class="member-name">{{ member.name || member.nickName }}</text>
              <text class="member-role">{{ member.role || '普通用户' }}</text>
              <text class="member-phone">{{ member.phoneNumber || '未设置' }}</text>
            </view>
            
            <view class="member-status">
              <view 
                class="status-indicator" 
                :class="{ active: selectedMembers.includes(member._id) }"
              >
                {{ selectedMembers.includes(member._id) ? '✓' : '' }}
              </view>
            </view>
          </view>
        </view>
        
        <view class="selection-summary">
          <text class="summary-text">已选择 {{ selectedMembers.length }} 人</text>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="form-section">
        <text class="section-title">备注信息</text>
        <textarea 
          class="remark-input" 
          placeholder="请输入备注信息（可选）"
          v-model="orderForm.remark"
          maxlength="200"
        ></textarea>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button 
          class="submit-btn" 
          :disabled="!can提交"
          @click="submitOrder"
        >
          <text class="btn-icon">🍽️</text>
          <text>提交报餐 ({{ selectedMembers.length }}人)</text>
        </button>
      </view>
    </view>

    <!-- 加载提示 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-text">提交中...</text>
      </view>
    </view>
  </view>
</template>

<script>
  import UserAvatar from '@/components/UserAvatar.vue'
import api from '@/utils/api.js'

export default {
  name: 'DeptOrder',
  components: {
    UserAvatar
  },
  data() {
    return {
      department信息: {},
      departmentMembers: [],
      selectedMembers: [],
      orderForm: {
        date: '',
        mealType: 'lunch',
        remark: ''
      },
      mealTypes: [
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' }
      ],
      mealTypeIndex: 1, // 默认选择午餐
      loading: false
    }
  },
  computed: {
    today() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    can提交() {
      return this.orderForm.date && 
             this.orderForm.mealType && 
             this.selectedMembers.length > 0
    }
  },
  mounted() {
    this.initForm()
    this.load部门Data()
  },
  methods: {
    // 初始化表单
    initForm() {
      const today = new Date()
      this.orderForm.date = today.toISOString().split('T')[0]
    },

    // 加载部门数据
    async load部门Data() {
      try {
        this.loading = true
        await Promise.all([
          this.load部门信息(),
          this.load部门Members()
        ])
      } catch (error) {
        console.error('加载部门数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 加载部门信息
    async load部门信息() {
      try {
        // 优先从用户信息中获取部门信息
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.department) {
          this.department信息 = {
            departmentName: userInfo.department,
            departmentId: userInfo.departmentId || null
          }
          console.log('从用户信息获取部门信息:', this.department信息)
          return
        }
        
        // 如果用户信息中没有部门信息，尝试从API获取
        const response = await api.admin.getDeptAdminInfo()
        if (response.success) {
          this.department信息 = response.data
          console.log('从API获取部门信息:', this.department信息)
        } else {
          console.error('获取部门信息失败:', response.message)
          // 设置默认值，避免一直显示"加载中..."
          this.department信息 = {
            departmentName: '未知部门',
            departmentId: null
          }
        }
      } catch (error) {
        console.error('获取部门信息失败:', error)
        // 设置默认值，避免一直显示"加载中..."
        this.department信息 = {
          departmentName: '未知部门',
          departmentId: null
        }
      }
    },

    // 加载部门成员
    async load部门Members() {
      try {
        const response = await api.admin.getDeptMembersForDining()
        if (response.success) {
          this.departmentMembers = response.data || []
          console.log('获取部门成员成功:', this.departmentMembers.length, '人')
        } else {
          console.error('获取部门成员失败:', response.message)
          // 设置空数组，避免页面异常
          this.departmentMembers = []
        }
      } catch (error) {
        console.error('获取部门成员失败:', error)
        // 设置空数组，避免页面异常
        this.departmentMembers = []
      }
    },

    // 日期选择
    onDateChange(e) {
      this.orderForm.date = e.detail.value
    },

    // 餐次类型选择
    onMealTypeChange(e) {
      this.mealTypeIndex = e.detail.value
      this.orderForm.mealType = this.mealTypes[this.mealTypeIndex].value
    },

    // 切换成员选择
    toggleMember(memberId) {
      const index = this.selectedMembers.indexOf(memberId)
      if (index > -1) {
        this.selectedMembers.splice(index, 1)
      } else {
        this.selectedMembers.push(memberId)
      }
    },

    // 全选成员
    selectAll() {
      this.selectedMembers = this.departmentMembers.map(member => member._id)
    },

    // 清空选择
    clearAll() {
      this.selectedMembers = []
    },

    // 提交报餐
    async submitOrder() {
      if (!this.can提交) {
        uni.showToast({
          title: '请完善报餐信息',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: '确认报餐',
        content: `确定要为 ${this.selectedMembers.length} 名成员报餐吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.do提交Order()
          }
        }
      })
    },

    // 执行报餐提交
    async do提交Order() {
      try {
        this.loading = true
        
        const orderData = {
          date: this.orderForm.date,
          mealType: this.orderForm.mealType,
          members: this.selectedMembers.map(userId => ({ userId })),
          remark: this.orderForm.remark
        }

        const response = await api.admin.createDepartmentOrder(orderData)
        
        if (response.success) {
          uni.showToast({
            title: '报餐成功',
            icon: 'success'
          })
          
          // 清空选择
          this.selectedMembers = []
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showModal({
            title: '报餐失败',
            content: response.message || '报餐失败，请重试',
            show取消: false
          })
        }
      } catch (error) {
        console.error('报餐失败:', error)
        
        let errorMessage = '报餐失败，请重试'
        
        // 处理特定错误类型
        if (error.message) {
          if (error.message.includes('权限') || error.message.includes('权限不足')) {
            errorMessage = '权限不足，需要部门管理员及以上权限'
          } else if (error.message.includes('网络') || error.message.includes('timeout')) {
            errorMessage = '网络连接失败，请检查网络设置'
          } else if (error.message.includes('日期')) {
            errorMessage = '日期无效，请重新选择'
          } else if (error.message.includes('成员')) {
            errorMessage = '成员信息有误，请重新选择'
          } else {
            errorMessage = error.message
          }
        }
        
        uni.showModal({
          title: '报餐失败',
          content: errorMessage,
          show取消: false
        })
      } finally {
        this.loading = false
      }
    },

    // 跳转到概览页面
    goToOverview() {
      uni.navigateTo({
        url: '/pages/dining/dept-overview'
      })
    },

    // 跳转到统计页面
    goToStats() {
      uni.navigateTo({
        url: '/pages/dining/dept-stats'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dept-order-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 40rpx;
  text-align: center;
  position: relative;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.selection-actions {
  display: flex;
  gap: 12rpx;
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.picker-input {
  padding: 20rpx 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #333;
  transition: all 0.3s ease;
}

.picker-input:active {
  border-color: #667eea;
  background: white;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.member-card:hover {
  border-color: #667eea;
  background: #f0f2ff;
}

.member-card.selected {
  border-color: #667eea;
  background: #e3f2fd;
}

.member-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.member-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.member-role {
  font-size: 20rpx;
  color: #667eea;
  font-weight: 500;
}

.member-phone {
  font-size: 18rpx;
  color: #666;
}

.member-status {
  flex-shrink: 0;
}

.status-indicator {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: white;
  background: #e9ecef;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #667eea;
  border-color: #667eea;
}

.selection-summary {
  text-align: center;
  padding: 16rpx;
  background: #e3f2fd;
  border-radius: 10rpx;
}

.summary-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.submit-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  background: #6c757d;
  box-shadow: none;
  opacity: 0.6;
}

.submit-btn:not(:disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 32rpx;
}

.action-btn {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  border: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-btn.small {
  padding: 8rpx 16rpx;
  font-size: 20rpx;
}

.action-btn:not(.secondary) {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn:active {
  transform: translateY(1rpx);
}

.remark-input {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  resize: none;
  transition: all 0.3s ease;
}

.remark-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

/* 加载遮罩 */
.loading-overlay {
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
}

.loading-content {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
