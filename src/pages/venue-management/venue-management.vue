<template>
  <view class="venue-management">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">❮</text>
        </button>
        <text class="header-title">场地管理</text>
        <button class="add-btn" @click="showAddModal">
          <text class="add-icon">+</text>
        </button>
      </view>
    </view>

    <!-- 搜索和筛选 -->
    <view class="search-section">
      <view class="search-bar">
        <input 
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索场地名称或编码"
          @input="handleSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
      
      <view class="filter-bar">
        <picker
          :value="selectedTypeIndex"
          :range="venueTypeOptions"
          range-key="label"
          @change="handleTypeFilter"
          class="type-filter"
        >
          <view class="filter-display">
            <text class="filter-text">{{ selectedTypeLabel }}</text>
            <text class="filter-icon">🏟️</text>
          </view>
        </picker>
        
        <picker
          :value="selectedStatusIndex"
          :range="statusOptions"
          range-key="label"
          @change="handleStatusFilter"
          class="status-filter"
        >
          <view class="filter-display">
            <text class="filter-text">{{ selectedStatusLabel }}</text>
            <text class="filter-icon">📊</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 场地列表 -->
    <view class="venue-list">
      <view 
        v-for="venue in filteredVenues" 
        :key="venue._id"
        class="venue-item"
        @click="viewVenueDetail(venue)"
      >
        <view class="venue-info">
          <view class="venue-header">
            <text class="venue-name">{{ venue.name }}</text>
            <view class="venue-status" :class="getStatusClass(venue.status)">
              <text>{{ getStatusText(venue.status) }}</text>
            </view>
          </view>
          
          <view class="venue-details">
            <text class="venue-code">编码: {{ venue.code }}</text>
            <text class="venue-type">{{ getTypeText(venue.type) }}</text>
            <text class="venue-capacity">容量: {{ venue.capacity }}人</text>
            <text class="venue-price">¥{{ venue.price }}/小时</text>
          </view>
          
          <view class="venue-location">
            <text class="location-text">{{ venue.location }}</text>
          </view>
        </view>
        
        <view class="venue-actions">
          <button 
            class="action-btn edit" 
            @click.stop="editVenue(venue)"
          >
            <text class="btn-text">编辑</text>
          </button>
          <button 
            class="action-btn delete" 
            @click.stop="deleteVenue(venue)"
          >
            <text class="btn-text">删除</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredVenues.length === 0 && !isLoading" class="empty-state">
      <text class="empty-icon">🏟️</text>
      <text class="empty-title">暂无场地</text>
      <text class="empty-desc">点击右上角"+"添加场地</text>
    </view>

    <!-- 加载状态 -->
    <LoadingSpinner 
      v-if="isLoading" 
      type="wave" 
      text="加载场地中..."
      size="large"
    />

    <!-- 错误状态 -->
    <ErrorBoundary v-if="error" :error-title="error" @retry="handleRetry" />

    <!-- 添加/编辑场地弹窗 -->
    <VenueEditModal
      v-if="showEditModal"
      :venue="editingVenue"
      :is-edit="isEditMode"
      @save="handleSaveVenue"
      @cancel="handleCancelEdit"
    />

    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteModal" class="modal-overlay" @click="handleCancelDelete">
      <view class="delete-modal" @click.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-content">确定要删除场地"{{ deletingVenue?.name }}"吗？</text>
        <text class="modal-warning">此操作不可撤销！</text>
        
        <view class="modal-actions">
          <button class="cancel-btn" @click="handleCancelDelete">
            <text class="btn-text">取消</text>
          </button>
          <button class="confirm-btn" @click="handleConfirmDelete">
            <text class="btn-text">删除</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import VenueEditModal from '@/components/VenueEditModal.vue'
import { debounce } from '@/utils/apiCache'

