<template>
  <view class="special-reservation-container">
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
      <text class="title-text">特殊预约报餐</text>
      <text class="subtitle-text">Special Reservation Dining</text>
    </view>

    <!-- 预约表单 -->
    <view class="reservation-form">
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <text class="form-label">预约人姓名</text>
          <input 
            class="form-input" 
            type="text" 
            placeholder="请输入姓名" 
            v-model="formData.name"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入手机号" 
            maxlength="11"
            v-model="formData.phone"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">所属部门</text>
          <picker 
            class="form-picker" 
            :range="departments" 
            @change="on部门Change"
          >
            <view class="picker-text">
              {{ formData.department || '请选择部门' }}
            </view>
          </picker>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">预约信息</text>
        
        <view class="form-item">
          <text class="form-label">预约日期</text>
          <picker 
            class="form-picker" 
            mode="date" 
            :start="today" 
            :end="maxDate"
            @change="onDateChange"
          >
            <view class="picker-text">
              {{ formData.date || '请选择日期' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">用餐时段</text>
          <picker 
            class="form-picker" 
            :range="mealTimes" 
            @change="onMealTimeChange"
          >
            <view class="picker-text">
              {{ formData.mealTime || '请选择用餐时段' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">用餐人数</text>
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入用餐人数" 
            v-model="formData.peopleCount"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">特殊需求</text>
          <textarea 
            class="form-textarea" 
            placeholder="请输入特殊需求说明（如：素食、过敏食材等）" 
            v-model="formData.specialRequirements"
            maxlength="200"
          />
          <text class="char-count">{{ formData.specialRequirements.length }}/200</text>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">菜品选择</text>
        
        <view class="dish-selection">
          <view 
            class="dish-item" 
            v-for="(dish, index) in availableDishes" 
            :key="index"
            :class="{ selected: selectedDishes.includes(dish.id) }"
            @click="toggleDish(dish.id)"
          >
            <view class="dish-icon">🍽️</view>
            <view class="dish-info">
              <text class="dish-name">{{ dish.name }}</text>
              <text class="dish-desc">{{ dish.description }}</text>
            </view>
            <view class="dish-price">¥{{ dish.price }}</view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button 
          class="submit-btn" 
          :disabled="!isFormValid" 
          @click="submitReservation"
          :loading="submitting"
        >
          <text class="btn-icon">📅</text>
          <text class="btn-text">{{ submitting ? '提交中...' : '提交预约' }}</text>
        </button>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-list">
        <view class="action-item" @click="viewMyReservations">
          <view class="action-icon">📝</view>
          <view class="action-text">我的预约</view>
        </view>
        <view class="action-item" @click="view今天Menu">
          <view class="action-icon">📋</view>
          <view class="action-text">今日菜单</view>
        </view>
        <view class="action-item" @click="viewReservationRules">
          <view class="action-icon">📖</view>
          <view class="action-text">预约规则</view>
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

export default {
  name: 'SpecialReservation',
  data() {
    return {
      formData: {
        name: '',
        phone: '',
        department: '',
        date: '',
        mealTime: '',
        peopleCount: '',
        specialRequirements: ''
      },
      departments: ['地质勘查部', '工程部', 'Technology 部门', '行政部', 'Finance 部门', 'HR 部门'],
      mealTimes: ['早餐 (7:00-8:30)', '午餐 (11:30-13:00)', '晚餐 (17:30-19:00)'],
      availableDishes: [
        { id: 1, name: '红烧肉', description: '精选五花肉，肥而不腻', price: 28 },
        { id: 2, name: '清蒸鱼', description: '新鲜草鱼，清淡爽口', price: 32 },
        { id: 3, name: '麻婆豆腐', description: '川菜经典，麻辣鲜香', price: 18 },
        { id: 4, name: '宫保鸡丁', description: '鸡肉嫩滑，花生香脆', price: 26 },
        { id: 5, name: '蒜蓉青菜', description: '时令蔬菜，营养健康', price: 12 },
        { id: 6, name: '紫菜蛋花汤', description: '清淡鲜美，开胃暖身', price: 8 }
      ],
      selectedDishes: [],
      submitting: false
    }
  },
  
  computed: {
    today() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    
    maxDate() {
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 7) // 最多预约7天后
      return maxDate.toISOString().split('T')[0]
    },
    
    isFormValid() {
      return this.formData.name && 
             this.formData.phone && 
             this.formData.department && 
             this.formData.date && 
             this.formData.mealTime && 
             this.formData.peopleCount &&
             this.selectedDishes.length > 0
    }
  },
  
  methods: {
    on部门Change(e) {
      this.formData.department = this.departments[e.detail.value]
    },
    
    onDateChange(e) {
      this.formData.date = e.detail.value
    },
    
    onMealTimeChange(e) {
      this.formData.mealTime = this.mealTimes[e.detail.value]
    },
    
    toggleDish(dishId) {
      const index = this.selectedDishes.indexOf(dishId)
      if (index > -1) {
        this.selectedDishes.splice(index, 1)
      } else {
        this.selectedDishes.push(dishId)
      }
    },
    
    async submitReservation() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请完善预约信息',
          icon: 'none'
        })
        return
      }
      
      this.submitting = true
      
      try {
        // 构建预约数据
        const reservationData = {
          name: this.formData.name,
          phone: this.formData.phone,
          department: this.formData.department,
          date: this.formData.date,
          mealTime: this.formData.mealTime,
          peopleCount: parseInt(this.formData.peopleCount),
          specialRequirements: this.formData.specialRequirements,
          selectedDishes: this.selectedDishes,
          totalAmount: this.calculateTotal()
        }
        
        // 调用REST API提交预约
        const result = await api.reservation.submit(reservationData)
        
        if (result && result.success) {
          uni.showToast({
            title: '预约提交成功',
            icon: 'success'
          })
          
          // 清空表单
          this.resetForm()
          
          // 延迟跳转
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/dining/dining'
            })
          }, 1500)
          
        } else {
          throw new Error(result.message || '预约提交失败')
        }
        
      } catch (error) {
        console.error('预约提交失败:', error)
        uni.showToast({
          title: error.message || '预约提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },
    
    calculateTotal() {
      return this.selectedDishes.reduce((total, dishId) => {
        const dish = this.availableDishes.find(d => d.id === dishId)
        return total + (dish ? dish.price : 0)
      }, 0)
    },
    
    resetForm() {
      this.formData = {
        name: '',
        phone: '',
        department: '',
        date: '',
        mealTime: '',
        peopleCount: '',
        specialRequirements: ''
      }
      this.selectedDishes = []
    },
    
    viewMyReservations() {
      uni.switchTab({
        url: '/pages/dining/dining'
      })
    },
    
    view今天Menu() {
      uni.switchTab({
        url: '/pages/dining/dining'
      })
    },
    
    viewReservationRules() {
      uni.showModal({
        title: '预约规则',
        content: '1. 特殊预约需提前24小时提交\n2. 用餐人数不超过20人\n3. 特殊需求请详细说明\n4. 预约成功后不可随意取消',
        show取消: false,
        confirmText: '我知道了'
      })
    },
    
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

.special-reservation-container {
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

/* 预约表单 - 使用模板的卡片样式 */
.reservation-form {
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
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

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-picker {
  width: 100%;
  height: 44px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.picker-text {
  line-height: 44px;
  color: #333;
}

.form-textarea {
  width: 100%;
  height: 80px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  resize: none;
}

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

/* 菜品选择 */
.dish-selection {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dish-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.dish-icon {
  font-size: 24px;
  margin-right: 16px;
}

.dish-info {
  flex: 1;
}

.dish-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.dish-desc {
  display: block;
  font-size: 12px;
  color: #666;
}

.dish-price {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

/* 提交按钮 - 使用模板的渐变样式 */
.submit-section {
  margin-top: 30px;
}

.submit-btn {
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

.submit-btn:disabled {
  background: #ccc;
  color: #999;
  box-shadow: none;
}

.submit-btn:not(:disabled):active {
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

/* 响应式适配 */
@media (max-width: 750rpx) {
  .header {
    padding: 15px;
  }
  
  .reservation-form {
    margin: 0 15px 15px;
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
