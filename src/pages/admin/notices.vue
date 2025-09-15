<template>
  <view class="notices-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <view class="header-title">
          <text class="title-icon">📢</text>
          公告管理
        </view>
        <view class="header-subtitle">管理系统公告，包括发布、编辑、删除等操作</view>
      </view>
      <view class="header-stats" v-if="notices.length > 0">
        <view class="stat-item">
          <text class="stat-number">{{ notices.length }}</text>
          <text class="stat-label">总公告</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ selectedNotices.length }}</text>
          <text class="stat-label">已选择</text>
        </view>
      </view>
    </view>

    <!-- 操作工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <button class="action-btn primary" @click="createNotice">
          <text class="btn-icon">➕</text>
          <text>发布公告</text>
        </button>
        <button class="action-btn secondary" @click="refreshNotices" :disabled="loading">
          <text class="btn-icon" :class="{ spinning: loading }">🔄</text>
          <text>{{ loading ? '刷新中...' : '刷新' }}</text>
        </button>
        <button class="action-btn danger" @click="batch删除" v-if="selectedNotices.length > 0">
          <text class="btn-icon">🗑️</text>
          <text>批量删除 ({{ selectedNotices.length }})</text>
        </button>
      </view>
      
      <view class="toolbar-right">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索公告标题或内容..."
            @input="onSearch"
          />
          <button v-if="searchKeyword" class="clear-search" @click="clearSearch">✕</button>
        </view>
        
        <picker 
          class="filter-picker type-picker" 
          :value="selectedTypeIndex" 
          :range="noticeTypes" 
          range-key="name"
          @change="onTypeChange"
        >
          <view class="picker-content">
            <text class="picker-icon">📋</text>
            <text class="picker-text">{{ noticeTypes[selectedTypeIndex].name }}</text>
          </view>
        </picker>
        
        <picker 
          class="filter-picker status-picker" 
          :value="selectedStatusIndex" 
          :range="statusTypes" 
          range-key="name"
          @change="onStatusChange"
        >
          <view class="picker-content">
            <text class="picker-icon">📊</text>
            <text class="picker-text">{{ statusTypes[selectedStatusIndex].name }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 公告列表 -->
    <view class="notices-list">
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="notices.length === 0" class="empty-state">
        <text class="empty-icon">📢</text>
        <text class="empty-title">暂无公告</text>
        <text class="empty-desc">点击上方按钮发布第一条公告</text>
      </view>
      
      <view v-else class="notice-cards">
        <view 
          v-for="notice in filteredNotices" 
          :key="notice._id" 
          class="notice-card"
          :class="[
            notice.type, 
            { 
              selected: selectedNotices.includes(notice._id),
              sticky: notice.isSticky
            }
          ]"
          @click="toggleNoticeSelection(notice._id)"
        >
          <view class="notice-header">
            <view class="notice-selection">
              <checkbox 
                :checked="selectedNotices.includes(notice._id)"
                @change="toggleNoticeSelection(notice._id)"
                @click.stop
              />
            </view>
            
            <view class="notice-badges">
              <view class="notice-type-badge" :class="notice.type">
                <text>{{ getTypeText(notice.type) }}</text>
              </view>
              
              <view class="notice-priority" v-if="notice.priority">
                <text class="priority-text" :class="'priority-' + notice.priority">
                  {{ getPriorityText(notice.priority) }}
                </text>
              </view>
            </view>
            
            <view class="notice-sticky-badge" v-if="notice.isSticky">
              <text class="sticky-text">置顶</text>
            </view>
            
            <view class="notice-actions">
              <button class="action-btn-small" @click.stop="editNotice(notice)">
                <text>编辑</text>
              </button>
              <button class="action-btn-small" @click.stop="toggleNoticeStatus(notice)" v-if="notice.status === 'draft'">
                <text>发布</text>
              </button>
              <button class="action-btn-small" @click.stop="toggleNoticeStatus(notice)" v-else-if="notice.status === 'published'">
                <text>取消发布</text>
              </button>
              <button class="action-btn-small" @click.stop="archiveNotice(notice)" v-if="notice.status === 'published'">
                <text>归档</text>
              </button>
              <button class="action-btn-small danger" @click.stop="deleteNotice(notice)">
                <text>删除</text>
              </button>
            </view>
          </view>
          
          <view class="notice-content">
            <text class="notice-title">{{ notice.title }}</text>
            <text class="notice-text">{{ notice.content }}</text>
          </view>
          
          <view class="notice-footer">
            <view class="notice-meta">
              <text class="notice-time">{{ $formatTime(notice.createTime) }}</text>
              <text class="notice-publisher" v-if="notice.publisherName">
                发布者: {{ notice.publisherName }}
              </text>
              <text class="notice-views" v-if="notice.viewCount > 0">
                查看: {{ notice.viewCount }}
              </text>
            </view>
            <view class="notice-status-info">
              <text class="notice-status" :class="notice.status">
                {{ getStatusText(notice.status) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布/编辑公告弹窗 -->
    <view v-if="showNoticeModal" class="modal-overlay" @click="closeNoticeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑公告' : '发布公告' }}</text>
          <button class="close-btn" @click="closeNoticeModal">×</button>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">公告标题 *</text>
            <input 
              class="form-input" 
              v-model="noticeForm.title" 
              placeholder="请输入公告标题"
              maxlength="200"
            />
            <text class="char-count">{{ noticeForm.title.length }}/200</text>
          </view>
          
          <view class="form-group">
            <text class="form-label">公告类型 *</text>
            <view class="form-picker" @click="showTypePicker = true">
              <text>{{ noticeTypes[noticeForm.typeIndex].name }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">优先级</text>
            <view class="form-picker" @click="showPriorityPicker = true">
              <text>{{ priorityTypes[noticeForm.priorityIndex].name }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">公告内容 *</text>
            <textarea 
              class="form-textarea" 
              v-model="noticeForm.content" 
              placeholder="请输入公告内容"
            />
            <text class="char-count">{{ noticeForm.content.length }}</text>
          </view>
          
          <view class="form-group">
            <text class="form-label">发布状态</text>
            <view class="status-options">
              <label class="status-option">
                <input 
                  type="radio" 
                  value="published" 
                  v-model="noticeForm.status"
                />
                <text>立即发布</text>
              </label>
              <label class="status-option">
                <input 
                  type="radio" 
                  value="draft" 
                  v-model="noticeForm.status"
                />
                <text>保存草稿</text>
              </label>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">置顶设置</text>
            <view class="checkbox-group">
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="noticeForm.isSticky"
                />
                <text>置顶显示</text>
              </label>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">发布时间</text>
            <view class="time-picker-group">
              <view class="time-picker-item">
                <text class="time-label">开始时间</text>
                <view class="form-picker" @click="showStartTimePicker = true">
                  <text>{{ getStartTimeDisplay() }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </view>
              <view class="time-picker-item">
                <text class="time-label">结束时间</text>
                <view class="form-picker" @click="showEndTimePicker = true">
                  <text>{{ getEndTimeDisplay() }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeNoticeModal">取消</button>
          <button 
            class="btn-confirm" 
            @click="saveNotice"
            :disabled="!can保存"
          >
            {{ isEdit ? '更新' : '发布' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 类型选择弹窗 -->
    <view v-if="showTypePicker" class="type-picker-modal" @click="showTypePicker = false">
      <view class="type-picker-content" @click.stop>
        <view class="type-picker-header">
          <text class="type-picker-title">选择公告类型</text>
          <button class="type-picker-close" @click="showTypePicker = false">×</button>
        </view>
        <view class="type-picker-list">
          <view 
            v-for="(type, index) in noticeTypes" 
            :key="index"
            class="type-picker-item"
            :class="{ active: noticeForm.typeIndex === index }"
            @click="selectType(index)"
          >
            <view class="type-picker-icon" :class="type.value"></view>
            <text class="type-picker-name">{{ type.name }}</text>
            <text v-if="noticeForm.typeIndex === index" class="type-picker-check">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优先级选择弹窗 -->
    <view v-if="showPriorityPicker" class="priority-picker-modal" @click="showPriorityPicker = false">
      <view class="priority-picker-content" @click.stop>
        <view class="priority-picker-header">
          <text class="priority-picker-title">选择优先级</text>
          <button class="priority-picker-close" @click="showPriorityPicker = false">×</button>
        </view>
        <view class="priority-picker-list">
          <view 
            v-for="(priority, index) in priorityTypes" 
            :key="index"
            class="priority-picker-item"
            :class="{ active: noticeForm.priorityIndex === index }"
            @click="selectPriority(index)"
          >
            <view class="priority-picker-icon" :class="'priority-' + priority.value"></view>
            <text class="priority-picker-name">{{ priority.name }}</text>
            <text v-if="noticeForm.priorityIndex === index" class="priority-picker-check">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 开始时间选择弹窗 -->
    <view v-if="showStartTimePicker" class="time-picker-modal" @click="showStartTimePicker = false">
      <view class="time-picker-content" @click.stop>
        <view class="time-picker-header">
          <text class="time-picker-title">选择开始时间</text>
          <button class="time-picker-close" @click="showStartTimePicker = false">×</button>
        </view>
        <view class="time-picker-body">
          <view class="time-picker-section">
            <text class="time-picker-section-title">选择日期</text>
            <input 
              class="time-picker-input-text"
              v-model="noticeForm.startDate" 
              placeholder="请输入日期，格式：2025-01-27"
              @input="validateStartDate"
              @blur="formatStartDate"
            />
            <text class="time-picker-hint">格式：YYYY-MM-DD</text>
          </view>
          <view class="time-picker-section">
            <text class="time-picker-section-title">选择时间</text>
            <input 
              class="time-picker-input-text"
              v-model="noticeForm.startTime" 
              placeholder="请输入时间，格式：14:30"
              @input="validateStartTime"
              @blur="formatStartTime"
            />
            <text class="time-picker-hint">格式：HH:MM</text>
          </view>
        </view>
        <view class="time-picker-footer">
          <button class="time-picker-btn" @click="showStartTimePicker = false">完成</button>
        </view>
      </view>
    </view>

    <!-- 结束时间选择弹窗 -->
    <view v-if="showEndTimePicker" class="time-picker-modal" @click="showEndTimePicker = false">
      <view class="time-picker-content" @click.stop>
        <view class="time-picker-header">
          <text class="time-picker-title">选择结束时间</text>
          <button class="time-picker-close" @click="showEndTimePicker = false">×</button>
        </view>
        <view class="time-picker-body">
          <view class="time-picker-section">
            <text class="time-picker-section-title">选择日期</text>
            <input 
              class="time-picker-input-text"
              v-model="noticeForm.endDate" 
              placeholder="请输入日期，格式：2025-01-27"
              @input="validateEndDate"
              @blur="formatEndDate"
            />
            <text class="time-picker-hint">格式：YYYY-MM-DD</text>
          </view>
          <view class="time-picker-section">
            <text class="time-picker-section-title">选择时间</text>
            <input 
              class="time-picker-input-text"
              v-model="noticeForm.endTime" 
              placeholder="请输入时间，格式：14:30"
              @input="validateEndTime"
              @blur="formatEndTime"
            />
            <text class="time-picker-hint">格式：HH:MM</text>
          </view>
        </view>
        <view class="time-picker-footer">
          <button class="time-picker-btn" @click="showEndTimePicker = false">完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import timeMixin from '@/mixins/timeMixin.js'
import { TimeUtils } from '@/utils/timeUtils.js'

export default {
  name: 'noticeManagement',
  mixins: [timeMixin],
  data() {
    return {
      loading: false,
      notices: [],
      selectedTypeIndex: 0,
      selectedStatusIndex: 0,
      searchKeyword: '',
      selectedNotices: [],
      showNoticeModal: false,
      isEdit: false,
      editingNoticeId: null,
      showTypePicker: false,
      showPriorityPicker: false,
      showStartTimePicker: false,
      showEndTimePicker: false,
      noticeForm: {
        title: '',
        content: '',
        typeIndex: 1, // 默认选择info类型
        priorityIndex: 0, // 默认选择最低优先级
        status: 'published',
        isSticky: false,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      noticeTypes: [
        { value: 'all', name: '全部类型', color: '#6b7280' },
        { value: 'info', name: '信息公告', color: '#007aff' },
        { value: 'warning', name: '警告公告', color: '#f59e0b' },
        { value: 'error', name: '错误公告', color: '#ef4444' },
        { value: 'success', name: '成功公告', color: '#10b981' }
      ],
      statusTypes: [
        { value: 'all', name: '全部状态', color: '#6b7280' },
        { value: 'draft', name: '草稿', color: '#f59e0b' },
        { value: 'published', name: '已发布', color: '#10b981' },
        { value: 'archived', name: '已归档', color: '#6b7280' }
      ],
      priorityTypes: [
        { value: 1, name: '低', color: '#10b981' },
        { value: 2, name: '中', color: '#f59e0b' },
        { value: 3, name: '高', color: '#ef4444' },
        { value: 4, name: '紧急', color: '#dc2626' },
        { value: 5, name: '最高', color: '#991b1b' }
      ]
    }
  },
  computed: {
    filteredNotices() {
      let filtered = this.notices
      
      // 按类型过滤
      if (this.selectedTypeIndex > 0) {
        const selectedType = this.noticeTypes[this.selectedTypeIndex].value
        filtered = filtered.filter(notice => notice.type === selectedType)
      }
      
      // 按状态过滤
      if (this.selectedStatusIndex > 0) {
        const selectedStatus = this.statusTypes[this.selectedStatusIndex].value
        filtered = filtered.filter(notice => notice.status === selectedStatus)
      }
      
      // 按关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(notice => 
          notice.title.toLowerCase().includes(keyword) ||
          notice.content.toLowerCase().includes(keyword)
        )
      }
      
      return filtered
    },
    can保存() {
      return this.noticeForm.title.trim() && 
             this.noticeForm.content.trim() &&
             this.noticeForm.title.length <= 200
    }
  },
  onLoad() {
    this.loadNotices()
  },
  methods: {
    /**
     * 加载公告列表
     */
    async loadNotices() {
      this.loading = true
      try {
        const response = await api.admin.getNotices()
        console.log('API响应:', response)
        
        // 处理API返回的数据结构
        if (response.success && response.data && response.data.records) {
          // 映射API数据到前端期望的格式
          this.notices = response.data.records.map(notice => {
            // 处理状态字段 - 空字符串或null时根据publishTime判断
            let status = notice.status
            if (!status || status === '') {
              status = notice.publishTime ? 'published' : 'draft'
            }
            
            // 处理优先级 - 确保在1-5范围内
            let priority = notice.priority || 1
            if (priority > 5) priority = 5
            if (priority < 1) priority = 1
            
            // 处理置顶状态
            const isSticky = notice.isSticky === 1 || notice.isSticky === true
            
            return {
              _id: notice._id,
              id: notice._id, // 保持兼容性
              title: notice.title || '无标题',
              content: notice.content || '无内容',
              type: notice.type || 'info',
              status: status,
              priority: priority,
              createTime: notice.createTime || TimeUtils.getCurrentTimestamp(),
              createdAt: notice.createTime || TimeUtils.getCurrentTimestamp(), // 保持兼容性
              updateTime: notice.updateTime,
              updatedAt: notice.updateTime, // 保持兼容性
              publishTime: notice.publishTime,
              startTime: notice.startTime,
              endTime: notice.endTime,
              isSticky: isSticky,
              viewCount: notice.viewCount || 0,
              publisherId: notice.publisherId,
              publisherName: notice.publisherName || '系统'
            }
          })
          
          // 按优先级和创建时间排序
          this.notices.sort((a, b) => {
            // 先按置顶状态排序
            if (a.isSticky && !b.isSticky) return -1
            if (!a.isSticky && b.isSticky) return 1
            
            // 再按优先级排序（高优先级在前）
            if (a.priority !== b.priority) return b.priority - a.priority
            
            // 最后按创建时间排序（新的在前），使用TimeUtils确保iOS兼容性
            const timeA = TimeUtils.createDate(a.createdAt)
            const timeB = TimeUtils.createDate(b.createdAt)
            return (timeB || 0) - (timeA || 0)
          })
          
          console.log('处理后的公告数据:', this.notices)
        } else {
          this.notices = []
        }
      } catch (error) {
        console.error('加载公告失败:', error)
        // 如果API调用失败，使用模拟数据
        this.notices = [
          {
            id: '1',
            title: '系统维护通知',
            content: '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用，请提前做好准备。',
            type: 'warning',
            status: 'published',
            createdAt: TimeUtils.getCurrentTimestamp()
          },
          {
            id: '2',
            title: '新功能上线',
            content: '报餐系统新增批量操作功能，管理员可以批量处理报餐申请，提升工作效率。',
            type: 'success',
            status: 'published',
            createdAt: TimeUtils.toUTCForSubmit(TimeUtils.getPreviousDay(TimeUtils.getCurrentDate(), 1) + ' 12:00:00')
          }
        ]
        uni.showToast({
          title: '使用模拟数据',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新公告列表
     */
    async refreshNotices() {
      await this.loadNotices()
      uni.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    },

    /**
     * 创建公告
     */
    createNotice() {
      this.isEdit = false
      this.noticeForm = {
        title: '',
        content: '',
        typeIndex: 1, // 默认选择info类型
        priorityIndex: 0, // 默认选择最低优先级
        status: 'published',
        isSticky: false,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      }
      this.showNoticeModal = true
    },

    /**
     * 编辑公告
     */
    editNotice(notice) {
      this.isEdit = true
      this.editingNoticeId = notice.id
      
      // 解析开始时间和结束时间，使用TimeUtils确保iOS兼容性
      let startDate = '', startTime = '', endDate = '', endTime = ''
      if (notice.startTime) {
        const startDateTime = TimeUtils.createDate(notice.startTime)
        if (startDateTime) {
          startDate = TimeUtils.formatDate(notice.startTime)
          startTime = TimeUtils.formatTime(notice.startTime, 'HH:mm')
        }
      }
      if (notice.endTime) {
        const endDateTime = TimeUtils.createDate(notice.endTime)
        if (endDateTime) {
          endDate = TimeUtils.formatDate(notice.endTime)
          endTime = TimeUtils.formatTime(notice.endTime, 'HH:mm')
        }
      }
      
      this.noticeForm = {
        title: notice.title,
        content: notice.content,
        typeIndex: this.noticeTypes.findIndex(t => t.value === notice.type),
        priorityIndex: this.priorityTypes.findIndex(p => p.value === notice.priority) || 0,
        status: notice.status,
        isSticky: notice.isSticky || false,
        startDate,
        startTime,
        endDate,
        endTime
      }
      this.showNoticeModal = true
    },

    /**
     * 删除公告
     */
    async deleteNotice(notice) {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: `确定要删除公告"${notice.title}"吗？`,
          confirmText: '删除',
          confirmColor: '#ef4444'
        })
        
        if (result.confirm) {
          console.log('开始删除公告:', notice.id)
          
          // 显示加载状态
          uni.showLoading({
            title: '删除中...',
            mask: true
          })
          
          try {
            // 调用删除API
            const response = await api.admin.deleteNotice(notice.id)
            console.log('删除API响应:', response)
            
            // 检查响应是否成功
            if (response && response.success !== false) {
              // 从本地数组删除
              const index = this.notices.findIndex(n => n.id === notice.id)
              if (index > -1) {
                this.notices.splice(index, 1)
                console.log('从本地数组删除成功，索引:', index)
              }
              
              uni.hideLoading()
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 刷新公告列表以确保数据同步
              setTimeout(() => {
                this.loadNotices()
              }, 1000)
            } else {
              throw new Error(response?.message || '删除失败')
            }
          } catch (api错误) {
            uni.hideLoading()
            throw api错误
          }
        }
      } catch (error) {
        console.error('删除公告失败:', error)
        
        // 解析错误信息
        let errorMessage = '删除失败，请重试'
        let errorType = 'error'
        
        if (error.message) {
          if (error.message.includes('Cannot read properties of undefined')) {
            errorMessage = '服务器内部错误，请稍后重试'
            errorType = 'none'
          } else if (error.message.includes('获取公告详情失败')) {
            errorMessage = '无法获取公告信息，请检查网络连接'
            errorType = 'none'
          } else if (error.message.includes('权限不足')) {
            errorMessage = '您没有删除此公告的权限'
            errorType = 'none'
          } else if (error.message.includes('请求的资源不存在')) {
            errorMessage = '公告不存在或已被删除'
            errorType = 'none'
          } else if (error.message.includes('网络')) {
            errorMessage = '网络连接失败，请检查网络设置'
            errorType = 'none'
          } else {
            errorMessage = error.message
            errorType = 'none'
          }
        }
        
        uni.showModal({
          title: '删除失败',
          content: errorMessage,
          show取消: false,
          confirmText: '确定',
          confirmColor: '#ef4444'
        })
      }
    },

    /**
     * 保存公告
     */
    async saveNotice() {
      if (!this.can保存) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        })
        return
      }

      try {
        // 构建时间字符串，确保格式正确
        let startTime = null, endTime = null
        
        // 验证并格式化开始时间
        if (this.noticeForm.startDate && this.noticeForm.startTime) {
          const startDate = this.formatDateString(this.noticeForm.startDate)
          const startTimeStr = this.formatTimeString(this.noticeForm.startTime)
          if (startDate && startTimeStr) {
            startTime = `${startDate}T${startTimeStr}:00.000Z`
          }
        }
        
        // 验证并格式化结束时间
        if (this.noticeForm.endDate && this.noticeForm.endTime) {
          const endDate = this.formatDateString(this.noticeForm.endDate)
          const endTimeStr = this.formatTimeString(this.noticeForm.endTime)
          if (endDate && endTimeStr) {
            endTime = `${endDate}T${endTimeStr}:00.000Z`
          }
        }
        
        const noticeData = {
          title: this.noticeForm.title.trim(),
          content: this.noticeForm.content.trim(),
          type: this.noticeTypes[this.noticeForm.typeIndex].value,
          priority: this.priorityTypes[this.noticeForm.priorityIndex].value,
          status: this.noticeForm.status,
          isSticky: this.noticeForm.isSticky ? 1 : 0,
          startTime,
          endTime
        }

        if (this.isEdit) {
          await api.admin.updateNotice(this.editingNoticeId, noticeData)
          
          // 更新本地数据
          const index = this.notices.findIndex(n => n.id === this.editingNoticeId)
          if (index > -1) {
            this.notices.splice(index, 1, {
              ...this.notices[index],
              ...noticeData,
              updatedAt: TimeUtils.getCurrentTimestamp()
            })
          }
        } else {
          const response = await api.admin.createNotice(noticeData)
          
          // 添加到本地数组
          const newNotice = {
            id: response.data?.id || Date.now().toString(),
            ...noticeData,
            createdAt: TimeUtils.getCurrentTimestamp()
          }
          this.notices.unshift(newNotice)
        }

        uni.showToast({
          title: this.isEdit ? '更新成功' : '发布成功',
          icon: 'success'
        })
        
        this.closeNoticeModal()
      } catch (error) {
        console.error('保存公告失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    },

    /**
     * 关闭弹窗
     */
    closeNoticeModal() {
      this.showNoticeModal = false
      this.isEdit = false
      this.editingNoticeId = null
    },

    /**
     * 类型筛选变化
     */
    onTypeChange(e) {
      this.selectedTypeIndex = e.detail.value
    },

    /**
     * 状态选择变化
     */
    onStatusChange(e) {
      this.selectedStatusIndex = e.detail.value
    },

    /**
     * 搜索输入
     */
    onSearch() {
      // 搜索逻辑在computed中处理
    },

    /**
     * 清除搜索
     */
    clearSearch() {
      this.searchKeyword = ''
    },

    /**
     * 切换公告选择
     */
    toggleNoticeSelection(noticeId) {
      const index = this.selectedNotices.indexOf(noticeId)
      if (index > -1) {
        this.selectedNotices.splice(index, 1)
      } else {
        this.selectedNotices.push(noticeId)
      }
    },

    /**
     * 批量删除
     */
    async batch删除() {
      if (this.selectedNotices.length === 0) {
        uni.showToast({
          title: '请选择要删除的公告',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: '确认删除',
        content: `确定要删除选中的 ${this.selectedNotices.length} 条公告吗？`,
        confirmText: '删除',
        confirmColor: '#ef4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              console.log('开始批量删除公告:', this.selectedNotices)
              
              // 显示加载状态
              uni.showLoading({
                title: '删除中...',
                mask: true
              })
              
              try {
                // 调用批量删除API
                const response = await api.admin.batchDeleteNotices(this.selectedNotices)
                console.log('批量删除API响应:', response)
                
                // 检查响应是否成功
                if (response && response.success !== false) {
                  // 从本地数组删除
                  this.notices = this.notices.filter(notice => !this.selectedNotices.includes(notice.id))
                  this.selectedNotices = []
                  
                  uni.hideLoading()
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  })
                  
                  // 刷新公告列表以确保数据同步
                  setTimeout(() => {
                    this.loadNotices()
                  }, 1000)
                } else {
                  throw new Error(response?.message || '批量删除失败')
                }
              } catch (api错误) {
                uni.hideLoading()
                throw api错误
              }
            } catch (error) {
              console.error('批量删除失败:', error)
              
              // 解析错误信息
              let errorMessage = '批量删除失败，请重试'
              
              if (error.message) {
                if (error.message.includes('Cannot read properties of undefined')) {
                  errorMessage = '服务器内部错误，请稍后重试'
                } else if (error.message.includes('获取公告详情失败')) {
                  errorMessage = '无法获取公告信息，请检查网络连接'
                } else if (error.message.includes('权限不足')) {
                  errorMessage = '您没有删除这些公告的权限'
                } else if (error.message.includes('请求的资源不存在')) {
                  errorMessage = '部分公告不存在或已被删除'
                } else if (error.message.includes('网络')) {
                  errorMessage = '网络连接失败，请检查网络设置'
                } else {
                  errorMessage = error.message
                }
              }
              
              uni.showModal({
                title: '批量删除失败',
                content: errorMessage,
                show取消: false,
                confirmText: '确定',
                confirmColor: '#ef4444'
              })
            }
          }
        }
      })
    },

    /**
     * 切换公告状态
     */
    async toggleNoticeStatus(notice) {
      try {
        if (notice.status === 'published') {
          // 取消发布
          await api.admin.unpublishNotice(notice.id)
          notice.status = 'draft'
          uni.showToast({
            title: '已取消发布',
            icon: 'success'
          })
        } else {
          // 发布
          await api.admin.publishNotice(notice.id)
          notice.status = 'published'
          uni.showToast({
            title: '已发布',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('更新状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    },

    /**
     * 归档公告
     */
    async archiveNotice(notice) {
      try {
        const result = await uni.showModal({
          title: '确认归档',
          content: `确定要归档公告"${notice.title}"吗？`,
          confirmText: '归档',
          confirmColor: '#f59e0b'
        })
        
        if (result.confirm) {
          await api.admin.archiveNotice(notice.id)
          notice.status = 'archived'
          uni.showToast({
            title: '归档成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('归档失败:', error)
        uni.showToast({
          title: '归档失败',
          icon: 'error'
        })
      }
    },

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
      const priorityType = this.priorityTypes.find(p => p.value === priority)
      return priorityType ? priorityType.name : '未知'
    },

    /**
     * 获取置顶状态文本
     */
    getStickyText(isSticky) {
      return isSticky ? '置顶' : ''
    },

    /**
     * 表单类型变化
     */
    onFormTypeChange(e) {
      this.noticeForm.typeIndex = e.detail.value
    },

    /**
     * 选择公告类型
     */
    selectType(index) {
      this.noticeForm.typeIndex = index
      this.showTypePicker = false
    },

    /**
     * 选择优先级
     */
    selectPriority(index) {
      this.noticeForm.priorityIndex = index
      this.showPriorityPicker = false
    },

    /**
     * 开始日期变化
     */
    onStartDateChange(e) {
      this.noticeForm.startDate = e.detail.value
    },

    /**
     * 开始时间变化
     */
    onStartTimeChange(e) {
      this.noticeForm.startTime = e.detail.value
    },

    /**
     * 结束日期变化
     */
    onEndDateChange(e) {
      this.noticeForm.endDate = e.detail.value
    },

    /**
     * 结束时间变化
     */
    onEndTimeChange(e) {
      this.noticeForm.endTime = e.detail.value
    },

    /**
     * 验证开始日期格式
     */
    validateStartDate(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和连字符
      const cleaned = value.replace(/[^\d-]/g, '')
      if (cleaned !== value) {
        this.noticeForm.startDate = cleaned
      }
    },

    /**
     * 格式化开始日期
     */
    formatStartDate() {
      const date = this.noticeForm.startDate
      if (date && date.length === 8 && !date.includes('-')) {
        // 如果是8位数字，格式化为YYYY-MM-DD
        this.noticeForm.startDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      }
    },

    /**
     * 验证开始时间格式
     */
    validateStartTime(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和冒号
      const cleaned = value.replace(/[^\d:]/g, '')
      if (cleaned !== value) {
        this.noticeForm.startTime = cleaned
      }
    },

    /**
     * 格式化开始时间
     */
    formatStartTime() {
      const time = this.noticeForm.startTime
      if (time && time.length === 4 && !time.includes(':')) {
        // 如果是4位数字，格式化为HH:MM
        this.noticeForm.startTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`
      }
    },

    /**
     * 验证结束日期格式
     */
    validateEndDate(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和连字符
      const cleaned = value.replace(/[^\d-]/g, '')
      if (cleaned !== value) {
        this.noticeForm.endDate = cleaned
      }
    },

    /**
     * 格式化结束日期
     */
    formatEndDate() {
      const date = this.noticeForm.endDate
      if (date && date.length === 8 && !date.includes('-')) {
        // 如果是8位数字，格式化为YYYY-MM-DD
        this.noticeForm.endDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      }
    },

    /**
     * 验证结束时间格式
     */
    validateEndTime(e) {
      const value = e.target?.value || e.detail?.value || ''
      // 只允许输入数字和冒号
      const cleaned = value.replace(/[^\d:]/g, '')
      if (cleaned !== value) {
        this.noticeForm.endTime = cleaned
      }
    },

    /**
     * 格式化结束时间
     */
    formatEndTime() {
      const time = this.noticeForm.endTime
      if (time && time.length === 4 && !time.includes(':')) {
        // 如果是4位数字，格式化为HH:MM
        this.noticeForm.endTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`
      }
    },

    /**
     * 格式化日期字符串为ISO格式
     */
    formatDateString(dateStr) {
      if (!dateStr) return null
      
      // 如果已经是YYYY-MM-DD格式，直接返回
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      
      // 如果是8位数字，格式化为YYYY-MM-DD
      if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
      }
      
      // 尝试解析其他格式，使用TimeUtils确保iOS兼容性
      try {
        const date = TimeUtils.createDate(dateStr)
        if (date) {
          return TimeUtils.formatDate(dateStr)
        }
      } catch (e) {
        console.warn('日期格式解析失败:', dateStr)
      }
      
      return null
    },

    /**
     * 格式化时间字符串为HH:MM格式
     */
    formatTimeString(timeStr) {
      if (!timeStr) return null
      
      // 如果已经是HH:MM格式，直接返回
      if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr
      }
      
      // 如果是4位数字，格式化为HH:MM
      if (/^\d{4}$/.test(timeStr)) {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`
      }
      
      // 尝试解析其他格式，使用TimeUtils确保iOS兼容性
      try {
        const time = TimeUtils.createDate(`2000-01-01T${timeStr}`)
        if (time) {
          return TimeUtils.formatTime(`2000-01-01T${timeStr}`, 'HH:mm')
        }
      } catch (e) {
        console.warn('时间格式解析失败:', timeStr)
      }
      
      return null
    },


    /**
     * 获取开始时间显示文本
     */
    getStartTimeDisplay() {
      if (this.noticeForm.startDate && this.noticeForm.startTime) {
        return `${this.noticeForm.startDate} ${this.noticeForm.startTime}`
      } else if (this.noticeForm.startDate) {
        return `${this.noticeForm.startDate} 未选择时间`
      } else {
        return '选择开始时间'
      }
    },

    /**
     * 获取结束时间显示文本
     */
    getEndTimeDisplay() {
      if (this.noticeForm.endDate && this.noticeForm.endTime) {
        return `${this.noticeForm.endDate} ${this.noticeForm.endTime}`
      } else if (this.noticeForm.endDate) {
        return `${this.noticeForm.endDate} 未选择时间`
      } else {
        return '选择结束时间'
      }
    },

    /**
     * 获取类型文本
     */
    getTypeText(type) {
      const typeObj = this.noticeTypes.find(t => t.value === type)
      return typeObj ? typeObj.name : '未知'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      // 处理空字符串或undefined状态
      if (!status || status === '') {
        return '已发布' // 默认为已发布
      }
      
      const statusMap = {
        'published': '已发布',
        'draft': '草稿',
        'archived': '已归档',
        'publish': '已发布',
        'unpublished': '未发布'
      }
      return statusMap[status] || '未知'
    },

    /**
     * 获取表单状态显示文本
     */
    getFormStatusText(status) {
      const statusMap = {
        'published': '立即发布',
        'draft': '保存草稿'
      }
      return statusMap[status] || '立即发布'
    },

    /**
     * 格式化时间，使用TimeUtils确保iOS兼容性
     */
    formatTime(time) {
      if (!time) return ''
      
      // 使用TimeUtils格式化时间，确保iOS兼容性
      return TimeUtils.formatUTCTime(time, 'datetime')
    }
  }
}
</script>

<style lang="scss" scoped>
.notices-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32rpx 24rpx 24rpx;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.title-icon {
  font-size: 28rpx;
}

.header-subtitle {
  font-size: 22rpx;
  opacity: 0.9;
  line-height: 1.4;
}

.header-stats {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-number {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.stat-label {
  font-size: 20rpx;
  opacity: 0.8;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: white;
  border-bottom: 1rpx solid #e9ecef;
  flex-wrap: wrap;
  gap: 12rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 16rpx;
  border: none;
  border-radius: 6rpx;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 48rpx;
  cursor: pointer;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2rpx 4rpx rgba(102, 126, 234, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 8rpx rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1rpx solid #e9ecef;
}

.action-btn.secondary:hover {
  background: #e9ecef;
  color: #495057;
}

.action-btn.danger {
  background: #dc3545;
  color: white;
  box-shadow: 0 2rpx 4rpx rgba(220, 53, 69, 0.2);
}

.action-btn.danger:hover {
  background: #c82333;
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 8rpx rgba(220, 53, 69, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon {
  font-size: 20rpx;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 搜索框 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 6rpx;
  padding: 8rpx 12rpx;
  min-width: 200rpx;
}

.search-icon {
  font-size: 18rpx;
  color: #6c757d;
  margin-right: 8rpx;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 22rpx;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #999;
  font-size: 20rpx;
}

.clear-search {
  position: absolute;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  font-size: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* 筛选选择器 */
.filter-picker {
  padding: 8rpx 12rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 6rpx;
  font-size: 22rpx;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120rpx;
}

.filter-picker:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.picker-content {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.picker-icon {
  font-size: 18rpx;
  color: #6c757d;
}

.picker-text {
  font-size: 20rpx;
  color: #333;
}

/* 公告列表 */
.notices-list {
  padding: 30rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 24rpx;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666;
}

/* 公告卡片 */
.notice-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notice-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border-left: 6rpx solid #007aff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notice-card:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
}

.notice-card.info {
  border-left-color: #007aff;
}

.notice-card.warning {
  border-left-color: #f59e0b;
}

.notice-card.error {
  border-left-color: #ef4444;
}

.notice-card.success {
  border-left-color: #10b981;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  gap: 12rpx;
  min-height: 60rpx;
}

.notice-type-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.notice-type-badge.info {
  background: #e3f2fd;
  color: #1976d2;
}

.notice-type-badge.warning {
  background: #fff3e0;
  color: #f57c00;
}

.notice-type-badge.error {
  background: #ffebee;
  color: #d32f2f;
}

.notice-type-badge.success {
  background: #e8f5e8;
  color: #388e3c;
}

.notice-actions {
  display: flex;
  gap: 10rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.action-btn-small {
  padding: 8rpx 16rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  background: white;
  font-size: 22rpx;
  color: #666;
}

.action-btn-small.danger {
  color: #ef4444;
  border-color: #fecaca;
}

.notice-content {
  margin-bottom: 20rpx;
  flex: 1;
  min-width: 0;
}

.notice-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  line-height: 1.4;
  word-break: break-word;
}

.notice-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 16rpx;
}

.notice-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.notice-publisher,
.notice-views {
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.2;
}

.notice-status-info {
  display: flex;
  align-items: center;
}

.notice-time {
  font-size: 22rpx;
  color: #999;
}

.notice-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  color: #666;
}

.notice-status.published {
  background: #d1fae5;
  color: #065f46;
}

/* 弹窗样式 */
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
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e9ecef;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  font-size: 32rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  background: white;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  background: white;
  position: relative;
  z-index: 1001;
  min-height: 60rpx;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

/* Picker选项样式优化 */
.form-group picker {
  position: relative;
  z-index: 10001;
}

/* 确保picker选项不被遮挡 */
.form-group {
  position: relative;
  z-index: 1000;
}

/* 类型选择弹窗样式 */
.type-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.type-picker-content {
  background: white;
  border-radius: 16rpx;
  width: 80%;
  max-width: 500rpx;
  max-height: 60vh;
  overflow: hidden;
}

.type-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.type-picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.type-picker-close {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-picker-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.type-picker-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f8f9fa;
  transition: all 0.3s ease;
}

.type-picker-item:last-child {
  border-bottom: none;
}

.type-picker-item:active {
  background: #f8f9fa;
}

.type-picker-item.active {
  background: rgba(102, 126, 234, 0.1);
}

.type-picker-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.type-picker-icon.info {
  background: #e3f2fd;
  color: #1976d2;
}

.type-picker-icon.warning {
  background: #fff3e0;
  color: #f57c00;
}

.type-picker-icon.error {
  background: #ffebee;
  color: #d32f2f;
}

.type-picker-icon.success {
  background: #e8f5e8;
  color: #388e3c;
}

.type-picker-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.type-picker-check {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  background: white;
  resize: none;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
  display: block;
}

.status-options {
  display: flex;
  gap: 30rpx;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #333;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #e9ecef;
  flex-shrink: 0;
  background: white;
  border-radius: 0 0 16rpx 16rpx;
}

.btn-cancel {
  flex: 1;
  padding: 24rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  background: white;
  font-size: 28rpx;
  color: #666;
}

.btn-confirm {
  flex: 1;
  padding: 24rpx;
  border: none;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 28rpx;
  color: white;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 新增样式 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 240rpx;
}

.search-input {
  width: 100%;
  height: 60rpx;
  padding: 0 40rpx 0 16rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 30rpx;
  font-size: 24rpx;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 2rpx rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 16rpx;
  font-size: 24rpx;
  color: #9ca3af;
  pointer-events: none;
}

.notice-selection {
  margin-right: 16rpx;
}

.notice-badges {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.notice-priority {
  margin-left: 0;
}

.priority-text {
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}

.priority-text.priority-1 {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.priority-text.priority-2 {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.priority-text.priority-3 {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.priority-text.priority-4 {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.priority-text.priority-5 {
  color: #991b1b;
  background: rgba(153, 27, 27, 0.1);
}

.notice-sticky-badge {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.sticky-text {
  font-size: 20rpx;
  color: #8b5cf6;
  font-weight: bold;
  background: rgba(139, 92, 246, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  border: 1rpx solid rgba(139, 92, 246, 0.3);
}

.notice-card.selected {
  border: 2rpx solid #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.notice-card.sticky {
  border-left-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  position: relative;
}

.notice-card.sticky::before {
  content: '置顶';
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #8b5cf6;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.type-picker,
.status-picker {
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e9ecef;
  font-size: 24rpx;
  color: #333;
  min-width: 120rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.type-picker:hover,
.status-picker:hover {
  border-color: #667eea;
  background: white;
}

.picker-text {
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16rpx;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .notice-card {
    padding: 20rpx;
  }
  
  .notice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
    min-height: auto;
  }
  
  .notice-badges {
    width: 100%;
    justify-content: flex-start;
  }
  
  .notice-sticky-badge {
    margin-left: 0;
    margin-top: 8rpx;
  }
  
  .notice-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
    margin-top: 8rpx;
  }
  
  .action-btn-small {
    padding: 8rpx 16rpx;
    font-size: 22rpx;
  }
}

/* 优先级选择弹窗样式 */
.priority-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.priority-picker-content {
  background: white;
  border-radius: 16rpx;
  width: 80%;
  max-width: 500rpx;
  max-height: 60vh;
  overflow: hidden;
}

.priority-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.priority-picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.priority-picker-close {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.priority-picker-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.priority-picker-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f8f9fa;
  transition: all 0.3s ease;
}

.priority-picker-item:last-child {
  border-bottom: none;
}

.priority-picker-item:active {
  background: #f8f9fa;
}

.priority-picker-item.active {
  background: rgba(102, 126, 234, 0.1);
}

.priority-picker-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
}

.priority-picker-icon.priority-1 {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.priority-picker-icon.priority-2 {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.priority-picker-icon.priority-3 {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-picker-icon.priority-4 {
  background: rgba(220, 38, 38, 0.2);
  color: #dc2626;
}

.priority-picker-icon.priority-5 {
  background: rgba(153, 27, 27, 0.2);
  color: #991b1b;
}

.priority-picker-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.priority-picker-check {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

/* 时间选择器样式 */
.time-picker-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.time-picker-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.time-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

/* 时间选择弹窗样式 */
.time-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30000;
}

.time-picker-content {
  background: white;
  border-radius: 16rpx;
  width: 85%;
  max-width: 500rpx;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.time-picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.time-picker-close {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-picker-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
  z-index: 50000;
}

.time-picker-section {
  margin-bottom: 30rpx;
}

.time-picker-section:last-child {
  margin-bottom: 0;
}

.time-picker-section-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.time-picker-input {
  padding: 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  background: white;
  text-align: center;
  min-height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 30001;
}

.time-picker-input:active {
  border-color: #007aff;
  background: #f8f9ff;
}

/* 手写输入框样式 */
.time-picker-input-text {
  width: 100%;
  padding: 24rpx 20rpx;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: white;
  text-align: left;
  min-height: 80rpx;
  height: 80rpx;
  line-height: 1.4;
  transition: all 0.3s ease;
  position: relative;
  z-index: 30001;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.time-picker-input-text:focus {
  border-color: #007aff;
  background: #f8f9ff;
  outline: none;
}

.time-picker-input-text::placeholder {
  color: #999;
  font-size: 26rpx;
}

.time-picker-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
  display: block;
  text-align: left;
  line-height: 1.3;
}


/* Picker组件层级优化 */
.time-picker-modal picker {
  position: relative;
  z-index: 30002;
}

.time-picker-modal picker-view {
  position: relative;
  z-index: 30002;
}

.time-picker-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.time-picker-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

/* 复选框样式 */
.checkbox-group {
  display: flex;
  gap: 20rpx;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #333;
  cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
  width: 32rpx;
  height: 32rpx;
  margin: 0;
}

@media (max-width: 600rpx) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-body {
    padding: 20rpx;
  }
  
  .time-picker-group {
    gap: 20rpx;
  }
  
  .time-picker-item {
    gap: 12rpx;
  }
  
  .time-picker {
    padding: 16rpx;
    font-size: 24rpx;
    min-height: 50rpx;
  }
  
  .form-group {
    margin-bottom: 24rpx;
  }
}

/* 小屏幕优化 */
@media (max-width: 600rpx) {
  .page-header {
    padding: 20rpx;
  }
  
  .header-title {
    font-size: 32rpx;
  }
  
  .toolbar {
    padding: 16rpx 20rpx;
  }
  
  .notice-card {
    padding: 16rpx;
  }
  
  .notice-title {
    font-size: 28rpx;
  }
  
  .notice-text {
    font-size: 24rpx;
  }
}
</style>
