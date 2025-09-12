<template>
  <view class="order-tab">
    <!-- 报餐表单 -->
    <view class="order-form-card">
      <view class="form-header">
        <text class="form-title">部门报餐</text>
        <text class="form-desc">为部门成员批量报餐</text>
      </view>

      <view class="form-content">
        <!-- 日期选择 -->
        <view class="form-field">
          <text class="field-label">报餐日期</text>
          <picker mode="date" :value="orderForm.date" @change="onDateChange">
            <view class="picker-content">
              <text class="picker-icon">📅</text>
              <text class="picker-text">{{ orderForm.date || '请选择日期' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 餐次选择 -->
        <view class="form-field">
          <text class="field-label">餐次</text>
          <picker :value="mealTypeIndex" :range="mealTypeOptions" @change="onMealTypeChange">
            <view class="picker-content">
              <text class="picker-icon">🍽️</text>
              <text class="picker-text">{{ orderForm.mealType || '请选择餐次' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 备注 -->
        <view class="form-field">
          <text class="field-label">备注</text>
          <textarea
            class="textarea-input"
            v-model="orderForm.remark"
            placeholder="请输入备注信息（可选）"
            maxlength="200"
          />
        </view>
      </view>
    </view>

    <!-- 成员选择区域 -->
    <view class="member-selection-card">
      <view class="selection-header">
        <text class="selection-title">选择成员</text>
        <text class="selection-count">已选择 {{ selectedMembers.length }} 人</text>
      </view>

      <!-- 搜索和筛选 -->
      <view class="search-filter-section">
        <view class="search-box">
          <input
            class="search-input"
            v-model="memberSearchText"
            placeholder="搜索成员姓名或部门..."
            @input="onSearchInput"
          />
          <text class="search-icon">🔍</text>
        </view>

        <view class="filter-tabs">
          <view
            class="filter-tab"
            :class="{ active: currentRoleFilter === 'all' }"
            @click="selectRoleFilter('all')"
          >
            <text class="filter-text">全部</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: currentRoleFilter === role.value }"
            v-for="role in roleOptions"
            :key="role.value"
            @click="selectRoleFilter(role.value)"
          >
            <text class="filter-text">{{ role.label }}</text>
          </view>
        </view>
      </view>

      <!-- 快速操作 -->
      <view class="quick-actions">
        <button class="action-btn secondary" @click="selectAll">
          <text class="btn-icon">✅</text>
          <text class="btn-text">全选</text>
        </button>
        <button class="action-btn secondary" @click="select否ne">
          <text class="btn-icon">❌</text>
          <text class="btn-text">清空</text>
        </button>
        <button class="action-btn primary" @click="selectCurrent">
          <text class="btn-icon">👥</text>
          <text class="btn-text">选择当前显示</text>
        </button>
      </view>

      <!-- 成员列表 -->
      <view class="member-list" :style="{ height: memberListHeight }">
        <view
          class="member-item"
          v-for="member in filteredMembers"
          :key="member._id"
          :class="{ selected: selectedMembers.includes(member._id) }"
          @click="toggleMember(member._id)"
        >
          <view class="member-checkbox">
            <text class="checkbox-icon">{{ selectedMembers.includes(member._id) ? '☑️' : '☐' }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ member.role }}</text>
            <text class="member-dept">{{ member.department }}</text>
          </view>
        </view>
      </view>

      <!-- 已选成员预览 -->
      <view class="selected-preview" v-if="selectedMembers.length > 0">
        <view class="preview-header" @click="togglePreview">
          <text class="preview-title">已选成员 ({{ selectedMembers.length }}人)</text>
          <text class="preview-arrow">{{ isPreviewExpanded ? '▲' : '▼' }}</text>
        </view>
        <view class="preview-content" v-if="isPreviewExpanded">
          <view class="preview-list">
            <view
              class="preview-item"
              v-for="member in selectedMemberDetails"
              :key="member._id"
            >
              <text class="preview-name">{{ member.name }}</text>
              <text class="preview-role">{{ member.role }}</text>
              <button class="remove-btn" @click.stop="removeMember(member._id)">
                <text class="remove-icon">×</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ disabled: !can提交 }"
        :loading="is提交ting"
        @click="submitOrder"
      >
        <text class="submit-icon">🍽️</text>
        <text class="submit-text">
          {{ is提交ting ? '提交中...' : `提交报餐 (${selectedMembers.length}人)` }}
        </text>
      </button>
    </view>
  </view>
</template>

<script>
import { debounce } from '@/utils/debounce.js'

export default {
  name: 'OrderTab',
  props: {
    deptMembers: {
      type: Array,
      default: () => []
    },
    selectedMembers: {
      type: Array,
      default: () => []
    },
    orderForm: {
      type: Object,
      required: true
    },
    is提交ting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      memberSearchText: '',
      currentRoleFilter: 'all',
      isPreviewExpanded: false,
      memberPageSize: 20,
      memberCurrentPage: 1,
      hasMoreMembers: false
    }
  },
  computed: {
    mealTypeOptions() {
      return ['早餐', '午餐', '晚餐']
    },

    mealTypeIndex() {
      return this.mealTypeOptions.findIndex(meal => meal === this.orderForm.mealType)
    },

    roleOptions() {
      return [
        { label: '全部', value: 'all' },
        { label: '员工', value: '员工' },
        { label: '部门管理员', value: '部门管理员' },
        { label: '其他', value: 'other' }
      ]
    },

    filteredMembers() {
      let members = this.deptMembers || []
      
      // 角色筛选
      if (this.currentRoleFilter !== 'all') {
        if (this.currentRoleFilter === 'other') {
          members = members.filter(member => 
            member.role !== '员工' && member.role !== '部门管理员'
          )
        } else {
          members = members.filter(member => member.role === this.currentRoleFilter)
        }
      }
      
      // 搜索筛选
      if (this.memberSearchText.trim()) {
        const searchText = this.memberSearchText.trim().toLowerCase()
        members = members.filter(member => 
          member.name.toLowerCase().includes(searchText) ||
          (member.department && member.department.toLowerCase().includes(searchText))
        )
      }
      
      return members
    },

    memberListHeight() {
      const memberCount = this.filteredMembers.length
      if (memberCount === 0) return '200rpx'
      if (memberCount <= 3) return '300rpx'
      if (memberCount <= 6) return '400rpx'
      return '500rpx'
    },

    selectedMemberDetails() {
      const members = this.deptMembers || []
      return this.selectedMembers.map(id => 
        members.find(member => member._id === id)
      ).filter(Boolean)
    },

    can提交() {
      return this.selectedMembers.length > 0 && 
             this.orderForm.date && 
             this.orderForm.mealType && 
             !this.is提交ting
    }
  },
  methods: {
    onDateChange(e) {
      this.$emit('date-change', e.detail.value)
    },

    onMealTypeChange(e) {
      this.$emit('meal-type-change', this.mealTypeOptions[e.detail.value])
    },

    onSearchInput: debounce(function() {
      // 搜索防抖处理
    }, 300),

    selectRoleFilter(role) {
      this.currentRoleFilter = role
    },

    selectAll() {
      this.$emit('select-all')
    },

    select否ne() {
      this.$emit('select-none')
    },

    selectCurrent() {
      this.$emit('select-current', this.filteredMembers.map(member => member._id))
    },

    toggleMember(memberId) {
      this.$emit('toggle-member', memberId)
    },

    removeMember(memberId) {
      this.$emit('remove-member', memberId)
    },

    togglePreview() {
      this.isPreviewExpanded = !this.isPreviewExpanded
    },

    submitOrder() {
      if (this.can提交) {
        this.$emit('submit-order')
      }
    }
  }
}
</script>