export default {
  name: 'VenueManagement',
  components: {
    LoadingSpinner,
    ErrorBoundary,
    VenueEditModal
  },
  setup() {
    const { request } = useApi()
    
    // 响应式数据
    const venues = ref([])
    const isLoading = ref(false)
    const error = ref('')
    const searchKeyword = ref('')
    const selectedTypeIndex = ref(0)
    const selectedStatusIndex = ref(0)
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
    const editingVenue = ref(null)
    const deletingVenue = ref(null)
    const isEditMode = ref(false)
    
    // 场地类型选项
    const venueTypeOptions = ref([
      { value: '', label: '全部类型' },
      { value: 'badminton', label: '羽毛球' },
      { value: 'pingpong', label: '乒乓球' },
      { value: 'basketball', label: '篮球' },
      { value: 'meeting', label: '会议室' },
      { value: 'other', label: '其他' }
    ])
    
    // 状态选项
    const statusOptions = ref([
      { value: '', label: '全部状态' },
      { value: 'open', label: '开放' },
      { value: 'closed', label: '关闭' },
      { value: 'maintenance', label: '维护中' }
    ])
    
    // 计算属性
    const selectedType = computed(() => {
      return venueTypeOptions.value[selectedTypeIndex.value]?.value || ''
    })
    
    const selectedTypeLabel = computed(() => {
      return venueTypeOptions.value[selectedTypeIndex.value]?.label || '全部类型'
    })
    
    const selectedStatus = computed(() => {
      return statusOptions.value[selectedStatusIndex.value]?.value || ''
    })
    
    const selectedStatusLabel = computed(() => {
      return statusOptions.value[selectedStatusIndex.value]?.label || '全部状态'
    })
    
    const filteredVenues = computed(() => {
      let filtered = venues.value
      
      // 按关键词筛选
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(venue => 
          venue.name.toLowerCase().includes(keyword) ||
          venue.code.toLowerCase().includes(keyword) ||
          venue.location.toLowerCase().includes(keyword)
        )
      }
      
      // 按类型筛选
      if (selectedType.value) {
        filtered = filtered.filter(venue => venue.type === selectedType.value)
      }
      
      // 按状态筛选
      if (selectedStatus.value) {
        filtered = filtered.filter(venue => venue.status === selectedStatus.value)
      }
      
      return filtered
    })
    
    // 获取场地列表
    const loadVenues = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        const response = await request({
          url: '/api/admin/venues',
          method: 'GET'
        })
        
        if (response.success) {
          venues.value = response.data.venues || []
        } else {
          throw new Error(response.message || '获取场地列表失败')
        }
      } catch (err) {
        console.error('加载场地列表失败:', err)
        error.value = err.message || '加载场地列表失败'
      } finally {
        isLoading.value = false
      }
    }
    
    // 搜索处理（防抖）
    const handleSearch = debounce(() => {
      // 搜索逻辑在计算属性中处理
    }, 300)
    
    // 类型筛选
    const handleTypeFilter = (e) => {
      selectedTypeIndex.value = e.detail.value
    }
    
    // 状态筛选
    const handleStatusFilter = (e) => {
      selectedStatusIndex.value = e.detail.value
    }
    
    // 获取状态样式类
    const getStatusClass = (status) => {
      return `status-${status}`
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'open': '开放',
        'closed': '关闭',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知状态'
    }
    
    // 获取类型文本
    const getTypeText = (type) => {
      const typeMap = {
        'badminton': '羽毛球',
        'pingpong': '乒乓球',
        'basketball': '篮球',
        'meeting': '会议室',
        'other': '其他'
      }
      return typeMap[type] || '未知类型'
    }
    
    // 查看场地详情
    const viewVenueDetail = (venue) => {
      uni.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venue._id}&mode=management`
      })
    }
    
    // 显示添加弹窗
    const showAddModal = () => {
      editingVenue.value = null
      isEditMode.value = false
      showEditModal.value = true
    }
    
    // 编辑场地
    const editVenue = (venue) => {
      editingVenue.value = { ...venue }
      isEditMode.value = true
      showEditModal.value = true
    }
    
    // 删除场地
    const deleteVenue = (venue) => {
      deletingVenue.value = venue
      showDeleteModal.value = true
    }
    
    // 保存场地
    const handleSaveVenue = async (venueData) => {
      try {
        const url = isEditMode.value 
          ? `/api/admin/venues/${venueData._id}`
          : '/api/admin/venues'
        const method = isEditMode.value ? 'PUT' : 'POST'
        
        const response = await request({
          url,
          method,
          data: venueData
        })
        
        if (response.success) {
          uni.showToast({
            title: isEditMode.value ? '更新成功' : '添加成功',
            icon: 'success'
          })
          
          showEditModal.value = false
          await loadVenues() // 重新加载列表
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (err) {
        console.error('保存场地失败:', err)
        uni.showToast({
          title: err.message || '保存失败',
          icon: 'error'
        })
      }
    }
    
    // 取消编辑
    const handleCancelEdit = () => {
      showEditModal.value = false
      editingVenue.value = null
    }
    
    // 确认删除
    const handleConfirmDelete = async () => {
      try {
        const response = await request({
          url: `/api/admin/venues/${deletingVenue.value._id}`,
          method: 'DELETE'
        })
        
        if (response.success) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          showDeleteModal.value = false
          await loadVenues() // 重新加载列表
        } else {
          throw new Error(response.message || '删除失败')
        }
      } catch (err) {
        console.error('删除场地失败:', err)
        uni.showToast({
          title: err.message || '删除失败',
          icon: 'error'
        })
      }
    }
    
    // 取消删除
    const handleCancelDelete = () => {
      showDeleteModal.value = false
      deletingVenue.value = null
    }
    
    // 重试
    const handleRetry = () => {
      loadVenues()
    }
    
    // 返回
    const goBack = () => {
      uni.navigateBack()
    }
    
    // 监听搜索关键词变化
    watch(searchKeyword, () => {
      handleSearch()
    })
    
    // 页面加载
    onMounted(() => {
      loadVenues()
    })
    
    return {
      // 数据
      venues,
      isLoading,
      error,
      searchKeyword,
      selectedTypeIndex,
      selectedStatusIndex,
      showEditModal,
      showDeleteModal,
      editingVenue,
      deletingVenue,
      isEditMode,
      venueTypeOptions,
      statusOptions,
      
      // 计算属性
      selectedType,
      selectedTypeLabel,
      selectedStatus,
      selectedStatusLabel,
      filteredVenues,
      
      // 方法
      handleSearch,
      handleTypeFilter,
      handleStatusFilter,
      getStatusClass,
      getStatusText,
      getTypeText,
      viewVenueDetail,
      showAddModal,
      editVenue,
      deleteVenue,
      handleSaveVenue,
      handleCancelEdit,
      handleConfirmDelete,
      handleCancelDelete,
      handleRetry,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.venue-management {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn,
.add-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}

.back-icon,
.add-icon {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.header-title {
  color: white;
  font-size: 36rpx;
  font-weight: 600;
}

/* 搜索和筛选 */
.search-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 40rpx;
  padding: 0 60rpx 0 30rpx;
  font-size: 28rpx;
  color: #333;
  
  &:focus {
    border-color: #667eea;
    background: white;
  }
}

.search-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #666;
}

.filter-bar {
  display: flex;
  gap: 20rpx;
}

.type-filter,
.status-filter {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.filter-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-text {
  font-size: 26rpx;
  color: #333;
}

.filter-icon {
  font-size: 24rpx;
  color: #666;
}

/* 场地列表 */
.venue-list {
  padding: 0 20rpx;
}

.venue-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);
  }
}

.venue-info {
  flex: 1;
  margin-right: 20rpx;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.venue-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.venue-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  
  &.status-open {
    background: #d4edda;
    color: #155724;
  }
  
  &.status-closed {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.status-maintenance {
    background: #fff3cd;
    color: #856404;
  }
}

.venue-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.venue-code,
.venue-type,
.venue-capacity,
.venue-price {
  font-size: 24rpx;
  color: #666;
  
  &.venue-price {
    color: #e74c3c;
    font-weight: 600;
  }
}

.venue-location {
  margin-top: 10rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999;
}

.venue-actions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.action-btn {
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  
  &.edit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.delete {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.btn-text {
  color: inherit;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  background: white;
  border-radius: 16rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  display: block;
}

.empty-title {
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 15rpx;
  display: block;
}

.empty-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 删除确认弹窗 */
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

.delete-modal {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 40rpx;
  max-width: 600rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 36rpx;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.modal-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15rpx;
  display: block;
}

.modal-warning {
  font-size: 24rpx;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 40rpx;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  
  &.cancel-btn {
    background: #f8f9fa;
    color: #666;
    border: 2rpx solid #e9ecef;
  }
  
  &.confirm-btn {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .venue-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .venue-info {
    margin-right: 0;
    margin-bottom: 20rpx;
  }
  
  .venue-actions {
    flex-direction: row;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .filter-bar {
    flex-direction: column;
  }
}
</style>
