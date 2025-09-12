<template>
  <view v-if="visible" class="user-edit-overlay" @click="handleOverlayClick">
    <view class="user-edit-modal" @click.stop>
      <!-- 模态框头部 -->
      <view class="modal-header">
        <text class="modal-title">{{ isEditMode ? '编辑用户' : '添加用户' }}</text>
        <button class="close-btn" @click="close">✕</button>
      </view>
      
      <view class="modal-content">
        <!-- H5环境提示 -->
        <view v-if="isH5" class="h5-notice">
          <text class="notice-icon">💡</text>
          <text class="notice-text">当前在浏览器环境中，使用自定义选择器以获得最佳体验</text>
        </view>
        
        <!-- 表单内容 -->
        <form class="user-form" @submit.prevent="save用户">
          <!-- 基本信息 -->
          <FormSection title="基本信息">
            <FormField 
              label="真实姓名" 
              required 
              v-model="formData.realName" 
              placeholder="请输入真实姓名"
              maxlength="20"
            />
            
            <FormField 
              label="手机号码" 
              required 
              v-model="formData.phoneNumber" 
              placeholder="请输入手机号码"
              type="number"
              maxlength="11"
            />
            
            <FormField 
              label="邮箱地址" 
              v-model="formData.email" 
              placeholder="请输入邮箱地址"
              type="email"
              maxlength="20"
            />
            
            <FormField label="性别">
              <template #input>
                <GenderSelector 
                  v-model="formData.gender"
                  :options="genderOptions"
                  :is-h5="isH5"
                />
              </template>
            </FormField>
          </FormSection>
          
          <!-- 工作信息 -->
          <FormSection title="工作信息">
            <FormField label="部门">
              <template #input>
                <DepartmentSelector 
                  v-model="formData.departmentId"
                  :departments="departments"
                  :is-h5="isH5"
                />
              </template>
            </FormField>
            
            <FormField 
              label="职位" 
              v-model="formData.position" 
              placeholder="请输入职位"
              maxlength="30"
            />
            
            <FormField 
              label="工号" 
              v-model="formData.employeeId" 
              placeholder="请输入工号"
              maxlength="20"
            />
            
            <FormField label="入职时间">
              <template #input>
                <DatePicker 
                  v-model="formData.joinDate"
                  placeholder="请选择入职时间"
                />
              </template>
            </FormField>
          </FormSection>
          
          <!-- 角色权限 -->
          <FormSection title="角色权限">
            <FormField label="用户角色" required>
              <template #input>
                <RoleSelector 
                  v-model="formData.roleId"
                  :roles="roles"
                  :is-h5="isH5"
                  @role-change="onRoleChange"
                />
              </template>
            </FormField>
            
            <!-- 角色描述 -->
            <view v-if="selectedRole" class="role-info">
              <view class="role-description">
                <text class="role-desc-title">角色说明：</text>
                <text class="role-desc-text">{{ selectedRole.description }}</text>
              </view>
              
              <!-- 权限列表 -->
              <view v-if="selectedRole.permissions?.length" class="permissions-section">
                <text class="permissions-title">权限列表：</text>
                <view class="permissions-list">
                  <view 
                    v-for="permission in selectedRole.permissions" 
                    :key="permission.id"
                    class="permission-item"
                  >
                    <text class="permission-name">{{ permission.name }}</text>
                    <text class="permission-desc">{{ permission.description }}</text>
                  </view>
                </view>
              </view>
            </view>
          </FormSection>
          
          <!-- 账户设置 -->
          <FormSection title="账户设置">
            <FormField label="账户状态">
              <template #input>
                <SwitchField 
                  v-model="formData.status"
                  :active-value="'active'"
                  :inactive-value="'inactive'"
                  active-text="normal"
                  inactive-text="禁用"
                />
              </template>
            </FormField>
            
            <FormField 
              v-if="!isEditMode"
              label="初始密码" 
              v-model="formData.password" 
              placeholder="请输入初始密码（留空使用默认密码）"
              type="password"
            >
              <template #hint>
                <text class="form-hint">如不填写，将使用手机号后6位作为初始密码</text>
              </template>
            </FormField>
            
            <FormField v-if="isEditMode" label="重置密码">
              <template #input>
                <SwitchField 
                  v-model="should重置Password"
                  active-text="将重置为手机号后6位"
                  inactive-text="保持原密码"
                />
              </template>
            </FormField>
          </FormSection>
          
          <!-- 备注信息 -->
          <FormSection title="备注信息">
            <FormField label="备注">
              <template #input>
                <textarea 
                  class="form-textarea" 
                  v-model="formData.remark" 
                  placeholder="请输入备注信息"
                  maxlength="200"
                />
              </template>
            </FormField>
          </FormSection>
        </form>
        
        <!-- 表单状态提示 -->
        <FormStatusHint 
          :is-valid="isFormValid"
          :validation-errors="validation错误s"
          :is-h5="isH5"
        />
      </view>
      
      <!-- 模态框底部 -->
      <view class="modal-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button 
          class="save-btn" 
          :class="{ disabled: !isFormValid || saving }"
          @click="save用户" 
          :disabled="!isFormValid || saving"
        >
          <text v-if="saving" class="loading-text">
            <text class="loading-icon">⏳</text>
            保存中...
          </text>
          <text v-else>
            <text class="btn-icon">{{ isEditMode ? '💾' : '➕' }}</text>
            {{ isEditMode ? '保存' : '创建' }}
          </text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import FormSection from './form/FormSection.vue'
