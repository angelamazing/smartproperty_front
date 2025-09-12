<template>
  <view class="users-admin-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">人员管理</view>
      <view class="header-subtitle">管理用户信息、角色和权限</view>
    </view>

    <!-- 功能导航 -->
    <view class="tab-navigation">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'users' }"
        @click="switchTab('users')"
      >
        <text>用户管理</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'roles' }"
        @click="switchTab('roles')"
      >
        <text>角色权限</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'departments' }"
        @click="switchTab('departments')"
      >
        <text>部门管理</text>
      </view>
    </view>

    <!-- 用户管理标签页 -->
    <view v-if="activeTab === 'users'" class="tab-content">
      <!-- 搜索和筛选 -->
      <view class="search-section">
        <view class="search-bar">
          <input 
            class="search-input" 
            placeholder="搜索用户姓名、手机号"
            v-model="searchKeyword"
            @input="onSearchInput"
          />
          <button class="search-btn" @click="searchUsers">
            <text>🔍</text>
          </button>
        </view>
        
        <view class="filter-row">
          <picker :range="roleOptions" @change="onRoleFilterChange">
            <view class="filter-picker">
              <text>{{ roleOptions[roleFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <picker :range="departmentOptions" @change="onDepartmentFilterChange">
            <view class="filter-picker">
              <text>{{ departmentOptions[departmentFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <picker :range="statusOptions" @change="onStatusFilterChange">
            <view class="filter-picker">
              <text>{{ statusOptions[statusFilterIndex] }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
          
          <button class="filter-btn" @click="resetFilter">
            重置
          </button>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3">
          <button class="action-btn primary" @click="addUser">
            <text>+</text> 添加用户
          </button>
        </PermissionGuard>
        
        <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3">
          <button class="action-btn secondary" @click="exportUsers">
            <text>📄</text> 导出数据
          </button>
        </PermissionGuard>
        
        <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3">
          <button 
            v-if="selectedUsers.length > 0" 
            class="action-btn danger" 
            @click="batchDeleteUsers"
          >
            <text>🗑️</text> 批量删除 ({{ selectedUsers.length }})
          </button>
        </PermissionGuard>
      </view>

      <!-- 用户列表 -->
      <view class="users-list">
        <view v-if="usersList.length === 0" class="empty-state">
          <text class="empty-text">暂无用户数据</text>
          <text class="empty-hint">添加用户后将在此显示</text>
        </view>
        
        <view v-else class="list-header">
          <checkbox 
            class="select-all-checkbox" 
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <text class="header-label">全选</text>
          <text class="user-count">共 {{ totalUsers }} 个用户</text>
        </view>
        
        <view 
          v-for="user in usersList" 
          :key="user.id"
          class="user-item"
        >
          <!-- 左侧选择框和头像 -->
          <view class="user-left">
            <checkbox 
              class="user-checkbox" 
              :checked="selectedUsers.includes(user.id)"
              @change="toggleUserSelect(user.id)"
            />
            
            <view class="user-avatar-container">
              <UserAvatar
                :user="user"
                size="medium"
              />
              <view class="user-status-indicator" :class="user.status"></view>
            </view>
          </view>
          
          <!-- 中间用户信息 -->
          <view class="user-info">
            <view class="user-name-row">
              <text class="user-name">{{ user.name || '未设置姓名' }}</text>
              <view v-if="user.role !== 'user'" class="user-role" :class="user.role">
                {{ getRoleText(user.role) }}
              </view>
            </view>
            
            <view class="user-details">
              <text class="user-phone">{{ user.phoneNumber || '未绑定手机' }}</text>
              <text class="user-dept">{{ user.deptName || '未分配部门' }}</text>
            </view>
            
            <view class="user-meta">
              <text class="meta-text">注册: {{ formatDate(user.createTime) }}</text>
              <text class="meta-text">最后登录: {{ formatDate(user.lastLoginTime) }}</text>
            </view>
          </view>
          
          <!-- 右侧操作按钮 -->
          <view class="user-actions">
            <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3" :show-fallback="false">
              <button class="action-btn small edit" @click="editUser(user)">
                编辑
              </button>
            </PermissionGuard>
            
            <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3" :show-fallback="false">
              <button class="action-btn small secondary" @click="resetUserPassword(user)">
                🔑 重置
              </button>
            </PermissionGuard>
            
            <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3" :show-fallback="false">
              <button 
                class="action-btn small" 
                :class="user.status === 'active' ? 'warning' : 'success'"
                @click="toggleUserStatus(user)"
              >
                {{ user.status === 'active' ? '禁用' : '启用' }}
              </button>
            </PermissionGuard>
            
            <PermissionGuard :roles="['admin', 'sys_admin']" :min-level="3" :show-fallback="false">
              <button class="action-btn small danger" @click="deleteUser(user)">
                删除
              </button>
            </PermissionGuard>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </view>
    </view>

    <!-- 角色权限标签页 -->
    <view v-if="activeTab === 'roles'" class="tab-content">
      <view class="roles-section">
        <view class="section-title">
          <text>角色列表</text>
          <button class="add-role-btn" @click="addRole">+ 新建角色</button>
        </view>
        
        <view class="roles-list">
          <view 
            v-for="role in rolesList" 
            :key="role.id"
            class="role-item"
          >
            <view class="role-header">
              <text class="role-name">{{ role.name }}</text>
              <view class="role-level" :class="role.level">
                {{ getRoleLevelText(role.level) }}
              </view>
            </view>
            
            <view class="role-description">
              <text>{{ role.description }}</text>
            </view>
            
            <view class="role-permissions">
              <text class="permissions-label">权限:</text>
              <view class="permissions-tags">
                <text 
                  v-for="permission in role.permissions" 
                  :key="permission"
                  class="permission-tag"
                >
                  {{ getPermissionText(permission) }}
                </text>
              </view>
            </view>
            
            <view class="role-stats">
              <text class="user-count">{{ role.userCount || 0 }} 个用户</text>
              <text class="create-time">创建时间: {{ formatDate(role.createTime) }}</text>
            </view>
            
            <view class="role-actions">
              <button class="action-btn small" @click="editRole(role)">
                编辑
              </button>
              <button class="action-btn small secondary" @click="assignRole(role)">
                分配用户
              </button>
              <button 
                v-if="role.level !== 'system'" 
                class="action-btn small danger" 
                @click="deleteRole(role)"
              >
                删除
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 部门管理标签页 -->
    <view v-if="activeTab === 'departments'" class="tab-content">
      <view class="departments-section">
        <view class="section-title">
          <text>部门架构</text>
          <button class="add-dept-btn" @click="addDepartment">+ 新建部门</button>
        </view>
        
        <view class="departments-tree">
          <view 
            v-for="dept in departmentsList" 
            :key="dept._id || dept.id"
            class="dept-item"
            :class="{ expanded: dept.expanded }"
          >
            <view class="dept-header" @click="toggleDeptExpand(dept)">
              <!-- 第一行：部门信息和状态 -->
              <view class="dept-main-info">
                <text v-if="dept.children && dept.children.length > 0" class="expand-icon">
                  {{ dept.expanded ? '▼' : '▶' }}
                </text>
                <view class="dept-info">
                  <text class="dept-name">{{ dept.name }}</text>
                  <text class="dept-code">{{ dept.code }}</text>
                </view>
                <text class="dept-user-count">({{ dept.memberCount || 0 }}人)</text>
                <text class="dept-status" :class="dept.status === 'active' ? 'status-active' : 'status-inactive'">
                  {{ dept.status === 'active' ? 'normal' : '停用' }}
                </text>
              </view>
              
              <!-- 第二行：管理员信息 -->
              <view v-if="dept.manager" class="dept-manager-info">
                <text class="dept-manager">管理员: {{ dept.manager.name }}</text>
              </view>
              
              <!-- 第三行：操作按钮 -->
              <view class="dept-actions" @click.stop>
                <button class="action-btn small" @click="editDepartment(dept)">
                  编辑
                </button>
                <button class="action-btn small secondary" @click="addSubDepartment(dept)">
                  添加子部门
                </button>
                <button class="action-btn small danger" @click="deleteDepartment(dept)">
                  删除
                </button>
              </view>
            </view>
            
            <view v-if="dept.expanded && dept.children" class="dept-children">
              <view 
                v-for="subDept in dept.children" 
                :key="subDept._id || subDept.id"
                class="dept-item sub-dept"
              >
                <view class="dept-header">
                  <text class="dept-name">{{ subDept.name }}</text>
                  <text class="dept-user-count">({{ subDept.memberCount || 0 }}人)</text>
                  
                  <view class="dept-actions" @click.stop>
                    <button class="action-btn small" @click="editDepartment(subDept)">
                      编辑
                    </button>
                    <button class="action-btn small danger" @click="deleteDepartment(subDept)">
                      删除
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户详情弹窗 -->
    <UserDetailModal 
      v-if="showUserDetailModal"
      :visible="showUserDetailModal"
      :user="selectedUserDetail"
      @close="showUserDetailModal = false"
      @updated="onUserUpdated"
    />

    <!-- 用户编辑弹窗 -->
    <UserEditModal 
      v-if="showUserEditModal"
      :visible="showUserEditModal"
      :user="selectedUserForEdit"
      :departments="departmentsList"
      :roles="rolesList"
      @close="showUserEditModal = false"
      @saved="onUserSaved"
    />

    <!-- 重置密码弹窗 -->
    <view v-if="showResetPasswordModal" class="modal-overlay" @click="closeResetPasswordModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">重置用户密码</text>
          <button class="modal-close" @click="closeResetPasswordModal">×</button>
        </view>
        
        <view class="modal-body">
          <view class="user-info">
            <text class="user-name">{{ selectedUserForReset?.name }}</text>
            <text class="user-phone">{{ selectedUserForReset?.phoneNumber }}</text>
          </view>
          
          <view class="form-group">
            <view class="input-container">
              <text class="input-label">新密码</text>
              <view class="input-field-wrapper">
                <view class="input-field" :class="{ 'focused': focusedField === 'new', 'error': passwordErrors.new }">
                  <input 
                    class="input-text"
                    :value="resetPasswordForm.newPassword"
                    @input="handleResetNewPasswordInput"
                    :type="passwordVisibility.new ? 'text' : 'password'"
                    placeholder="请输入新密码"
                    maxlength="20"
                    @focus="onPasswordFocus('new')"
                    @blur="onPasswordBlur('new')"
                  />
                  <button 
                    class="visibility-toggle"
                    @click="togglePasswordVisibility('new')"
                    type="button"
                  >
                    <text class="toggle-icon">{{ passwordVisibility.new ? '👁️' : '🙈' }}</text>
                  </button>
                </view>
                <view class="input-footer">
                  <text v-if="passwordErrors.new" class="error-message">{{ passwordErrors.new }}</text>
                  <text class="char-counter">{{ resetPasswordForm.newPassword.length }}/20</text>
                </view>
                <view v-if="resetPasswordForm.newPassword" class="password-strength">
                  <text class="strength-label">密码强度：</text>
                  <view class="strength-bar">
                    <view 
                      class="strength-segment"
                      :class="getPasswordStrengthClass(0)"
                    ></view>
                    <view 
                      class="strength-segment"
                      :class="getPasswordStrengthClass(1)"
                    ></view>
                    <view 
                      class="strength-segment"
                      :class="getPasswordStrengthClass(2)"
                    ></view>
                    <view 
                      class="strength-segment"
                      :class="getPasswordStrengthClass(3)"
                    ></view>
                  </view>
                  <text class="strength-text">{{ getPasswordStrengthText() }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <view class="input-container">
              <text class="input-label">确认密码</text>
              <view class="input-field-wrapper">
                <view class="input-field" :class="{ 'focused': focusedField === 'confirm', 'error': passwordErrors.confirm }">
                  <input 
                    class="input-text"
                    :value="resetPasswordForm.confirmPassword"
                    @input="handleResetConfirmPasswordInput"
                    :type="passwordVisibility.confirm ? 'text' : 'password'"
                    placeholder="请再次输入新密码"
                    maxlength="20"
                    @focus="onPasswordFocus('confirm')"
                    @blur="onPasswordBlur('confirm')"
                  />
                  <button 
                    class="visibility-toggle"
                    @click="togglePasswordVisibility('confirm')"
                    type="button"
                  >
                    <text class="toggle-icon">{{ passwordVisibility.confirm ? '👁️' : '🙈' }}</text>
                  </button>
                </view>
                <view class="input-footer">
                  <text v-if="passwordErrors.confirm" class="error-message">{{ passwordErrors.confirm }}</text>
                  <text v-if="resetPasswordForm.confirmPassword && resetPasswordForm.newPassword === resetPasswordForm.confirmPassword" class="success-message">✓ 密码匹配</text>
                  <text class="char-counter">{{ resetPasswordForm.confirmPassword.length }}/20</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="password-tips">
            <text class="tips-title">密码要求：</text>
            <view class="tip-item">
              <text class="tip-dot">•</text>
              <text class="tip-text">密码长度6-20位</text>
            </view>
            <view class="tip-item">
              <text class="tip-dot">•</text>
              <text class="tip-text">建议包含字母和数字</text>
            </view>
            <view class="tip-item">
              <text class="tip-dot">•</text>
              <text class="tip-text">避免使用过于简单的密码</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeResetPasswordModal">取消</button>
          <button 
            class="btn-confirm" 
            @click="confirmResetPassword"
            :disabled="resetPasswordSubmitting"
            type="button"
          >
            {{ resetPasswordSubmitting ? '重置中...' : '确认重置' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :currentPage="'/pages/admin/users'" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import UserDetailModal from '@/components/UserDetailModal.vue'
import UserEditModal from '@/components/UserEditModal.vue'
import api from '@/utils/api'
import UserAvatar from '@/components/UserAvatar.vue'
import PermissionGuard from '@/components/PermissionGuard.vue'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'UsersAdmin',
  mixins: [timeMixin],
  components: {
    BottomNav,
    UserDetailModal,
    UserEditModal,
    UserAvatar,
    PermissionGuard
  },
  data() {
    return {
      activeTab: 'users',
      
      // 搜索和筛选
      searchKeyword: '',
      roleFilterIndex: 0,
      departmentFilterIndex: 0,  // 新增：部门筛选索引
      statusFilterIndex: 0,
      roleOptions: ['全部角色', '普通用户', '部门管理员', '系统管理员'],
      departmentOptions: ['全部部门'],  // 新增：部门选项
      statusOptions: ['全部状态', 'normal', '禁用'],
      
      // 用户数据
      usersList: [],
      selectedUsers: [],
      totalUsers: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      
      // 角色数据
      rolesList: [],
      
      // 部门数据
      departmentsList: [],
      
      // 弹窗控制
      showUserDetailModal: false,
      showUserEditModal: false,
      showResetPasswordModal: false,
      selectedUserDetail: null,
      selectedUserForEdit: null,
      selectedUserForReset: null,
      
      // 重置密码表单
      resetPasswordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      resetPasswordSubmitting: false,
      
      // 密码输入相关
      focusedField: null,
      passwordVisibility: {
        new: false,
        confirm: false
      },
      passwordErrors: {
        new: '',
        confirm: ''
      },
      passwordStrength: 0,
      
      loading: false
    }
  },
  computed: {
    isAllSelected() {
      return this.usersList.length > 0 && this.selectedUsers.length === this.usersList.length
    }
  },
  onLoad() {
    this.checkAdminPermission()
    this.loadUsers()
    this.loadRoles()
    this.loadDepartments()
  },
  methods: {
    /**
     * 检查管理员权限
     */
    async checkAdminPermission() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.role || !['admin', 'sys_admin'].includes(userInfo.role)) {
          uni.showToast({
            title: '权限不足',
            icon: 'error'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          return false
        }
        return true
      } catch (error) {
        console.error('检查权限失败:', error)
        return false
      }
    },

    /**
     * 切换标签页
     */
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'users') {
        this.loadUsers()
      } else if (tab === 'roles') {
        this.loadRoles()
      } else if (tab === 'departments') {
        this.loadDepartments()
      }
    },

    /**
     * 搜索用户
     */
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
      // 防抖搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchUsers()
      }, 500)
    },

    searchUsers() {
      this.currentPage = 1
      this.loadUsers()
    },

    /**
     * 筛选条件变化
     */
    onRoleFilterChange(e) {
      this.roleFilterIndex = e.detail.value
      this.currentPage = 1
      this.loadUsers()
    },

    onStatusFilterChange(e) {
      this.statusFilterIndex = e.detail.value
      this.currentPage = 1
      this.loadUsers()
    },

    onDepartmentFilterChange(e) {
      this.departmentFilterIndex = e.detail.value
      this.currentPage = 1
      this.loadUsers()
    },

    resetFilter() {
      this.searchKeyword = ''
      this.roleFilterIndex = 0
      this.departmentFilterIndex = 0  // 新增：重置部门筛选
      this.statusFilterIndex = 0
      this.currentPage = 1
      this.loadUsers()
    },

    /**
     * 加载用户列表
     */
    async loadUsers() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize  // 修复：使用正确的参数名 pageSize
        }

        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }

        if (this.roleFilterIndex > 0) {
          const roles = ['', 'user', 'dept_admin', 'sys_admin', 'verifier']
          params.role = roles[this.roleFilterIndex]
        }

        if (this.statusFilterIndex > 0) {
          const statuses = ['', 'active', 'inactive']
          params.status = statuses[this.statusFilterIndex]
        }

        // 新增：添加部门筛选参数
        if (this.departmentFilterIndex > 0) {
          const selectedDept = this.departmentsList[this.departmentFilterIndex - 1]
          if (selectedDept) {
            params.department = selectedDept.name  // 使用部门名称进行模糊匹配
          }
        }

        const response = await api.admin.getUsersList(params)
        if (response.success) {
          // 更新：使用正确的响应数据结构
          this.usersList = response.data.records || []
          this.totalUsers = response.data.total || 0
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize)
          
          // 数据字段映射 - 保留原始数据字段
          this.usersList = this.usersList.map(user => ({
            // 保留原始字段
            _id: user._id,
            nickName: user.nickName,
            department: user.department,
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email,
            status: user.status,
            avatarUrl: user.avatarUrl,
            createTime: user.createTime,
            updateTime: user.updateTime,
            lastLoginTime: user.lastLoginTime,
            isTestUser: user.isTestUser,
            // 添加映射字段用于显示
            id: user._id,
            name: user.nickName,
            deptName: user.department
          }))
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载角色列表
     */
    async loadRoles() {
      try {
        const response = await api.admin.getRolesList()
        if (response.success) {
          this.rolesList = response.data || []
        }
      } catch (error) {
        console.error('加载角色列表失败:', error)
      }
    },

    /**
     * 加载部门列表
     */
    async loadDepartments() {
      try {
        const response = await api.admin.getDepartmentsList()
        if (response.success) {
          this.departmentsList = response.data || []
          // 新增：更新部门选项，包含"全部部门"
          this.departmentOptions = ['全部部门', ...this.departmentsList.map(dept => dept.name)]
        }
      } catch (error) {
        console.error('加载部门列表失败:', error)
      }
    },

    /**
     * 用户选择
     */
    toggleSelectAll(e) {
      if (e.detail.value) {
        this.selectedUsers = this.usersList.map(user => user.id)
      } else {
        this.selectedUsers = []
      }
    },

    toggleUserSelect(userId) {
      const index = this.selectedUsers.indexOf(userId)
      if (index > -1) {
        this.selectedUsers.splice(index, 1)
      } else {
        this.selectedUsers.push(userId)
      }
    },

    /**
     * 分页
     */
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadUsers()
      }
    },

    /**
     * 用户操作
     */
    addUser() {
      this.selectedUserForEdit = null
      this.showUserEditModal = true
    },

    viewUserDetail(user) {
      this.selectedUserDetail = user
      this.showUserDetailModal = true
    },

    editUser(user) {
      this.selectedUserForEdit = user
      this.showUserEditModal = true
    },

    /**
     * 重置用户密码
     */
    resetUserPassword(user) {
      this.selectedUserForReset = user
      this.resetPasswordForm = {
        newPassword: '',
        confirmPassword: ''
      }
      this.showResetPasswordModal = true
    },

    /**
     * 关闭重置密码弹窗
     */
    closeResetPasswordModal() {
      this.showResetPasswordModal = false
      this.selectedUserForReset = null
      this.resetPasswordForm = {
        newPassword: '',
        confirmPassword: ''
      }
      // 重置密码相关状态
      this.focusedField = null
      this.passwordVisibility = {
        new: false,
        confirm: false
      }
      this.passwordErrors = {
        new: '',
        confirm: ''
      }
      this.passwordStrength = 0
    },

    /**
     * 确认重置密码
     */
    async confirmResetPassword() {
      console.log('确认重置密码按钮被点击')
      console.log('当前用户:', this.selectedUserForReset)
      console.log('表单数据:', this.resetPasswordForm)
      
      // 先显示一个测试提示
      uni.showToast({
        title: '按钮点击成功',
        icon: 'success'
      })
      
      // 验证表单
      if (!this.validateResetPasswordForm()) {
        console.log('表单验证失败')
        return
      }

      console.log('开始重置密码...')
      this.resetPasswordSubmitting = true
      
      try {
        console.log('调用API重置密码...')
        const response = await api.admin.resetUserPassword(
          this.selectedUserForReset.id,
          this.resetPasswordForm.newPassword
        )
        
        console.log('API响应:', response)
        
        if (response.success) {
          uni.showToast({
            title: '密码重置成功',
            icon: 'success'
          })
          this.closeResetPasswordModal()
        } else {
          uni.showToast({
            title: response.message || '密码重置失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        uni.showToast({
          title: '密码重置失败，请重试',
          icon: 'error'
        })
      } finally {
        this.resetPasswordSubmitting = false
      }
    },

    /**
     * 重置密码 - 新密码输入处理
     */
    handleResetNewPasswordInput(e) {
      this.resetPasswordForm.newPassword = e.detail.value
      this.passwordErrors.new = ''
      this.passwordStrength = this.calculatePasswordStrength(this.resetPasswordForm.newPassword)
      
      // 如果确认密码已输入，重新验证
      if (this.resetPasswordForm.confirmPassword) {
        this.validateConfirmPassword()
      }
      console.log('重置密码 - 新密码输入:', e.detail.value)
    },

    /**
     * 重置密码 - 确认密码输入处理
     */
    handleResetConfirmPasswordInput(e) {
      this.resetPasswordForm.confirmPassword = e.detail.value
      this.passwordErrors.confirm = ''
      this.validateConfirmPassword()
      console.log('重置密码 - 确认密码输入:', e.detail.value)
    },

    /**
     * 新密码输入处理（保持向后兼容）
     */
    onNewPasswordInput(e) {
      console.log('新密码输入:', e.detail.value)
      this.resetPasswordForm.newPassword = e.detail.value
    },

    /**
     * 确认密码输入处理（保持向后兼容）
     */
    onConfirmPasswordInput(e) {
      console.log('确认密码输入:', e.detail.value)
      this.resetPasswordForm.confirmPassword = e.detail.value
    },

    /**
     * 密码输入框获得焦点
     */
    onPasswordFocus(type) {
      this.focusedField = type
      console.log('密码输入框获得焦点:', type)
    },

    /**
     * 密码输入框失去焦点
     */
    onPasswordBlur(type) {
      this.focusedField = null
      // 失去焦点时进行验证
      if (type === 'new' && this.resetPasswordForm.newPassword) {
        this.validateNewPassword()
      } else if (type === 'confirm' && this.resetPasswordForm.confirmPassword) {
        this.validateConfirmPassword()
      }
    },

    /**
     * 切换密码可见性
     */
    togglePasswordVisibility(type) {
      this.passwordVisibility[type] = !this.passwordVisibility[type]
    },

    /**
     * 验证新密码
     */
    validateNewPassword() {
      if (!this.resetPasswordForm.newPassword.trim()) {
        this.passwordErrors.new = '请输入新密码'
        return false
      }
      
      if (this.resetPasswordForm.newPassword.length < 6) {
        this.passwordErrors.new = '密码长度至少6位'
        return false
      }
      
      if (this.resetPasswordForm.newPassword.length > 20) {
        this.passwordErrors.new = '密码长度不能超过20位'
        return false
      }
      
      this.passwordErrors.new = ''
      return true
    },

    /**
     * 验证确认密码
     */
    validateConfirmPassword() {
      if (!this.resetPasswordForm.confirmPassword.trim()) {
        this.passwordErrors.confirm = '请确认新密码'
        return false
      }
      
      if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
        this.passwordErrors.confirm = '两次输入的密码不一致'
        return false
      }
      
      this.passwordErrors.confirm = ''
      return true
    },

    /**
     * 计算密码强度
     */
    calculatePasswordStrength(password) {
      if (!password) return 0
      
      let strength = 0
      
      // 长度检查
      if (password.length >= 6) strength++
      if (password.length >= 10) strength++
      
      // 字符类型检查
      if (/[a-z]/.test(password)) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^a-zA-Z0-9]/.test(password)) strength++
      
      // 返回0-4的强度值
      return Math.min(strength, 4)
    },

    /**
     * 获取密码强度样式类
     */
    getPasswordStrengthClass(index) {
      const strength = this.passwordStrength
      if (index < strength) {
        if (strength <= 1) return 'weak'
        if (strength <= 2) return 'fair'
        if (strength <= 3) return 'good'
        return 'strong'
      }
      return 'empty'
    },

    /**
     * 获取密码强度文本
     */
    getPasswordStrengthText() {
      const strength = this.passwordStrength
      if (strength === 0) return '请输入 password'
      if (strength === 1) return '弱'
      if (strength === 2) return '一般'
      if (strength === 3) return '良好'
      return '强'
    },

    /**
     * 验证重置密码表单
     */
    validateResetPasswordForm() {
      console.log('验证表单数据:', this.resetPasswordForm)
      
      if (!this.resetPasswordForm.newPassword.trim()) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'error'
        })
        return false
      }

      if (this.resetPasswordForm.newPassword.length < 6) {
        uni.showToast({
          title: '密码长度至少6位',
          icon: 'error'
        })
        return false
      }

      if (this.resetPasswordForm.newPassword.length > 20) {
        uni.showToast({
          title: '密码长度不能超过20位',
          icon: 'error'
        })
        return false
      }

      if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'error'
        })
        return false
      }

      return true
    },

    async toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      const actionText = newStatus === 'active' ? '启用' : '禁用'
      
      uni.showModal({
        title: `确认${actionText}`,
        content: `确定要${actionText}用户"${user.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.updateUserStatus(user.id, newStatus)
              if (response.success) {
                uni.showToast({
                  title: `${actionText}成功`,
                  icon: 'success'
                })
                this.loadUsers()
              }
            } catch (error) {
              console.error(`${actionText}用户失败:`, error)
              uni.showToast({
                title: `${actionText}失败`,
                icon: 'error'
              })
            }
          }
        }
      })
    },

    async deleteUser(user) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除用户"${user.name}"吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 显示加载提示
              uni.showLoading({
                title: '删除中...'
              })
              
              const response = await api.admin.deleteUser(user.id)
              
              // 隐藏加载提示
              uni.hideLoading()
              
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                // 从本地列表中移除用户，避免重新加载整个列表
                this.usersList = this.usersList.filter(u => u.id !== user.id)
                this.totalUsers--
                // 如果当前页没有用户了，且不是第一页，则跳转到上一页
                if (this.usersList.length === 0 && this.currentPage > 1) {
                  this.currentPage--
                }
                // 重新计算总页数
                this.totalPages = Math.ceil(this.totalUsers / this.pageSize)
              } else {
                // 处理业务逻辑错误
                uni.showModal({
                  title: '删除失败',
                  content: response.message || '删除用户失败，请重试',
                  show取消: false
                })
              }
            } catch (error) {
              // 隐藏加载提示
              uni.hideLoading()
              
              console.error('删除用户失败:', error)
              
              // 根据错误类型显示不同的提示
              let errorMessage = '删除用户失败，请重试'
              
              if (error.message) {
                if (error.message.includes('401')) {
                  errorMessage = '登录已过期，请重新登录'
                } else if (error.message.includes('403')) {
                  errorMessage = '没有删除用户的权限'
                } else if (error.message.includes('404')) {
                  errorMessage = '用户不存在或已被删除'
                } else if (error.message.includes('500')) {
                  errorMessage = '服务器内部错误，请稍后重试'
                } else if (error.message.includes('网络')) {
                  errorMessage = '网络连接失败，请检查网络'
                }
              }
              
              uni.showModal({
                title: '删除失败',
                content: errorMessage,
                show取消: false
              })
            }
          }
        }
      })
    },

    async batchDeleteUsers() {
      uni.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.selectedUsers.length} 个用户吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 显示加载提示
              uni.showLoading({
                title: '批量删除中...'
              })
              
              const response = await api.admin.batchDeleteUsers(this.selectedUsers)
              
              // 隐藏加载提示
              uni.hideLoading()
              
              if (response.success) {
                uni.showToast({
                  title: '批量删除成功',
                  icon: 'success'
                })
                
                // 从本地列表中移除已删除的用户
                this.usersList = this.usersList.filter(u => !this.selectedUsers.includes(u.id))
                this.totalUsers -= this.selectedUsers.length
                
                // 清空选择
                this.selectedUsers = []
                
                // 如果当前页没有用户了，且不是第一页，则跳转到上一页
                if (this.usersList.length === 0 && this.currentPage > 1) {
                  this.currentPage--
                }
                
                // 重新计算总页数
                this.totalPages = Math.ceil(this.totalUsers / this.pageSize)
              } else {
                // 处理业务逻辑错误
                uni.showModal({
                  title: '批量删除失败',
                  content: response.message || '批量删除用户失败，请重试',
                  show取消: false
                })
              }
            } catch (error) {
              // 隐藏加载提示
              uni.hideLoading()
              
              console.error('批量删除失败:', error)
              
              // 根据错误类型显示不同的提示
              let errorMessage = '批量删除用户失败，请重试'
              
              if (error.message) {
                if (error.message.includes('401')) {
                  errorMessage = '登录已过期，请重新登录'
                } else if (error.message.includes('403')) {
                  errorMessage = '没有删除用户的权限'
                } else if (error.message.includes('404')) {
                  errorMessage = '部分用户不存在或已被删除'
                } else if (error.message.includes('500')) {
                  errorMessage = '服务器内部错误，请稍后重试'
                } else if (error.message.includes('网络')) {
                  errorMessage = '网络连接失败，请检查网络'
                }
              }
              
              uni.showModal({
                title: '批量删除失败',
                content: errorMessage,
                show取消: false
              })
            }
          }
        }
      })
    },

    async exportUsers() {
      try {
        uni.showToast({
          title: '导出功能开发中',
          icon: 'none'
        })
      } catch (error) {
        console.error('导出用户失败:', error)
      }
    },

    /**
     * 角色操作
     */
    addRole() {
      uni.navigateTo({
        url: '/pages/admin/role-edit?action=create'
      })
    },

    editRole(role) {
      uni.navigateTo({
        url: `/pages/admin/role-edit?action=edit&id=${role.id}`
      })
    },

    assignRole(role) {
      uni.navigateTo({
        url: `/pages/admin/role-assign?roleId=${role.id}`
      })
    },

    async deleteRole(role) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除角色"${role.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.deleteRole(role.id)
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadRoles()
              }
            } catch (error) {
              console.error('删除角色失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    /**
     * 部门操作
     */
    toggleDeptExpand(dept) {
      dept.expanded = !dept.expanded
      this.$forceUpdate()
    },

    addDepartment() {
      uni.navigateTo({
        url: '/pages/admin/dept-edit?action=create'
      })
    },

    addSubDepartment(parentDept) {
      uni.navigateTo({
        url: `/pages/admin/dept-edit?action=create&parentId=${parentDept._id || parentDept.id}`
      })
    },

    editDepartment(dept) {
      uni.navigateTo({
        url: `/pages/admin/dept-edit?action=edit&id=${dept._id || dept.id}`
      })
    },

    async deleteDepartment(dept) {
      if (dept.memberCount > 0) {
        uni.showToast({
          title: '部门下有用户，无法删除',
          icon: 'error'
        })
        return
      }

      uni.showModal({
        title: '确认删除',
        content: `确定要删除部门"${dept.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.deleteDepartment(dept._id || dept.id)
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadDepartments()
              }
            } catch (error) {
              console.error('删除部门失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    /**
     * 事件处理
     */
    onUserUpdated() {
      this.loadUsers()
    },

    onUserSaved() {
      this.loadUsers()
      this.showUserEditModal = false
    },

    /**
     * 工具方法
     */
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateStr)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    },

    getRoleText(role) {
      const texts = {
        user: '普通用户',
        dept_admin: '部门管理员',
        sys_admin: '系统管理员',
        verifier: '验证员'
      }
      return texts[role] || role
    },

    getStatusText(status) {
      const texts = {
        active: 'normal',
        inactive: '禁用'
      }
      return texts[status] || status
    },

    getRoleLevelText(level) {
      const texts = {
        system: '系统角色',
        custom: '自定义角色'
      }
      return texts[level] || level
    },

    getPermissionText(permission) {
      const texts = {
        user_read: '用户查看',
        user_write: '用户管理',
        dining_read: '报餐查看',
        dining_write: '报餐管理',
        venue_read: '场地查看',
        venue_write: '场地管理',
        system_read: '系统查看',
        system_write: '系统管理'
      }
      return texts[permission] || permission
    }
  }
}
</script>

