<template>
  <view v-if="visible" class="venue-edit-overlay" @click="handleOverlayClick">
    <view class="venue-edit-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ venue ? '编辑场地' : '添加场地' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-content">
        <form class="venue-form">
          <!-- 场地图片 -->
          <view class="form-section">
            <text class="section-title">场地图片</text>
            <view class="image-upload">
              <image 
                v-if="venueData.image" 
                :src="venueData.image" 
                class="venue-preview" 
                mode="aspectFill"
                @click="chooseImage"
              />
              <view v-else class="image-placeholder" @click="chooseImage">
                <text class="upload-icon">📷</text>
                <text class="upload-text">点击上传图片</text>
              </view>
              <button v-if="venueData.image" class="remove-image-btn" @click="removeImage">
                ✕
              </button>
            </view>
          </view>
          
          <!-- 基本信息 -->
          <view class="form-section">
            <text class="section-title">基本信息</text>
            
            <view class="form-group">
              <text class="form-label">场地名称 *</text>
              <input 
                class="form-input" 
                v-model="venueData.name" 
                placeholder="请输入场地名称"
                maxlength="50"
              />
            </view>
            
            <view class="form-group">
              <text class="form-label">场地类型 *</text>
              <picker :range="typeOptions" @change="onTypeChange">
                <view class="form-picker">
                  <text>{{ typeOptions[typeIndex] || '请选择场地类型' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            
            <view class="form-group">
              <text class="form-label">场地描述</text>
              <textarea 
                class="form-textarea" 
                v-model="venueData.description" 
                placeholder="请输入场地描述"
                maxlength="200"
              />
            </view>
            
            <view class="form-group">
              <text class="form-label">场地位置</text>
              <input 
                class="form-input" 
                v-model="venueData.location" 
                placeholder="请输入场地位置"
                maxlength="100"
              />
            </view>
          </view>
          
          <!-- 容量和价格 -->
          <view class="form-section">
            <text class="section-title">容量和价格</text>
            
            <view class="capacity-price-grid">
              <view class="form-group">
                <text class="form-label">容纳人数</text>
                <input 
                  class="form-input" 
                  v-model="venueData.capacity" 
                  placeholder="最大容纳人数"
                  type="number"
                />
              </view>
              
              <view class="form-group">
                <text class="form-label">价格/小时（元）</text>
                <input 
                  class="form-input" 
                  v-model="venueData.pricePerHour" 
                  placeholder="每小时价格"
                  type="digit"
                />
              </view>
            </view>
          </view>
          
          <!-- 设施特色 -->
          <view class="form-section">
            <text class="section-title">设施特色</text>
            
            <view class="features-input">
              <view class="current-features">
                <view 
                  v-for="(feature, index) in venueData.features" 
                  :key="index"
                  class="feature-item"
                >
                  <text>{{ feature }}</text>
                  <button class="remove-feature-btn" @click="removeFeature(index)">✕</button>
                </view>
              </view>
              
              <view class="add-feature">
                <input 
                  class="feature-input" 
                  v-model="newFeature" 
                  placeholder="添加设施特色"
                  @confirm="addFeature"
                />
                <button class="add-feature-btn" @click="addFeature">添加</button>
              </view>
            </view>
            
            <view class="preset-features">
              <text class="preset-label">常用设施：</text>
              <view class="preset-features-list">
                <button 
                  v-for="feature in presetFeatures" 
                  :key="feature"
                  class="preset-feature-btn"
                  @click="addPresetFeature(feature)"
                >
                  {{ feature }}
                </button>
              </view>
            </view>
          </view>
          
          <!-- 营业时间 -->
          <view class="form-section">
            <text class="section-title">营业时间</text>
            
            <view class="time-settings">
              <view class="time-row">
                <text class="time-label">开始时间</text>
                <picker mode="time" :value="venueData.openTime" @change="onOpenTimeChange">
                  <view class="time-picker">
                    <text>{{ venueData.openTime || '08:00' }}</text>
                    <text class="picker-icon">🕐</text>
                  </view>
                </picker>
              </view>
              
              <view class="time-row">
                <text class="time-label">结束时间</text>
                <picker mode="time" :value="venueData.closeTime" @change="onCloseTimeChange">
                  <view class="time-picker">
                    <text>{{ venueData.closeTime || '22:00' }}</text>
                    <text class="picker-icon">🕐</text>
                  </view>
                </picker>
              </view>
            </view>
            
            <view class="working-days">
              <text class="working-days-label">营业日期：</text>
              <checkbox-group @change="onWorkingDaysChange">
                <view class="days-grid">
                  <label v-for="(day, index) in weekDays" :key="index" class="day-item">
                    <checkbox 
                      :value="index.toString()" 
                      :checked="venueData.workingDays.includes(index)"
                    />
                    <text class="day-text">{{ day }}</text>
                  </label>
                </view>
              </checkbox-group>
            </view>
          </view>
          
          <!-- 预约设置 -->
          <view class="form-section">
            <text class="section-title">预约设置</text>
            
            <view class="reservation-settings">
              <view class="form-group">
                <text class="form-label">提前预约天数</text>
                <input 
                  class="form-input" 
                  v-model="venueData.advanceBookingDays" 
                  placeholder="用户可提前几天预约"
                  type="number"
                />
                <text class="form-hint">用户可以提前多少天进行预约</text>
              </view>
              
              <view class="form-group">
                <text class="form-label">最小预约时长（小时）</text>
                <input 
                  class="form-input" 
                  v-model="venueData.minBookingHours" 
                  placeholder="最小预约时长"
                  type="number"
                />
              </view>
              
              <view class="form-group">
                <text class="form-label">最大预约时长（小时）</text>
                <input 
                  class="form-input" 
                  v-model="venueData.maxBookingHours" 
                  placeholder="最大预约时长"
                  type="number"
                />
              </view>
              
              <view class="form-group switch-group">
                <text class="form-label">需要审核</text>
                <switch :checked="venueData.requireApproval" @change="onApprovalChange" />
                <text class="switch-hint">开启后预约需要管理员审核</text>
              </view>
              
              <view class="form-group switch-group">
                <text class="form-label">允许取消</text>
                <switch :checked="venueData.allow取消lation" @change="on取消lationChange" />
                <text class="switch-hint">允许用户取消预约</text>
              </view>
            </view>
          </view>
          
          <!-- 状态设置 -->
          <view class="form-section">
            <text class="section-title">状态设置</text>
            
            <view class="form-group switch-group">
              <text class="form-label">启用状态</text>
              <switch :checked="venueData.status === 'active'" @change="onStatusChange" />
              <text class="switch-hint">{{ venueData.status === 'active' ? '正常开放' : '暂停使用' }}</text>
            </view>
            
            <view class="form-group">
              <text class="form-label">排序权重</text>
              <input 
                class="form-input" 
                v-model="venueData.sort" 
                placeholder="数字越大排序越靠前"
                type="number"
              />
              <text class="form-hint">数字越大，场地显示位置越靠前</text>
            </view>
          </view>
        </form>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="save-btn" @click="saveVenue" :disabled="!isFormValid || saving">
          {{ saving ? '保存中...' : (venue ? '保存' : '创建') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Venue编辑Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    venue: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      venueData: {
        name: '',
        type: '',
        description: '',
        location: '',
        capacity: '',
        pricePerHour: '',
        features: [],
        image: '',
        openTime: '08:00',
        closeTime: '22:00',
        workingDays: [1, 2, 3, 4, 5], // 默认工作日
        advanceBookingDays: 7,
        minBookingHours: 1,
        maxBookingHours: 8,
        requireApproval: false,
        allow取消lation: true,
        status: 'active',
        sort: 0
      },
      typeIndex: 0,
      typeOptions: ['篮球场', '羽毛球场', '乒乓球场', '网球场', '足球场', '会议室', '多功能厅'],
      typeValues: ['basketball', 'badminton', 'pingpong', 'tennis', 'football', 'meeting', 'hall'],
      newFeature: '',
      presetFeatures: ['空调', '照明', '音响', '投影', 'WiFi', '更衣室', '淋浴', '停车场', '饮水机', '储物柜'],
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      saving: false
    }
  },
  computed: {
    isFormValid() {
      return this.venueData.name.trim().length > 0 && this.venueData.type
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    initializeForm() {
      if (this.venue) {
        // 编辑模式
        this.venueData = {
          ...this.venueData,
          ...this.venue,
          features: this.venue.features ? [...this.venue.features] : [],
          workingDays: this.venue.workingDays || [1, 2, 3, 4, 5]
        }
        
        // 设置类型索引
        this.typeIndex = this.typeValues.indexOf(this.venue.type)
        if (this.typeIndex === -1) this.typeIndex = 0
      } else {
        // 新建模式
        this.venueData = {
          name: '',
          type: '',
          description: '',
          location: '',
          capacity: '',
          pricePerHour: '',
          features: [],
          image: '',
          openTime: '08:00',
          closeTime: '22:00',
          workingDays: [1, 2, 3, 4, 5],
          advanceBookingDays: 7,
          minBookingHours: 1,
          maxBookingHours: 8,
          requireApproval: false,
          allow取消lation: true,
          status: 'active',
          sort: 0
        }
        this.typeIndex = 0
      }
    },

    /**
     * 图片相关
     */
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const filePath = res.tempFilePaths[0]
          this.uploadImage(filePath)
        }
      })
    },

    async uploadImage(filePath) {
      try {
        uni.showLoading({ title: '上传中...' })
        
        const response = await api.admin.uploadVenueImage(filePath)
        if (response.success) {
          this.venueData.image = response.data.url
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    removeImage() {
      this.venueData.image = ''
    },

    /**
     * 表单控件事件
     */
    onTypeChange(e) {
      this.typeIndex = e.detail.value
      this.venueData.type = this.typeValues[e.detail.value]
    },

    onOpenTimeChange(e) {
      this.venueData.openTime = e.detail.value
    },

    onCloseTimeChange(e) {
      this.venueData.closeTime = e.detail.value
    },

    onWorkingDaysChange(e) {
      this.venueData.workingDays = e.detail.value.map(day => parseInt(day))
    },

    onApprovalChange(e) {
      this.venueData.requireApproval = e.detail.value
    },

    on取消lationChange(e) {
      this.venueData.allow取消lation = e.detail.value
    },

    onStatusChange(e) {
      this.venueData.status = e.detail.value ? 'active' : 'inactive'
    },

    /**
     * 特色功能管理
     */
    addFeature() {
      const feature = this.newFeature.trim()
      if (feature && !this.venueData.features.includes(feature)) {
        if (this.venueData.features.length >= 10) {
          uni.showToast({
            title: '最多添加10个特色',
            icon: 'none'
          })
          return
        }
        this.venueData.features.push(feature)
        this.newFeature = ''
      }
    },

    removeFeature(index) {
      this.venueData.features.splice(index, 1)
    },

    addPresetFeature(feature) {
      if (!this.venueData.features.includes(feature)) {
        if (this.venueData.features.length >= 10) {
          uni.showToast({
            title: '最多添加10个特色',
            icon: 'none'
          })
          return
        }
        this.venueData.features.push(feature)
      }
    },

    /**
     * 保存场地
     */
    async saveVenue() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写必填项',
          icon: 'error'
        })
        return
      }

      // 验证时间设置
      if (this.venueData.openTime >= this.venueData.closeTime) {
        uni.showToast({
          title: '结束时间必须大于开始时间',
          icon: 'error'
        })
        return
      }

      // 验证预约时长设置
      if (parseInt(this.venueData.minBookingHours) > parseInt(this.venueData.maxBookingHours)) {
        uni.showToast({
          title: '最大预约时长不能小于最小预约时长',
          icon: 'error'
        })
        return
      }

      this.saving = true
      try {
        const saveData = {
          ...this.venueData,
          capacity: parseInt(this.venueData.capacity) || 0,
          pricePerHour: parseFloat(this.venueData.pricePerHour) || 0,
          advanceBookingDays: parseInt(this.venueData.advanceBookingDays) || 7,
          minBookingHours: parseInt(this.venueData.minBookingHours) || 1,
          maxBookingHours: parseInt(this.venueData.maxBookingHours) || 8,
          sort: parseInt(this.venueData.sort) || 0
        }

        let response
        if (this.venue) {
          // 更新场地
          response = await api.admin.updateVenue(this.venue.id, saveData)
        } else {
          // 创建场地
          response = await api.admin.createVenue(saveData)
        }

        if (response.success) {
          uni.showToast({
            title: this.venue ? '更新成功' : '创建成功',
            icon: 'success'
          })
          this.$emit('saved', response.data)
          this.close()
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存场地失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        this.saving = false
      }
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
.venue-edit-overlay {
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

.venue-edit-modal {
  background: white;
  border-radius: 24rpx;
  width: 100%;
  max-width: 900rpx;
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

.venue-form {
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

/* 图片上传 */
.image-upload {
  position: relative;
  width: 300rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx dashed #ddd;
  cursor: pointer;
}

.venue-preview {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #999;
}

.upload-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 24rpx;
}

.remove-image-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 20rpx;
}

/* 表单组件 */
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

.form-picker {
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

/* 容量价格网格 */
.capacity-price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

/* 特色功能管理 */
.features-input {
  margin-bottom: 20rpx;
}

.current-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  background: #667eea;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.remove-feature-btn {
  margin-left: 8rpx;
  background: none;
  border: none;
  color: white;
  font-size: 20rpx;
  padding: 0;
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.3);
}

.add-feature {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.feature-input {
  flex: 1;
  padding: 16rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.add-feature-btn {
  padding: 16rpx 24rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.preset-features {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
}

.preset-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.preset-features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.preset-feature-btn {
  padding: 8rpx 16rpx;
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #666;
}

.preset-feature-btn:active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 时间设置 */
.time-settings {
  margin-bottom: 30rpx;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.time-label {
  font-size: 26rpx;
  color: #333;
  width: 140rpx;
  flex-shrink: 0;
}

.time-picker {
  flex: 1;
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

.picker-icon {
  font-size: 28rpx;
}

/* 工作日设置 */
.working-days {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
}

.working-days-label {
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

/* 预约设置 */
.reservation-settings {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
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
  .venue-edit-overlay {
    padding: 20rpx;
  }
  
  .modal-header,
  .modal-footer {
    padding: 20rpx 30rpx;
  }
  
  .modal-content {
    padding: 0 30rpx;
  }
  
  .capacity-price-grid {
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
  
  .time-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12rpx;
  }
  
  .time-label {
    width: auto;
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