import FormField from './form/FormField.vue'
import GenderSelector from './form/GenderSelector.vue'
import DepartmentSelector from './form/DepartmentSelector.vue'
import RoleSelector from './form/RoleSelector.vue'
import DatePicker from './form/DatePicker.vue'
import SwitchField from './form/SwitchField.vue'
import FormStatusHint from './form/FormStatusHint.vue'

export default {
  name: 'UserEditModal',
  components: {
    FormSection,
    FormField,
    GenderSelector,
    DepartmentSelector,
    RoleSelector,
    DatePicker,
    SwitchField,
    FormStatusHint
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    },
    departments: {
      type: Array,
      default: () => []
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: this.getInitialFormData(),
      genderOptions: ['男', '女'],
      should重置Password: false,
      saving: false,
      isH5: false,
      validation错误s: []
    }
  },
  computed: {
    isEditMode() {
      return !!this.user
    },
    
    selectedRole() {
      return this.roles.find(role => role.id === this.formData.roleId)
    },
    
    isFormValid() {
      return this.validateForm().length === 0
    }
  },
  created() {
    this.detectEnvironment()
  },
  watch: {
    visible(newVal) {
      console.log('用户编辑Modal visible changed:', newVal)
      if (newVal) {
        this.initializeForm()
        this.loadFormData()
      }
    },
    
    user: {
      handler(new用户) {
        console.log('用户编辑Modal user changed:', new用户)
        if (new用户 && this.visible) {
          console.log('用户数据变化，重新初始化表单')
          this.initializeForm()
        }
      },
      immediate: true
    },
    
    departments: {
      handler(newDepts) {
        console.log('用户编辑Modal departments changed:', newDepts)
        // 当部门数据加载完成后，重新初始化表单
        if (newDepts && newDepts.length > 0 && this.isEditMode && this.user) {
          console.log('部门数据已加载，重新初始化表单')
          this.initializeForm()
        }
      },
      deep: true
    },
    
    roles: {
      handler(newRoles) {
        console.log('用户编辑Modal roles changed:', newRoles)
        // 当角色数据加载完成后，重新初始化表单
        if (newRoles && newRoles.length > 0 && this.isEditMode && this.user) {
          console.log('角色数据已加载，重新初始化表单')
          this.initializeForm()
        }
      },
      deep: true
    }
  },
  methods: {
    /**
     * 环境检测
     */
    detectEnvironment() {
      // #ifdef H5
      this.isH5 = true
      // #endif
    },
    
    /**
     * 获取初始表单数据
     */
    getInitialFormData() {
      return {
        realName: '',
        phoneNumber: '',
        email: '',
        gender: 0,
        departmentId: '',
        position: '',
        employeeId: '',
        joinDate: '',
        roleId: '',
        status: 'active',
        password: '',
        remark: ''
      }
    },
    
    /**
     * 初始化表单
     */
    initializeForm() {
      if (this.isEditMode && this.user) {
        // 编辑模式：合并用户数据
        console.log('初始化编辑表单，用户数据:', this.user)
        console.log('用户nickName:', this.user.nickName)
        console.log('用户realName:', this.user.realName)
        console.log('可用部门列表:', this.departments)
        console.log('可用角色列表:', this.roles)
        
        // 根据部门名称找到对应的部门ID
        const user部门Name = this.user.department
        const matched部门 = this.departments.find(dept => 
          dept.name === user部门Name || 
          dept.departmentName === user部门Name
        )
        
        // 根据角色名称找到对应的角色ID
        const userRoleName = this.user.role
        const matchedRole = this.roles.find(role => 
          role.name === userRoleName || 
          role.roleName === userRoleName ||
          role.code === userRoleName
        )
        
        console.log('用户部门名称:', user部门Name)
        console.log('可用部门列表:', this.departments.map(d => ({ id: d._id || d.id, name: d.name })))
        console.log('匹配到的部门:', matched部门)
        console.log('用户角色名称:', userRoleName)
        console.log('可用角色列表:', this.roles.map(r => ({ id: r._id || r.id, name: r.name, code: r.code })))
        console.log('匹配到的角色:', matchedRole)
        
        this.formData = {
          ...this.getInitialFormData(),
          // 映射后端字段到前端表单字段
          realName: this.user.nickName || this.user.realName || '',
          phoneNumber: this.user.phoneNumber || '',
          email: this.user.email || '',
          gender: this.user.gender || 0,
          departmentId: matched部门 ? (matched部门._id || matched部门.id || matched部门.departmentId) : '',
          position: this.user.position || '',
          employeeId: this.user.employeeId || '',
          joinDate: this.user.joinDate || '',
          roleId: matchedRole ? (matchedRole._id || matchedRole.id || matchedRole.roleId) : (this.user.roleId || ''),
          status: this.user.status || 'active',
          password: '',
          remark: this.user.remark || ''
        }
        
        console.log('表单数据初始化完成:', this.formData)
        this.should重置Password = false
      } else {
        // 新建模式：重置表单
        this.formData = this.getInitialFormData()
        this.should重置Password = false
      }
      
      // 清空验证错误
      this.validation错误s = []
    },
    
    /**
     * 加载表单数据
     */
    async loadFormData() {
      try {
        // 如果props中没有数据，则从API加载
        if (this.departments.length === 0 || this.roles.length === 0) {
          const [deptRes, roleRes] = await Promise.all([
            api.admin.getDepartmentsList().catch(() => ({ success: false, data: [] })),
            api.admin.getRolesList().catch(() => ({ success: false, data: [] }))
          ])
          
          if (deptRes.success) {
            this.$emit('departments-loaded', deptRes.data)
          }
          
          if (roleRes.success) {
            this.$emit('roles-loaded', roleRes.data)
          }
        }
      } catch (error) {
        console.error('加载表单数据失败:', error)
        this.show错误('加载数据失败，请重试')
      }
    },
    
    /**
     * 角色选择变化处理
     */
    onRoleChange(roleId) {
      this.formData.roleId = roleId
      this.validation错误s = this.validateForm()
    },
    
    /**
     * 表单验证
     */
    validateForm() {
      const errors = []
      
      // 必填项验证
      if (!this.formData.realName.trim()) {
        errors.push('请输入真实姓名')
      }
      
      if (!this.formData.phoneNumber.trim()) {
        errors.push('请输入手机号码')
      } else if (!this.isValidPhone(this.formData.phoneNumber)) {
        errors.push('请输入正确的手机号')
      }
      
      if (!this.formData.roleId) {
        errors.push('请选择用户角色')
      }
      
      // 邮箱验证（如果填写了的话）
      if (this.formData.email && !this.isValidEmail(this.formData.email)) {
        errors.push('请输入正确的邮箱地址')
      }
      
      return errors
    },
    
    /**
     * 手机号验证
     */
    isValidPhone(phone) {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(phone)
    },
    
    /**
     * 邮箱验证
     */
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    /**
     * 保存用户
     */
    async save用户() {
      // 验证表单
      this.validation错误s = this.validateForm()
      if (this.validation错误s.length > 0) {
        this.show错误('请检查表单填写')
        return
      }
      
      this.saving = true
      try {
        const saveData = this.prepare保存Data()
        
        let response
        if (this.isEditMode) {
          response = await api.admin.updateUser(this.user.id, saveData)
        } else {
          response = await api.admin.createUser(saveData)
        }
        
        if (response.success) {
          this.show成功(this.isEditMode ? '更新成功' : '创建成功')
          this.$emit('saved', response.data)
          this.close()
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存用户失败:', error)
        this.handle保存错误(error)
      } finally {
        this.saving = false
      }
    },
    
    /**
     * 准备保存数据
     */
    prepare保存Data() {
      const saveData = { ...this.formData }
      
      // 字段名映射：前端字段名 -> 后端字段名
      if (saveData.realName) {
        saveData.nickName = saveData.realName
        delete saveData.realName
      }
      
      // 角色字段映射：roleId -> role
      if (saveData.roleId) {
        console.log('开始角色映射，roleId:', saveData.roleId)
        console.log('可用角色列表:', this.roles)
        
        // 根据角色ID找到对应的角色代码
        const matchedRole = this.roles.find(role => 
          role.id === saveData.roleId
        )
        
        console.log('匹配到的角色:', matchedRole)
        
        if (matchedRole) {
          saveData.role = matchedRole.name
          delete saveData.roleId
          console.log('角色映射成功:', saveData.roleId, '->', matchedRole.name)
        } else {
          console.error('角色映射失败：未找到匹配的角色，roleId:', saveData.roleId)
        }
      } else {
        console.log('没有roleId需要映射')
      }
      
      // 处理密码
      if (this.isEditMode) {
        if (this.should重置Password) {
          saveData.resetPassword = true
        }
        delete saveData.password
      } else {
        if (!saveData.password) {
          saveData.password = this.formData.phoneNumber.slice(-6)
        }
      }
      
      console.log('准备保存的数据:', saveData)
      return saveData
    },
    
    /**
     * 处理保存错误
     */
    handle保存错误(error) {
      let errorMessage = '保存失败'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.code === 'PHONE_EXISTS') {
        errorMessage = '手机号已存在'
      } else if (error.code === 'EMAIL_EXISTS') {
        errorMessage = '邮箱已存在'
      } else if (error.code === 'EMPLOYEE_ID_EXISTS') {
        errorMessage = '工号已存在'
      }
      
      this.show错误(errorMessage)
    },
    
    /**
     * 显示成功提示
     */
    show成功(message) {
      uni.showToast({
        title: message,
        icon: 'success'
      })
    },
    
    /**
     * 显示错误提示
     */
    show错误(message) {
      uni.showToast({
        title: message,
        icon: 'error'
      })
    },
    
    /**
     * 关闭弹窗
     */
    close() {
      this.$emit('close')
    },
    
    /**
     * 处理遮罩层点击
     */
    handleOverlayClick() {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
/* 模态框遮罩层 */
.user-edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20rpx;
}

/* 模态框主体 */
.user-edit-modal {
  width: 100%;
  max-width: 800rpx;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20rpx 20rpx 0 0;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 0.5rpx;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.4);
  }
}

