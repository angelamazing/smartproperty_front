<template>
  <view class="notices-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">公告管理</view>
      <view class="header-subtitle">管理系统公告，支持时间段公告，只需填写日期即可</view>
    </view>

    <!-- 操作工具栏 -->
    <view class="toolbar">
      <!-- 搜索和筛选 -->
      <view class="search-section">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索公告标题、内容"
          @input="onSearchInput"
          @confirm="searchNotices"
        />
        <button class="search-btn" @click="searchNotices">🔍</button>
      </view>

      <view class="filter-section">
        <picker 
          class="filter-picker" 
          :value="selectedTypeIndex" 
          :range="typeOptions" 
          range-key="name"
          @change="onTypeChange"
        >
          <view class="picker-text">
            {{ selectedTypeIndex >= 0 ? typeOptions[selectedTypeIndex].name : '全部类型' }}
          </view>
        </picker>

        <picker 
          class="filter-picker" 
          :value="selectedStatusIndex" 
          :range="statusOptions" 
          range-key="name"
          @change="onStatusChange"
        >
          <view class="picker-text">
            {{ selectedStatusIndex >= 0 ? statusOptions[selectedStatusIndex].name : '全部状态' }}
          </view>
        </picker>

        <picker 
          class="filter-picker" 
          :value="selectedTimeTypeIndex" 
          :range="timeTypeOptions" 
          range-key="name"
          @change="onTimeTypeChange"
        >
          <view class="picker-text">
            {{ selectedTimeTypeIndex >= 0 ? timeTypeOptions[selectedTimeTypeIndex].name : '时间类型' }}
          </view>
        </picker>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn primary" @click="openCreateModal">
          <text class="btn-icon">+</text>
          <text>新建公告</text>
        </button>
        <button class="action-btn secondary" @click="showBatchActions" :disabled="!hasSelectedNotices">
          批量操作 ({{ selectedNotices.length }})
        </button>
      </view>
    </view>

    <!-- 公告列表 -->
    <view class="notices-content">
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view v-else-if="notices.length === 0" class="empty-state">
        <text class="empty-icon">📢</text>
        <text class="empty-text">暂无公告</text>
        <text class="empty-hint">点击"新建公告"开始添加</text>
      </view>

      <view v-else class="notices-list">
        <!-- 列表头部 -->
        <view class="list-header">
          <checkbox 
            class="select-all-checkbox" 
            :checked="isAllSelected"
            @change="toggleSelectAll"
            value="all"
          />
          <text class="header-label">全选</text>
          <text class="notice-count">共 {{ total }} 条公告</text>
        </view>

        <!-- 公告列表项 -->
        <view 
          v-for="notice in notices" 
          :key="notice._id || notice.id"
          class="notice-item"
          :class="{ selected: selectedNotices.includes(notice._id || notice.id) }"
        >
          <!-- 选择框 -->
          <view class="notice-selector">
            <checkbox 
              :value="notice._id || notice.id"
              :checked="selectedNotices.includes(notice._id || notice.id)"
              @change="onNoticeSelect"
              :data-id="notice._id || notice.id"
            />
          </view>

          <!-- 公告信息 -->
          <view class="notice-info" @click="viewNoticeDetail(notice)">
            <view class="notice-main">
              <view class="notice-header">
                <text class="notice-title">{{ notice.title }}</text>
                <view class="notice-badges">
                  <view v-if="notice.isSticky" class="badge sticky">置顶</view>
                  <view class="badge type" :class="getTypeClass(notice.type)">
                    {{ getTypeText(notice.type) }}
                  </view>
                  <view class="badge priority" :class="getPriorityClass(notice.priority)">
                    优先级 {{ notice.priority || 0 }}
                  </view>
                </view>
              </view>
              
              <view class="notice-content">
                <text class="notice-description">{{ notice.content || '暂无内容' }}</text>
              </view>

              <view class="notice-meta">
                <view class="time-info">
                  <text class="time-label">生效时间：</text>
                  <text class="time-range">{{ formatTimeRange(notice.startTime, notice.endTime) }}</text>
                </view>
                <view class="publish-info">
                  <text class="publisher">发布者：{{ notice.publisherName || '未知' }}</text>
                  <text class="publish-time">{{ formatDate(notice.publishTime || notice.createTime) }}</text>
                </view>
              </view>
            </view>
            
            <view class="notice-status">
              <view class="status-indicator" :class="getStatusClass(notice.status)">
                <text class="status-text">{{ getStatusText(notice.status) }}</text>
              </view>
              <text class="view-count">浏览 {{ notice.viewCount || 0 }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="notice-actions">
            <button class="action-btn edit" @click="editNotice(notice)">编辑</button>
            <button 
              class="action-btn" 
              :class="notice.status === 'published' ? 'warning' : 'success'"
              @click="toggleNoticeStatus(notice)"
            >
              {{ notice.status === 'published' ? '下线' : '发布' }}
            </button>
            <button class="action-btn danger" @click="deleteNotice(notice)">删除</button>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view v-if="total > pageSize" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        <button 
          class="page-btn" 
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </view>
    </view>

    <!-- 新建/编辑公告弹窗 -->
    <NoticeEditModal
      :visible="showNoticeModal"
      :notice="currentNotice"
      :isEdit="isEdit"
      @close="closeNoticeModal"
      @save="handleSaveNotice"
    />

    <!-- 批量操作弹窗 -->
    <view v-if="showBatchModal" class="modal-overlay" @click="closeBatchModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">批量操作</text>
          <button class="close-btn" @click="closeBatchModal">✕</button>
        </view>

        <view class="modal-body">
          <view class="batch-info">
            <text>已选择 {{ selectedNotices.length }} 条公告</text>
          </view>

          <view class="batch-actions">
            <button class="batch-btn success" @click="batchUpdateStatus('published')">批量发布</button>
            <button class="batch-btn warning" @click="batchUpdateStatus('draft')">批量下线</button>
            <button class="batch-btn danger" @click="batchDelete">批量删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import timeMixin from '@/mixins/timeMixin.js'
import NoticeEditModal from '@/components/NoticeEditModal.vue'

export default {
  name: 'NoticesManagement',
  mixins: [timeMixin],
  components: {
    NoticeEditModal
  },
  data() {
    return {
      // 搜索和筛选
      searchKeyword: '',
      selectedTypeIndex: -1,
      selectedStatusIndex: -1,
      selectedTimeTypeIndex: -1,
      
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      
      // 数据
      notices: [],
      loading: false,
      
      // 选择状态
      selectedNotices: [],
      
      // 弹窗状态
      showNoticeModal: false,
      showBatchModal: false,
      isEdit: false,
      currentNotice: null,
      
      // 防抖定时器
      searchTimer: null
    }
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    
    hasSelectedNotices() {
      return this.selectedNotices.length > 0
    },
    
    isAllSelected() {
      return this.notices.length > 0 && this.selectedNotices.length === this.notices.length
    },
    
    typeOptions() {
      return [
        { value: '', name: '全部类型' },
        { value: 'info', name: '信息' },
        { value: 'warning', name: '警告' },
        { value: 'error', name: '错误' },
        { value: 'success', name: '成功' }
      ]
    },
    
    statusOptions() {
      return [
        { value: '', name: '全部状态' },
        { value: 'draft', name: '草稿' },
        { value: 'published', name: '已发布' },
        { value: 'archived', name: '已存档' }
      ]
    },
    
    timeTypeOptions() {
      return [
        { value: '', name: '全部' },
        { value: 'permanent', name: '永久公告' },
        { value: 'temporary', name: '时间段公告' },
        { value: 'expired', name: '已过期' }
      ]
    }
  },
  
  onLoad() {
    this.checkAdminPermission()
    this.loadNotices()
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
     * 加载公告列表
     */
    async loadNotices() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword.trim(),
          type: this.selectedTypeIndex >= 0 ? this.typeOptions[this.selectedTypeIndex].value : '',
          status: this.selectedStatusIndex >= 0 ? this.statusOptions[this.selectedStatusIndex].value : '',
          timeType: this.selectedTimeTypeIndex >= 0 ? this.timeTypeOptions[this.selectedTimeTypeIndex].value : ''
        }
        
        const response = await api.admin.getNoticesList(params)
        if (response && response.success) {
          this.notices = response.data.records || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载公告失败:', error)
        uni.showToast({
          title: '加载公告失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索和筛选
     */
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.loadNotices()
      }, 500)
    },

    searchNotices() {
      this.currentPage = 1
      this.loadNotices()
    },

    onTypeChange(e) {
      this.selectedTypeIndex = e.detail.value
      this.currentPage = 1
      this.loadNotices()
    },

    onStatusChange(e) {
      this.selectedStatusIndex = e.detail.value
      this.currentPage = 1
      this.loadNotices()
    },

    onTimeTypeChange(e) {
      this.selectedTimeTypeIndex = e.detail.value
      this.currentPage = 1
      this.loadNotices()
    },

    /**
     * 分页
     */
    changePage(page) {
      this.currentPage = page
      this.loadNotices()
    },

    /**
     * 选择操作
     */
    toggleSelectAll(e) {
      const isChecked = e.detail.value && e.detail.value.length > 0
      if (isChecked) {
        this.selectedNotices = this.notices.map(notice => notice._id || notice.id)
      } else {
        this.selectedNotices = []
      }
    },

    onNoticeSelect(e) {
      const noticeIds = e.detail.value
      const isSelected = noticeIds && noticeIds.length > 0
      const noticeId = noticeIds[0] || e.currentTarget.dataset.id
      
      if (isSelected && !this.selectedNotices.includes(noticeId)) {
        this.selectedNotices.push(noticeId)
      } else if (!isSelected && this.selectedNotices.includes(noticeId)) {
        this.selectedNotices = this.selectedNotices.filter(id => id !== noticeId)
      }
    },

    /**
     * 公告操作
     */
    openCreateModal() {
      this.isEdit = false
      this.currentNotice = null
      this.showNoticeModal = true
    },

    editNotice(notice) {
      this.isEdit = true
      this.currentNotice = notice
      this.showNoticeModal = true
    },

    async handleSaveNotice(noticeData) {
      try {
        let response
        if (this.isEdit) {
          response = await api.admin.updateNotice(this.currentNotice._id || this.currentNotice.id, noticeData)
        } else {
          response = await api.admin.createNotice(noticeData)
        }

        if (response && response.success) {
          uni.showToast({
            title: this.isEdit ? '公告修改成功' : '公告创建成功',
            icon: 'success'
          })
          this.closeNoticeModal()
          this.loadNotices()
        }
      } catch (error) {
        console.error('保存公告失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      }
    },

    async toggleNoticeStatus(notice) {
      try {
        const newStatus = notice.status === 'published' ? 'draft' : 'published'
        const actionText = newStatus === 'published' ? '发布' : '下线'
        
        const result = await uni.showModal({
          title: `确认${actionText}`,
          content: `确定要${actionText}公告"${notice.title}"吗？`,
          confirmText: actionText,
          confirmColor: '#667eea'
        })
        
        if (result.confirm) {
          const response = await api.admin.updateNoticeStatus(notice._id || notice.id, newStatus)
          if (response && response.success) {
            uni.showToast({
              title: `${actionText}成功`,
              icon: 'success'
            })
            this.loadNotices()
          }
        }
      } catch (error) {
        console.error('更新公告状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    },

    async deleteNotice(notice) {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: `确定要删除公告"${notice.title}"吗？`,
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          const response = await api.admin.deleteNotice(notice._id || notice.id)
          if (response && response.success) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadNotices()
          }
        }
      } catch (error) {
        console.error('删除公告失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },

    /**
     * 批量操作
     */
    showBatchActions() {
      this.showBatchModal = true
    },

    async batchUpdateStatus(status) {
      try {
        const statusText = status === 'published' ? '发布' : '下线'
        const result = await uni.showModal({
          title: '确认操作',
          content: `确定要${statusText}选中的 ${this.selectedNotices.length} 条公告吗？`,
          confirmText: statusText,
          confirmColor: '#667eea'
        })
        
        if (result.confirm) {
          const response = await api.admin.batchUpdateNoticeStatus(this.selectedNotices, status)
          if (response && response.success) {
            uni.showToast({
              title: `${statusText}成功`,
              icon: 'success'
            })
            this.selectedNotices = []
            this.closeBatchModal()
            this.loadNotices()
          }
        }
      } catch (error) {
        console.error('批量更新状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    },

    async batchDelete() {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: `确定要删除选中的 ${this.selectedNotices.length} 条公告吗？此操作不可恢复！`,
          confirmText: '删除',
          confirmColor: '#e74c3c'
        })
        
        if (result.confirm) {
          for (const noticeId of this.selectedNotices) {
            try {
              await api.admin.deleteNotice(noticeId)
            } catch (error) {
              console.error(`删除公告 ${noticeId} 失败:`, error)
            }
          }
          
          uni.showToast({
            title: '批量删除成功',
            icon: 'success'
          })
          this.selectedNotices = []
          this.closeBatchModal()
          this.loadNotices()
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },

    /**
     * 弹窗控制
     */
    closeNoticeModal() {
      this.showNoticeModal = false
      this.currentNotice = null
    },

    closeBatchModal() {
      this.showBatchModal = false
    },

    /**
     * 工具方法
     */
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      try {
        return this.$formatDate(dateStr)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知'
      }
    },

    formatTimeRange(startTime, endTime) {
      if (!startTime && !endTime) {
        return '永久有效'
      }
      
      if (startTime && endTime) {
        const start = this.formatDate(startTime)
        const end = this.formatDate(endTime)
        
        if (start === end) {
          return start // 同一天
        } else {
          return `${start} 至 ${end}`
        }
      }
      
      if (startTime) {
        return `从 ${this.formatDate(startTime)} 开始`
      }
      
      if (endTime) {
        return `至 ${this.formatDate(endTime)} 结束`
      }
      
      return '未设置'
    },

    getTypeText(type) {
      const typeMap = {
        'info': '信息',
        'warning': '警告',
        'error': '错误',
        'success': '成功'
      }
      return typeMap[type] || '信息'
    },

    getTypeClass(type) {
      return `type-${type || 'info'}`
    },

    getStatusText(status) {
      const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'archived': '已存档'
      }
      return statusMap[status] || '未知'
    },

    getStatusClass(status) {
      return `status-${status || 'draft'}`
    },

    getPriorityClass(priority) {
      const level = priority || 0
      if (level >= 8) return 'priority-high'
      if (level >= 5) return 'priority-medium'
      return 'priority-low'
    },

    viewNoticeDetail(notice) {
      console.log('查看公告详情:', notice)
      // 可以跳转到公告详情页面
    }
  }
}
</script>

<style lang="scss" scoped>
.notices-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx;
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

/* 操作工具栏 */
.toolbar {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.search-section {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.search-section:focus-within {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.search-input {
  flex: 1;
  padding: 8rpx 16rpx;
  font-size: 28rpx;
  background: none;
  border: none;
  outline: none;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-btn {
  width: 72rpx;
  height: 72rpx;
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

.filter-section {
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-wrap: wrap;
}

.filter-picker {
  flex: 1;
  min-width: 200rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  border: 2rpx solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.filter-picker:active {
  background: #e9ecef;
  border-color: #667eea;
}

.picker-text {
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-weight: 500;
  min-height: 76rpx;
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

.action-btn.secondary:disabled {
  background: #f8f9fa;
  color: #ccc;
  border-color: #e9ecef;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 28rpx;
  font-weight: bold;
}

/* 公告列表 */
.notices-content {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  color: #999;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid #f3f3f3;
  border-top: 8rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

.empty-state {
  text-align: center;
  padding: 80rpx 20rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
  display: block;
}

.empty-text {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
  color: #666;
}

.empty-hint {
  font-size: 24rpx;
  display: block;
  color: #999;
}

.notices-list {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #f8f9fa;
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

.notice-count {
  font-size: 24rpx;
  color: #666;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  border-bottom: 2rpx solid #f8f9fa;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-item.selected {
  background: #f0f4ff;
  border-left: 6rpx solid #667eea;
}

.notice-item:hover {
  background: #fafbfc;
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.notice-selector {
  flex-shrink: 0;
  width: 60rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8rpx;
}

.notice-selector checkbox {
  width: 32rpx;
  height: 32rpx;
  color: #667eea;
}

.notice-info {
  flex: 1;
  padding: 0 24rpx;
  min-width: 0;
  cursor: pointer;
}

.notice-main {
  width: 100%;
}

.notice-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.notice-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.notice-badges {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.badge {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: white;
  font-weight: 500;
  white-space: nowrap;
}

.badge.sticky {
  background: #e74c3c;
}

.badge.type {
  &.type-info {
    background: #3498db;
  }
  &.type-warning {
    background: #f39c12;
  }
  &.type-error {
    background: #e74c3c;
  }
  &.type-success {
    background: #27ae60;
  }
}

.badge.priority {
  &.priority-low {
    background: #95a5a6;
  }
  &.priority-medium {
    background: #f39c12;
  }
  &.priority-high {
    background: #e74c3c;
  }
}

.notice-content {
  margin-bottom: 16rpx;
}

.notice-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.time-info, .publish-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-label {
  color: #666;
  font-weight: 500;
}

.time-range {
  color: #667eea;
  font-weight: 500;
}

.publisher {
  color: #666;
}

.publish-time {
  color: #999;
}

.notice-status {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
  min-width: 120rpx;
}

.status-indicator {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: white;
  font-weight: 500;
  text-align: center;
  min-width: 80rpx;
}

.status-indicator.status-draft {
  background: #95a5a6;
}

.status-indicator.status-published {
  background: #27ae60;
}

.status-indicator.status-archived {
  background: #f39c12;
}

.view-count {
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.notice-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 120rpx;
  align-items: flex-end;
}

.notice-actions .action-btn {
  padding: 12rpx 20rpx;
  font-size: 22rpx;
  min-height: 56rpx;
  border-radius: 8rpx;
  gap: 6rpx;
  min-width: 80rpx;
  justify-content: center;
  white-space: nowrap;
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

.action-btn.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.3);
}

.action-btn.danger:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(231, 76, 60, 0.3);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx;
  background: #f8f9fa;
}

.page-btn {
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 26rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.page-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(102, 126, 234, 0.3);
}

.page-btn:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.page-info {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

/* 批量操作弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  background: #fafbfc;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
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
  transition: all 0.3s ease;
}

.close-btn:active {
  background: #e9ecef;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.batch-info {
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.batch-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.batch-btn {
  padding: 24rpx 30rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.batch-btn.success {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(39, 174, 96, 0.3);
}

.batch-btn.success:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(39, 174, 96, 0.3);
}

.batch-btn.warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(243, 156, 18, 0.3);
}

.batch-btn.warning:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(243, 156, 18, 0.3);
}

.batch-btn.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(231, 76, 60, 0.3);
}

.batch-btn.danger:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.3);
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .notices-list {
    padding: 10rpx;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .notice-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 20rpx;
  }
  
  .notice-selector {
    width: 100%;
    margin-bottom: 16rpx;
  }
  
  .notice-info {
    padding: 0;
    margin-bottom: 16rpx;
  }
  
  .notice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }
  
  .notice-badges {
    order: -1;
  }
  
  .notice-status {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .notice-actions {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 12rpx;
  }
  
  .notice-actions .action-btn {
    flex: 1;
    max-width: 120rpx;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