<style scoped>
.order-tab {
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.order-form-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.form-header {
  margin-bottom: 30rpx;
}

.form-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}

.form-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.picker-content {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.picker-content:active {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.picker-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.picker-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

.textarea-input {
  width: 100%;
  min-height: 120rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  resize: none;
}

.textarea-input:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.member-selection-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.selection-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.selection-count {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.search-filter-section {
  margin-bottom: 24rpx;
}

.search-box {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 60rpx 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.search-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #999;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 12rpx 24rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: #667eea;
  color: #fff;
}

.filter-text {
  font-size: 24rpx;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: #667eea;
  color: #fff;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #333;
  border: 2rpx solid #e9ecef;
}

.action-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.btn-text {
  font-size: 24rpx;
}

.member-list {
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  overflow-y: auto;
  background: #f8f9fa;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.member-item:last-child {
  border-bottom: none;
}

.member-item.selected {
  background: rgba(102, 126, 234, 0.1);
}

.member-item:active {
  background: rgba(102, 126, 234, 0.2);
}

.member-checkbox {
  margin-right: 20rpx;
}

.checkbox-icon {
  font-size: 32rpx;
  color: #667eea;
}

.member-info {
  flex: 1;
}

.member-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
}

.member-role {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 2rpx;
}

.member-dept {
  display: block;
  font-size: 20rpx;
  color: #999;
}

.selected-preview {
  margin-top: 24rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  cursor: pointer;
}

.preview-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.preview-arrow {
  font-size: 24rpx;
  color: #666;
}

.preview-content {
  background: #fff;
}

.preview-list {
  display: flex;
  flex-direction: column;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-name {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  margin-right: 12rpx;
}

.preview-role {
  font-size: 20rpx;
  color: #666;
  margin-right: 12rpx;
}

.remove-btn {
  width: 40rpx;
  height: 40rpx;
  background: #ff4757;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:active {
  transform: scale(0.9);
}

.remove-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.submit-section {
  padding: 20rpx 0;
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.submit-btn.disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.submit-text {
  font-size: 28rpx;
  font-weight: 600;
}
</style>