/* 模态框内容 */
.modal-content {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  background: #f8fafc;
}

/* H5环境提示 */
.h5-notice {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 2rpx solid #bee3f8;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.15);
}

.notice-icon {
  font-size: 28rpx;
  color: #3182ce;
}

.notice-text {
  font-size: 24rpx;
  color: #4a5568;
  line-height: 1.5;
  font-weight: 500;
}

/* 表单样式 */
.user-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f1f5f9;
}

/* 角色信息样式 */
.role-info {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e9ecef;
}

.role-description {
  margin-bottom: 16rpx;
}

.role-desc-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.role-desc-text {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

.permissions-section {
  border-top: 1rpx solid #e9ecef;
  padding-top: 16rpx;
}

.permissions-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 12rpx;
  background: #ffffff;
  border-radius: 6rpx;
  border: 1rpx solid #e9ecef;
}

.permission-name {
  font-size: 22rpx;
  font-weight: 500;
  color: #333;
}

.permission-desc {
  font-size: 20rpx;
  color: #666;
  line-height: 1.3;
}

/* 表单提示 */
.form-hint {
  font-size: 20rpx;
  color: #999;
  line-height: 1.3;
  margin-top: 6rpx;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 20rpx;
  background: #ffffff;
  border-top: 1rpx solid #e9ecef;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 24rpx 32rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  background: #ffffff;
  color: #666;
  border: 2rpx solid #e9ecef;
  font-weight: 500;
  
  &:hover {
    background: #f8f9fa;
    border-color: #d1d5db;
    color: #333;
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    background: #f1f3f4;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
  
  &:hover:not(.disabled) {
    transform: translateY(-2rpx);
    box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
  }
  
  &:active:not(.disabled) {
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
  }
  
  &.disabled {
    background: #d1d5db;
    cursor: not-allowed;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transform: none;
  }
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.loading-icon {
  font-size: 20rpx;
  animation: spin 1s linear infinite;
}

.btn-icon {
  font-size: 20rpx;
  margin-right: 6rpx;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .user-edit-modal {
    max-width: 95vw;
    max-height: 95vh;
    margin: 10rpx;
  }
  
  .modal-header {
    padding: 20rpx 16rpx;
  }
  
  .modal-content {
    padding: 16rpx;
  }
  
  .modal-footer {
    padding: 16rpx;
    flex-direction: column;
    gap: 12rpx;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
    padding: 18rpx;
  }
}

@media (max-width: 480rpx) {
  .user-edit-overlay {
    padding: 8rpx;
  }
  
  .modal-header {
    padding: 16rpx 12rpx;
  }
  
  .modal-content {
    padding: 12rpx;
  }
  
  .modal-footer {
    padding: 12rpx;
  }
  
  .modal-title {
    font-size: 24rpx;
  }
  
  .close-btn {
    width: 40rpx;
    height: 40rpx;
    font-size: 20rpx;
  }
}
</style>
