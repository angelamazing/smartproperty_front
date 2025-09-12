<template>
  <view class="dept-edit-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">{{ isEdit ? '编辑部门' : '新建部门' }}</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门名称 <text class="required">*</text></text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'name', 'error': formErrors.name }">
                <input 
                  class="input-text"
                  :value="formData.name"
                  @input="handleNameInput"
                  placeholder="请输入部门名称"
                  maxlength="50"
                  @focus="onFieldFocus('name')"
                  @blur="onFieldBlur('name')"
                />
              </view>
              <view class="input-footer">
                <text v-if="formErrors.name" class="error-message">{{ formErrors.name }}</text>
                <text class="char-counter">{{ formData.name.length }}/50</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门编码 <text class="required">*</text></text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'code', 'error': formErrors.code }">
                <input 
                  class="input-text"
                  :value="formData.code"
                  @input="handleCodeInput"
                  placeholder="请输入部门编码"
                  maxlength="20"
                  @focus="onFieldFocus('code')"
                  @blur="onFieldBlur('code')"
                />
              </view>
              <view class="input-footer">
                <text v-if="formErrors.code" class="error-message">{{ formErrors.code }}</text>
                <text class="char-counter">{{ formData.code.length }}/20</text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="input-container">
            <text class="input-label">部门描述</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'description' }">
                <textarea 
                  class="input-textarea"
                  :value="formData.description"
                  @input="handleDescriptionInput"
                  placeholder="请输入部门描述"
                  maxlength="200"
                  @focus="onFieldFocus('description')"
                  @blur="onFieldBlur('description')"
                />
              </view>
              <view class="input-footer">
                <text class="char-counter">{{ formData.description.length }}/200</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">其他信息</text>
        
        <view class="form-item">
          <view class="input-container">
            <text class="input-label">排序值</text>
            <view class="input-field-wrapper">
              <view class="input-field" :class="{ 'focused': focusedField === 'sort' }">
                <input 
                  class="input-text"
                  type="number"
                  :value="formData.sort"
                  @input="handleSortInput"
                  placeholder="请输入排序值"
                  @focus="onFieldFocus('sort')"
                  @blur="onFieldBlur('sort')"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="action-btn cancel-btn" @click="goBack">取消</button>
      <button class="action-btn save-btn" @click="saveDepartment" :disabled="!canSave">保存</button>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'DeptEdit',
  data() {
    return {
      isEdit: false,
      departmentId: null,
      focusedField: null,
      formData: {
        name: '',
        code: '',
        description: '',
        sort: 0
      },
      formErrors: {
        name: '',
        code: ''
      }
    }
  },
  computed: {
    canSave() {
      return this.formData.name.trim() && 
             this.formData.code.trim() && 
             !this.formErrors.name && 
             !this.formErrors.code
    }
  },
  onLoad(options) {
    this.isEdit = options.action === 'edit'
    this.departmentId = options.id
    
    if (this.isEdit && this.departmentId) {
      this.loadDepartmentDetail()
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载部门详情
    async loadDepartmentDetail() {
      try {
        const response = await api.admin.getDepartmentDetail(this.departmentId)
        if (response.success) {
          this.formData = {
            name: response.data.name || '',
            code: response.data.code || '',
            description: response.data.description || '',
            sort: response.data.sort || 0
          }
        }
      } catch (error) {
        console.error('加载部门详情失败:', error)
        uni.showToast({
          title: '加载部门详情失败',
          icon: 'none'
        })
      }
    },
    
    // 字段聚焦
    onFieldFocus(field) {
      this.focusedField = field
    },
    
    // 字段失焦
    onFieldBlur(field) {
      this.focusedField = null
      this.validateField(field)
    },
    
    // 验证字段
    validateField(field) {
      switch (field) {
        case 'name':
          if (!this.formData.name.trim()) {
            this.formErrors.name = '部门名称不能为空'
          } else if (this.formData.name.length < 2) {
            this.formErrors.name = '部门名称至少2个字符'
          } else {
            this.formErrors.name = ''
          }
          break
        case 'code':
          if (!this.formData.code.trim()) {
            this.formErrors.code = '部门编码不能为空'
          } else if (!/^[A-Z_]+$/.test(this.formData.code)) {
            this.formErrors.code = '部门编码只能包含大写字母和下划线'
          } else {
            this.formErrors.code = ''
          }
          break
      }
    },
    
    // 处理名称输入
    handleNameInput(e) {
      this.formData.name = e.detail.value
      this.validateField('name')
    },
    
    // 处理编码输入
    handleCodeInput(e) {
      this.formData.code = e.detail.value.toUpperCase()
      this.validateField('code')
    },
    
    // 处理描述输入
    handleDescriptionInput(e) {
      this.formData.description = e.detail.value
    },
    
    // 处理排序输入
    handleSortInput(e) {
      this.formData.sort = parseInt(e.detail.value) || 0
    },
    
    // 保存部门
    async saveDepartment() {
      if (!this.canSave) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        })
        return
      }
      
      try {
        const data = {
          name: this.formData.name.trim(),
          code: this.formData.code.trim(),
          description: this.formData.description.trim(),
          sort: this.formData.sort
        }
        
        let response
        if (this.isEdit) {
          response = await api.admin.updateDepartment(this.departmentId, data)
        } else {
          response = await api.admin.createDepartment(data)
        }
        
        if (response.success) {
          uni.showToast({
            title: this.isEdit ? '更新部门成功' : '创建部门成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存部门失败:', error)
        uni.showToast({
          title: '保存部门失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.dept-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #667eea;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

.form-container {
  padding: 30rpx;
}

.form-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.input-container {
  width: 100%;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.required {
  color: #ff4757;
}

.input-field-wrapper {
  width: 100%;
}

.input-field {
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.input-field.focused {
  border-color: #667eea;
  background-color: white;
}

.input-field.error {
  border-color: #ff4757;
}

.input-text {
  width: 100%;
  font-size: 28rpx;
  color: #333;
  background: none;
  border: none;
  outline: none;
  box-sizing: border-box;
}

.input-textarea {
  width: 100%;
  min-height: 120rpx;
  font-size: 28rpx;
  color: #333;
  background: none;
  border: none;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.error-message {
  font-size: 24rpx;
  color: #ff4757;
}

.char-counter {
  font-size: 24rpx;
  color: #999;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 30rpx;
  background-color: white;
  border-top: 1rpx solid #e0e0e0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin: 0 10rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.save-btn {
  background-color: #667eea;
  color: white;
}

.save-btn:disabled {
  background-color: #ccc;
  color: #999;
}
</style>