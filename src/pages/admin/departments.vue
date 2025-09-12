<template>
  <view class="departments-admin-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">部门管理</text>
      <text class="page-subtitle">管理系统部门架构和成员</text>
    </view>

    <!-- 部门列表 -->
    <view class="departments-section">
      <view class="section-header">
        <text class="section-title">部门列表</text>
        <button class="add-dept-btn" @click="addDepartment">
          <text class="btn-icon">+</text>
          <text>新建部门</text>
        </button>
      </view>

      <!-- 部门卡片列表 -->
      <view class="departments-grid">
        <view 
          v-for="department in departmentsList" 
          :key="department._id"
          class="department-card"
          @click="viewDepartmentDetail(department)"
        >
          <view class="dept-header">
            <view class="dept-info">
              <text class="dept-name">{{ department.name }}</text>
              <text class="dept-code">{{ department.code }}</text>
            </view>
            <view class="dept-status" :class="department.status">
              {{ getStatusText(department.status) }}
            </view>
          </view>

          <view class="dept-description">
            <text>{{ department.description }}</text>
          </view>

          <view class="dept-stats">
            <view class="stat-item">
              <text class="stat-label">成员数量</text>
              <text class="stat-value">{{ department.memberCount || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">管理员</text>
              <text class="stat-value">{{ department.manager?.name || '未设置' }}</text>
            </view>
          </view>

          <view class="dept-actions">
            <button class="action-btn small" @click.stop="editDepartment(department)">
              编辑
            </button>
            <button class="action-btn small secondary" @click.stop="viewMembers(department)">
              成员
            </button>
            <button class="action-btn small danger" @click.stop="delete部门(department)">
              删除
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 部门详情弹窗 -->
    <uni-popup ref="departmentDetailPopup" type="center" :mask-click="false">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">部门详情</text>
          <button class="close-btn" @click="closeDepartmentDetail">×</button>
        </view>
        
        <view v-if="selectedDepartment" class="department-detail">
          <view class="detail-section">
            <text class="detail-label">部门名称</text>
            <text class="detail-value">{{ selectedDepartment.name }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">部门编码</text>
            <text class="detail-value">{{ selectedDepartment.code }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">部门描述</text>
            <text class="detail-value">{{ selectedDepartment.description }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">成员数量</text>
            <text class="detail-value">{{ selectedDepartment.memberCount || 0 }} 人</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">管理员</text>
            <text class="detail-value">{{ selectedDepartment.manager?.name || '未设置' }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">创建时间</text>
            <text class="detail-value">{{ formatDate(selectedDepartment.createTime) }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 部门成员弹窗 -->
    <uni-popup ref="membersPopup" type="center" :mask-click="false">
      <view class="popup-content large">
        <view class="popup-header">
          <text class="popup-title">部门成员</text>
          <button class="close-btn" @click="closeMembersPopup">×</button>
        </view>
        
        <view v-if="selectedDepartment" class="members-content">
          <view class="members-header">
            <text class="dept-name">{{ selectedDepartment.name }}</text>
            <text class="member-count">共 {{ departmentMembers.length }} 人</text>
          </view>
          
          <view class="members-list">
            <view 
              v-for="member in departmentMembers" 
              :key="member._id"
              class="member-item"
            >
              <view class="member-avatar">
                <UserAvatar :user="member" size="small" />
              </view>
              
              <view class="member-info">
                <text class="member-name">{{ member.nickName || member.realName }}</text>
                <text class="member-role">{{ getRoleText(member.role) }}</text>
                <text class="member-position">{{ member.position || '未设置' }}</text>
              </view>
              
              <view class="member-status" :class="member.status">
                {{ getStatusText(member.status) }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'DepartmentsAdmin',
  mixins: [timeMixin],
  components: {    UserAvatar,
  },
  data() {
    return {
      departmentsList: [],
      selectedDepartment: null,
      departmentMembers: [],
      loading: false
    }
  },
  mounted() {
    this.loadDepartments()
  },
  methods: {
    // 加载部门列表
    async loadDepartments() {
      try {
        this.loading = true
        const response = await api.admin.getDepartmentsList()
        if (response.success) {
          this.departmentsList = response.data || []
        } else {
          uni.showToast({
            title: response.message || '获取部门列表失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
        uni.showToast({
          title: '获取部门列表失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 查看部门详情
    async viewDepartmentDetail(department) {
      try {
        const response = await api.admin.getDepartmentDetail(department._id)
        if (response.success) {
          this.selectedDepartment = response.data
          this.$refs.departmentDetailPopup.open()
        } else {
          uni.showToast({
            title: response.message || '获取部门详情失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取部门详情失败:', error)
        uni.showToast({
          title: '获取部门详情失败',
          icon: 'error'
        })
      }
    },

    // 查看部门成员
    async viewMembers(department) {
      try {
        this.selectedDepartment = department
        const response = await api.admin.getDepartmentMembers(department._id)
        if (response.success) {
          this.departmentMembers = response.data.list || []
          this.$refs.membersPopup.open()
        } else {
          uni.showToast({
            title: response.message || '获取部门成员失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('获取部门成员失败:', error)
        uni.showToast({
          title: '获取部门成员失败',
          icon: 'error'
        })
      }
    },

    // 添加部门
    add部门() {
      uni.switchtab({
        url: '/pages/admin/department-edit?action=create'
      })
    },

    // 编辑部门
    editDepartment(department) {
      uni.switchtab({
        url: `/pages/admin/department-edit?action=edit&id=${department._id}`
      })
    },

    // 删除部门
    async delete部门(department) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除部门"${department.name}"吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.deleteDepartment(department._id)
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadDepartments()
              } else {
                uni.showToast({
                  title: response.message || '删除失败',
                  icon: 'error'
                })
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

    // 关闭部门详情弹窗
    closeDepartmentDetail() {
      this.$refs.departmentDetailPopup.close()
      this.selectedDepartment = null
    },

    // 关闭成员弹窗
    closeMembersPopup() {
      this.$refs.membersPopup.close()
      this.selectedDepartment = null
      this.departmentMembers = []
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        active: 'normal',
        inactive: '禁用'
      }
      return statusMap[status] || status
    },

    // 获取角色文本
    getRoleText(role) {
      const roleMap = {
        user: '普通用户',
        dept_admin: '部门管理员',
        sys_admin: '系统管理员',
        verifier: '验证员'
      }
      return roleMap[role] || role
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未知'
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateString)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.departments-admin-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 40rpx;
  text-align: center;
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
  color: #666;
}

.departments-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.add-dept-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-dept-btn:active {
  transform: translateY(2rpx);
}

.btn-icon {
  font-size: 28rpx;
  font-weight: bold;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400rpx, 1fr));
  gap: 24rpx;
}

.department-card {
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 24rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.department-card:hover {
  border-color: #667eea;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.15);
  transform: translateY(-2rpx);
}

.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.dept-info {
  flex: 1;
}

.dept-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}

.dept-code {
  font-size: 22rpx;
  color: #666;
  background: #f8f9fa;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
}

.dept-status {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.dept-status.active {
  background: #d4edda;
  color: #155724;
}

.dept-status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.dept-description {
  margin-bottom: 20rpx;
  color: #666;
  font-size: 24rpx;
  line-height: 1.5;
}

.dept-stats {
  display: flex;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #999;
}

.stat-value {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.dept-actions {
  display: flex;
  gap: 12rpx;
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

.action-btn:not(.secondary):not(.danger) {
  background: #667eea;
  color: white;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.danger {
  background: #dc3545;
  color: white;
}

.action-btn:active {
  transform: translateY(1rpx);
}

/* 弹窗样式 */
.popup-content {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-content.large {
  width: 800rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #e9ecef;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  font-size: 32rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.department-detail {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.members-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #e9ecef;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
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
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
}

.member-role {
  font-size: 20rpx;
  color: #667eea;
  background: #e3f2fd;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  align-self: flex-start;
}

.member-position {
  font-size: 20rpx;
  color: #666;
}

.member-status {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
  font-weight: 500;
}

.member-status.active {
  background: #d4edda;
  color: #155724;
}

.member-status.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .departments-grid {
    grid-template-columns: 1fr;
  }
  
  .popup-content {
    width: 90vw;
  }
  
  .popup-content.large {
    width: 95vw;
  }
}
</style>