<style lang="scss" scoped>
.users-admin-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx; /* 为底部导航栏预留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
  color: white;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 标签导航 */
.tab-navigation {
  background: white;
  display: flex;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 500;
}

/* 标签内容 */
.tab-content {
  padding: 30rpx;
}

/* 搜索区域 */
.search-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  padding: 24rpx 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  font-size: 26rpx;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.search-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.filter-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
  flex-wrap: wrap;
}

.filter-picker {
  flex: 1;
  min-width: 200rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.filter-picker:active {
  background: #e9ecef;
  border-color: #667eea;
}

.picker-arrow {
  color: #999;
  font-size: 20rpx;
  transition: transform 0.3s ease;
}

.filter-picker:active .picker-arrow {
  transform: rotate(180deg);
}

.filter-btn {
  padding: 20rpx 30rpx;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:active {
  background: #5a6268;
  transform: translateY(1rpx);
}

/* 操作区域 */
.action-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 20rpx 28rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-height: 72rpx;
  cursor: pointer;
}

.btn-icon {
  font-size: 26rpx;
  font-weight: bold;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.action-btn.primary:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.action-btn.secondary:active {
  background: #f8f9fa;
  transform: translateY(1rpx);
}

.action-btn.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(231, 76, 60, 0.3);
}

.action-btn.danger:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.3);
}

