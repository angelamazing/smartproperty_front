<template>
  <view class="department-selector">
    <!-- H5环境下的自定义选择器 -->
    <view v-if="isH5" class="h5-picker">
      <view 
        v-for="dept in departments" 
        :key="dept._id || dept.id || dept.departmentId"
        class="h5-option"
        :class="{ 
          active: modelValue === (dept._id || dept.id || dept.departmentId),
          'no-selection': !modelValue
        }"
        @click="selectDepartment(dept._id || dept.id || dept.departmentId)"
      >
        <text>{{ dept.name || dept.departmentName }}</text>
        <text v-if="modelValue === (dept._id || dept.id || dept.departmentId)" class="check-icon">✓</text>
      </view>
      
      <!-- 取消选择按钮 -->
      <view 
        v-if="modelValue"
        class="clear-selection-btn"
        @click="clearSelection"
      >
        <text class="clear-icon">✕</text>
        <text>取消选择</text>
      </view>
    </view>
    
    <!-- 非H5环境使用原生picker -->
    <picker v-else :range="departmentNames" @change="onPickerChange">
      <view class="form-picker">
        <text>{{ selectedDapartmentName || '请选择部门' }}</text>
        <text class="picker-arrow">▼</text>
      </view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'DepartmentSelector',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    departments: {
      type: Array,
      default: () => []
    },
    isH5: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    departmentNames() {
      return this.departments.map(dept => dept.name || dept.departmentName)
    },
    
    selectedDapartmentName() {
      const dept = this.departments.find(d => 
        d._id === this.modelValue || 
        d.id === this.modelValue || 
        d.departmentId === this.modelValue
      )
      const deptName = dept ? (dept.name || dept.departmentName) : ''
      console.log('DepartmentSelector - 选中的部门名称:', deptName, 'modelValue:', this.modelValue)
      return deptName
    }
  },
  methods: {
    selectDepartment(departmentId) {
      this.$emit('update:modelValue', departmentId)
    },
    
    clearSelection() {
      this.$emit('update:modelValue', '')
    },
    
    onPickerChange(e) {
      const index = parseInt(e.detail.value)
      const department = this.departments[index]
      if (department) {
        this.$emit('update:modelValue', department.id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.department-selector {
  width: 100%;
}

.h5-picker {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.h5-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80rpx;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
    box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.1);
  }
  
  &:active {
    transform: translateY(1rpx);
  }
  
  &.active {
    border-color: #667eea;
    background: #667eea;
    color: white;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }
  
  &.no-selection {
    color: #999;
    font-style: italic;
  }
  
  text {
    font-size: 28rpx;
    font-weight: 500;
  }
}

.check-icon {
  font-size: 32rpx;
  color: inherit;
}

.clear-selection-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 8rpx;
  background: #f8f9fa;
  color: #666;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8rpx;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:active {
    transform: translateY(1rpx);
  }
}

.clear-icon {
  font-size: 24rpx;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
  }
  
  &:active {
    transform: translateY(1rpx);
  }
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.2s ease;
}

.form-picker:active .picker-arrow {
  transform: rotate(180deg);
}
</style>