.action-btn.small {
  padding: 12rpx 20rpx;
  font-size: 22rpx;
  min-height: 56rpx;
  border-radius: 8rpx;
  gap: 8rpx;
  min-width: 100rpx;
  max-width: 140rpx;
  justify-content: center;
  white-space: nowrap;
  flex: 1;
}

.action-btn.success {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(39, 174, 96, 0.3);
}

.action-btn.success:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(39, 174, 96, 0.3);
}

.action-btn.warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(243, 156, 18, 0.3);
}

.action-btn.warning:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(243, 156, 18, 0.3);
}

.action-btn.edit {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.3);
}

.action-btn.edit:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(52, 152, 219, 0.3);
}

/* 用户列表 - 简洁设计 */
.users-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  padding: 24rpx 30rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e9ecef;
}

.select-all-checkbox {
  margin-right: 20rpx;
}

.header-label {
  font-size: 26rpx;
  color: #333;
  margin-right: auto;
}

.user-count {
  font-size: 24rpx;
  color: #666;
}

.user-item {
  padding: 30rpx;
  border-bottom: 2rpx solid #f8f9fa;
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item:hover {
  background: #f8f9fa;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 左侧区域 */
.user-left {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.user-checkbox {
  margin-top: 8rpx;
  flex-shrink: 0;
}

.user-avatar-container {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.user-status-indicator {
  position: absolute;
  bottom: 2rpx;
  right: 2rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 3rpx solid white;
  box-shadow: 0 0 0 2rpx rgba(0, 0, 0, 0.1);
}

.user-status-indicator.active {
  background-color: #27ae60;
}

.user-status-indicator.disabled {
  background-color: #e74c3c;
}

.user-status-indicator.inactive {
  background-color: #e74c3c;
}

/* 中间用户信息区域 */
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 20rpx;
  min-width: 0;
  padding: 8rpx 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.user-role {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: white;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
}

.user-role.user {
  background: #95a5a6;
}

.user-role.dept_admin {
  background: #f39c12;
}

.user-role.sys_admin {
  background: #e74c3c;
}

.user-role.verifier {
  background: #9b59b6;
}

.user-details {
  margin-bottom: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.user-phone {
  font-size: 26rpx;
  color: #34495e;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.user-phone::before {
  content: "📱";
  margin-right: 8rpx;
  font-size: 20rpx;
}

.user-dept {
  font-size: 24rpx;
  color: #7f8c8d;
  display: flex;
  align-items: center;
}

.user-dept::before {
  content: "🏢";
  margin-right: 8rpx;
  font-size: 18rpx;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #95a5a6;
  line-height: 1.2;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-size: 20rpx;
  color: #95a5a6;
  margin-right: 8rpx;
  min-width: 80rpx;
}

.meta-value {
  font-size: 20rpx;
  color: #34495e;
  font-weight: 500;
}

/* 右侧操作按钮区域 */
.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex-shrink: 0;
  min-width: 140rpx;
  align-items: flex-end;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  margin-top: 30rpx;
}

.page-btn {
  padding: 20rpx 30rpx;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.page-btn:disabled {
  background: #ccc;
  color: #999;
}

.page-info {
  font-size: 26rpx;
  color: #333;
}

/* 角色列表 */
.roles-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-role-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.role-item {
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.role-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.role-level {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: white;
}

.role-level.system {
  background: #e74c3c;
}

.role-level.custom {
  background: #667eea;
}

.role-description {
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #666;
}

.role-permissions {
  margin-bottom: 16rpx;
}

.permissions-label {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.permissions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.permission-tag {
  padding: 6rpx 12rpx;
  background: #667eea;
  color: white;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.role-stats {
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

.role-actions {
  display: flex;
  gap: 12rpx;
  justify-content: flex-end;
}

/* 部门管理 */
.departments-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.add-dept-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.departments-tree {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.dept-item {
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  overflow: hidden;
}

.dept-item.sub-dept {
  margin-left: 40rpx;
  border-color: #d6dbdf;
}

.dept-header {
  padding: 24rpx;
  background: #f8f9fa;
  cursor: pointer;
}

.dept-main-info {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.expand-icon {
  width: 30rpx;
  font-size: 20rpx;
  color: #666;
  margin-right: 16rpx;
}

.dept-info {
  display: flex;
  flex-direction: column;
  margin-right: 16rpx;
}

.dept-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.dept-code {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.dept-user-count {
  font-size: 24rpx;
  color: #666;
  margin-right: 16rpx;
}

.dept-manager-info {
  margin-bottom: 12rpx;
  padding-left: 46rpx; /* 对齐展开图标 */
}

.dept-manager {
  font-size: 22rpx;
  color: #999;
}

.dept-status {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  margin-right: auto;
}

.status-active {
  background: #e8f5e8;
  color: #52c41a;
}

.status-inactive {
  background: #fff2e8;
  color: #fa8c16;
}

.dept-actions {
  display: flex;
  gap: 12rpx;
  padding-left: 46rpx; /* 对齐展开图标 */
  flex-wrap: wrap;
}

.dept-children {
  background: white;
  padding: 20rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.empty-text {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  display: block;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .filter-row {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .user-item {
    flex-direction: column;
    align-items: center;
    padding: 25rpx 20rpx;
    text-align: center;
  }
  
  .user-left {
    margin-right: 0;
    margin-bottom: 20rpx;
    align-items: center;
  }
  
  .user-avatar-container {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-bottom: 0;
  }
  
  .user-info {
    margin-right: 0;
    margin-bottom: 20rpx;
    width: 100%;
    text-align: center;
  }
  
  .user-name-row {
    justify-content: center;
    text-align: center;
  }
  
  .user-details {
    align-items: center;
    text-align: center;
  }
  
  .user-meta {
    align-items: center;
    text-align: center;
  }
  
  .meta-item {
    justify-content: center;
  }
  
  .user-actions {
    flex-direction: row;
    justify-content: center;
    width: 100%;
    margin-top: 20rpx;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .action-btn.small {
    flex: 1;
    max-width: 120rpx;
  }
}

/* 超小屏幕适配 */
@media (max-width: 600rpx) {
  .page-header {
    padding: 40rpx 20rpx 30rpx;
  }
  
  .header-title {
    font-size: 36rpx;
  }
  
  .tab-content {
    padding: 20rpx;
  }
  
  .search-section {
    padding: 20rpx;
  }
  
  .user-item {
    padding: 20rpx 15rpx;
  }
  
  .user-name {
    font-size: 26rpx;
  }
  
  .user-phone,
  .user-dept {
    font-size: 22rpx;
  }
  
  .meta-label,
  .meta-value {
    font-size: 18rpx;
  }
}

/* 重置密码弹窗样式 */
.modal-overlay {
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
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: #f5f5f5;
  color: #666;
  border-radius: 50%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.user-info {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.form-group {
  margin-bottom: 24rpx;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.input-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4rpx;
}

.input-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2rpx solid #e2e8f0;
  border-radius: 10rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  min-height: 80rpx;
}

.input-field.focused {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  transform: translateY(-1rpx);
}

.input-field.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 4rpx rgba(229, 62, 62, 0.1);
}

.input-text {
  flex: 1;
  width: 100%;
  padding: 18rpx 14rpx;
  border: none;
  outline: none;
  font-size: 24rpx;
  color: #2d3748;
  background: transparent;
  line-height: 1.4;
  box-sizing: border-box;
}

.input-text::placeholder {
  color: #a0aec0;
  font-size: 22rpx;
}

.visibility-toggle {
  position: absolute;
  right: 10rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 50rpx;
  height: 50rpx;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 2;
}

.visibility-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
}

.visibility-toggle:active {
  transform: translateY(-50%) scale(0.95);
}

.toggle-icon {
  font-size: 24rpx;
  color: #718096;
  transition: color 0.2s ease;
}

.visibility-toggle:hover .toggle-icon {
  color: #667eea;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rpx;
  min-height: 24rpx;
}

.error-message {
  color: #e53e3e;
  font-size: 20rpx;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
}

.success-message {
  color: #38a169;
  font-size: 20rpx;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
}

.char-count {
  color: #718096;
  font-size: 18rpx;
  font-weight: 500;
  text-align: right;
  min-width: 60rpx;
  background: #f7fafc;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  border: 1rpx solid #e2e8f0;
}

.password-strength {
  margin-top: 8rpx;
  padding: 10rpx;
  background: #f8fafc;
  border-radius: 8rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.strength-label {
  font-size: 20rpx;
  font-weight: 600;
  color: #4a5568;
}

.strength-bar {
  display: flex;
  gap: 3rpx;
  height: 5rpx;
  background: #e2e8f0;
  border-radius: 2rpx;
  overflow: hidden;
}

.strength-segment {
  flex: 1;
  height: 100%;
  border-radius: 2rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
}

.strength-segment.empty {
  background: #e2e8f0;
}

.strength-segment.weak {
  background: linear-gradient(90deg, #fc8181, #f56565);
}

.strength-segment.fair {
  background: linear-gradient(90deg, #f6ad55, #ed8936);
}

.strength-segment.good {
  background: linear-gradient(90deg, #63b3ed, #4299e1);
}

.strength-segment.strong {
  background: linear-gradient(90deg, #68d391, #48bb78);
}

.strength-text {
  font-size: 18rpx;
  font-weight: 600;
  text-align: center;
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  min-width: 60rpx;
}

.password-tips {
  background: #f0f8ff;
  border: 2rpx solid #bee3f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.tips-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #3182ce;
  margin-bottom: 15rpx;
  display: block;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.tip-dot {
  font-size: 20rpx;
  color: #3182ce;
}

.tip-text {
  font-size: 22rpx;
  color: #4a5568;
  line-height: 1.4;
}

.modal-footer {
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 20rpx 40rpx;
  border: 2rpx solid #e9ecef;
  background: white;
  color: #666;
  border-radius: 12rpx;
  font-size: 26rpx;
  min-width: 120rpx;
}

.btn-confirm {
  padding: 20rpx 40rpx;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12rpx;
  font-size: 26rpx;
  min-width: 120rpx;
  font-weight: 500;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
