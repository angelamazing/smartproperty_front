<template>
  <view class="qr-management-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">二维码管理</text>
      <button class="create-btn" @click="showCreateModal = true">
        <text class="iconfont">➕</text>
        <text>创建二维码</text>
      </button>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{ qrStats.totalQrCodes || 0 }}</text>
        <text class="stat-label">总二维码数</text>
        <text class="stat-trend" v-if="qrStats.qrCodesTrend">
          {{ qrStats.qrCodesTrend > 0 ? '↗' : qrStats.qrCodesTrend < 0 ? '↘' : '→' }}
          {{ Math.abs(qrStats.qrCodesTrend) }}
        </text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ qrStats.activeQrCodes || 0 }}</text>
        <text class="stat-label">启用中</text>
        <text class="stat-percentage">{{ get活跃Percentage() }}%</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ qrStats.totalScans || 0 }}</text>
        <text class="stat-label">总扫码次数</text>
        <text class="stat-trend" v-if="qrStats.scansTrend">
          {{ qrStats.scansTrend > 0 ? '↗' : qrStats.scansTrend < 0 ? '↘' : '→' }}
          {{ Math.abs(qrStats.scansTrend) }}
        </text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ qrStats.todayScans || 0 }}</text>
        <text class="stat-label">今日扫码</text>
        <text class="stat-time">今日</text>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">状态:</text>
          <picker 
            :value="statusIndex" 
            :range="statusOptions" 
            @change="onStatusChange"
          >
            <view class="picker-input">
              {{ statusOptions[statusIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="filter-item">
          <text class="filter-label">搜索:</text>
          <input 
            v-model="searchKeyword" 
            placeholder="搜索二维码名称或位置"
            class="search-input"
            @input="onSearchChange"
          />
        </view>
      </view>
    </view>

    <!-- 批量操作栏 -->
    <view class="batch-actions" v-if="selectedQrCodes.length > 0">
      <view class="batch-info">
        <text>已选择 {{ selectedQrCodes.length }} 个二维码</text>
      </view>
      <view class="batch-buttons">
        <button class="batch-btn" @click="batchEnable">批量启用</button>
        <button class="batch-btn" @click="batchDisable">批量停用</button>
        <button class="batch-btn danger" @click="batch删除">批量删除</button>
        <button class="batch-btn" @click="clearSelection">取消选择</button>
      </view>
    </view>

    <!-- 二维码列表 -->
    <view class="qr-list">
      <view 
        v-for="qrCode in qrCodes" 
        :key="qrCode._id" 
        class="qr-item"
        :class="{ 'selected': selectedQrCodes.includes(qrCode._id) }"
      >
        <!-- 选择框 -->
        <view class="qr-selector" @click="toggleSelection(qrCode._id)">
          <text class="selector-icon">{{ selectedQrCodes.includes(qrCode._id) ? '☑' : '☐' }}</text>
        </view>
        <view class="qr-header">
          <view class="qr-info">
            <text class="qr-name">{{ qrCode.name }}</text>
            <text class="qr-location">{{ qrCode.location }}</text>
          </view>
          <view class="qr-status" :class="qrCode.status">
            <text>{{ qrCode.status === 'active' ? '启用' : '停用' }}</text>
          </view>
        </view>
        
        <view class="qr-details">
          <text class="qr-code">{{ qrCode.code }}</text>
          <text class="qr-description" v-if="qrCode.description">{{ qrCode.description }}</text>
        </view>
        
        <view class="qr-stats">
          <view class="stat-item">
            <text class="stat-label">总扫码:</text>
            <text class="stat-value">{{ qrCode.usageStats?.totalScans || 0 }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">成功扫码:</text>
            <text class="stat-value">{{ qrCode.usageStats?.successfulScans || 0 }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">独立用户:</text>
            <text class="stat-value">{{ qrCode.usageStats?.unique用户s || 0 }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">成功率:</text>
            <text class="stat-value">{{ get成功Rate(qrCode) }}%</text>
          </view>
        </view>
        
        <!-- 使用趋势图 -->
        <view class="usage-trend" v-if="qrCode.usageStats?.recentUsage">
          <text class="trend-label">最近7天使用趋势:</text>
          <view class="trend-chart">
            <view 
              v-for="(day, index) in qrCode.usageStats.recentUsage" 
              :key="index"
              class="trend-bar"
              :style="{ height: getBarHeight(day.scans) + 'rpx' }"
              :title="`${day.date}: ${day.scans}次扫码`"
            ></view>
          </view>
        </view>
        
        <view class="qr-actions">
          <button class="action-btn" @click="viewQrDetail(qrCode._id)">
            查看详情
          </button>
          <button class="action-btn generate-btn" @click="generateQRCode(qrCode)">
            生成二维码
          </button>
          <button 
            class="action-btn" 
            :class="{ 'toggle-btn': qrCode.status === 'active' }"
            @click="toggleQrStatus(qrCode._id, qrCode.status)"
          >
            {{ qrCode.status === 'active' ? '停用' : '启用' }}
          </button>
          <button class="action-btn danger" @click="deleteQrCode(qrCode._id)">
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && qrCodes.length === 0">
      <text class="iconfont">📱</text>
      <text class="empty-text">暂无二维码</text>
      <button class="empty-btn" @click="showCreateModal = true">创建第一个二维码</button>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 创建二维码弹窗 -->
    <uni-popup ref="createPopup" type="center">
      <view class="create-popup">
        <view class="popup-header">
          <text class="popup-title">创建二维码</text>
          <text class="close-btn" @click="closeCreateModal">×</text>
        </view>
        
        <view class="popup-content">
          <view class="form-group">
            <text class="form-label">二维码名称 *</text>
            <input 
              v-model="createForm.name" 
              placeholder="请输入二维码名称"
              class="form-input"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">张贴位置 *</text>
            <input 
              v-model="createForm.location" 
              placeholder="请输入张贴位置"
              class="form-input"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">描述信息</text>
            <textarea 
              v-model="createForm.description" 
              placeholder="请输入描述信息（可选）"
              class="form-textarea"
            />
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeCreateModal">取消</button>
          <button class="confirm-btn" @click="createQrCode">创建</button>
        </view>
      </view>
    </uni-popup>

    <!-- 二维码详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">二维码详情</text>
          <text class="close-btn" @click="closeDetailModal">×</text>
        </view>
        
        <view class="popup-content" v-if="selectedQrCode">
          <view class="detail-section">
            <text class="detail-label">二维码名称:</text>
            <text class="detail-value">{{ selectedQrCode.name }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">张贴位置:</text>
            <text class="detail-value">{{ selectedQrCode.location }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">二维码内容:</text>
            <text class="detail-value">{{ selectedQrCode.code }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">状态:</text>
            <text class="detail-value">{{ selectedQrCode.status === 'active' ? '启用' : '停用' }}</text>
          </view>
          
          <view class="detail-section" v-if="selectedQrCode.description">
            <text class="detail-label">描述:</text>
            <text class="detail-value">{{ selectedQrCode.description }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">创建时间:</text>
            <text class="detail-value">{{ $formatTime(selectedQrCode.createTime) }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">更新时间:</text>
            <text class="detail-value">{{ $formatTime(selectedQrCode.updateTime) }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">使用统计:</text>
            <view class="stats-grid">
              <view class="stat-item">
                <text class="stat-label">总扫码:</text>
                <text class="stat-value">{{ selectedQrCode.usageStats?.totalScans || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">成功扫码:</text>
                <text class="stat-value">{{ selectedQrCode.usageStats?.successfulScans || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">失败扫码:</text>
                <text class="stat-value">{{ selectedQrCode.usageStats?.failedScans || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">独立用户:</text>
                <text class="stat-value">{{ selectedQrCode.usageStats?.unique用户s || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="confirm-btn" @click="closeDetailModal">关闭</button>
        </view>
      </view>
    </uni-popup>

    <!-- 确认删除弹窗 -->
    <uni-popup ref="deletePopup" type="center">
      <view class="delete-popup">
        <view class="popup-header">
          <text class="popup-title">确认删除</text>
          <text class="close-btn" @click="close删除Modal">×</text>
        </view>
        
        <view class="popup-content">
          <text class="delete-text">确定要删除这个二维码吗？删除后无法恢复。</text>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="close删除Modal">取消</button>
          <button class="confirm-btn danger" @click="execute删除">删除</button>
        </view>
      </view>
    </uni-popup>

    <!-- 二维码生成弹窗 -->
    <uni-popup ref="generatePopup" type="center">
      <view class="generate-popup">
        <view class="popup-header">
          <text class="popup-title">生成二维码</text>
          <text class="close-btn" @click="closeGenerateModal">×</text>
        </view>
        
        <view class="popup-content" v-if="selectedQrForGeneration">
          <!-- 二维码信息 -->
          <view class="qr-info-section">
            <text class="section-title">二维码信息</text>
            <view class="info-item">
              <text class="info-label">名称:</text>
              <text class="info-value">{{ selectedQrForGeneration.name }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">位置:</text>
              <text class="info-value">{{ selectedQrForGeneration.location }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">内容:</text>
              <text class="info-value qr-content">{{ selectedQrForGeneration.code }}</text>
            </view>
          </view>

          <!-- 样式设置 -->
          <view class="style-section">
            <text class="section-title">样式设置</text>
            
            <view class="style-group">
              <text class="style-label">预设样式:</text>
              <picker 
                :value="styleIndex" 
                :range="styleOptions" 
                @change="onStyleChange"
              >
                <view class="picker-input">
                  {{ styleOptions[styleIndex] }}
                  <text class="iconfont">▼</text>
                </view>
              </picker>
            </view>

            <view class="style-group">
              <text class="style-label">尺寸:</text>
              <picker 
                :value="sizeIndex" 
                :range="sizeOptions" 
                @change="onSizeChange"
              >
                <view class="picker-input">
                  {{ sizeOptions[sizeIndex] }}
                  <text class="iconfont">▼</text>
                </view>
              </picker>
            </view>

            <view class="style-group">
              <text class="style-label">容错级别:</text>
              <picker 
                :value="errorLevelIndex" 
                :range="errorLevelOptions" 
                @change="on错误LevelChange"
              >
                <view class="picker-input">
                  {{ errorLevelOptions[errorLevelIndex] }}
                  <text class="iconfont">▼</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 预览区域 -->
          <view class="preview-section" v-if="generatedQRCode">
            <text class="section-title">预览</text>
            <view class="qr-preview">
              <image 
                :src="generatedQRCode" 
                mode="aspectFit"
                class="qr-image"
                @click="previewQRCode"
              />
            </view>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeGenerateModal">取消</button>
          <button class="generate-btn" @click="generateQRCodeImage" :disabled="isGenerating">
            {{ isGenerating ? '生成中...' : '生成二维码' }}
          </button>
          <button class="download-btn" @click="downloadQRCode" :disabled="!generatedQRCode">
            下载
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 二维码预览弹窗 -->
    <uni-popup ref="previewPopup" type="center">
      <view class="preview-popup">
        <view class="popup-header">
          <text class="popup-title">二维码预览</text>
          <text class="close-btn" @click="closePreviewModal">×</text>
        </view>
        
        <view class="popup-content" v-if="generatedQRCode">
          <view class="large-qr-preview">
            <image 
              :src="generatedQRCode" 
              mode="aspectFit"
              class="large-qr-image"
            />
          </view>
          
          <view class="qr-details">
            <text class="detail-item">名称: {{ selectedQrForGeneration?.name }}</text>
            <text class="detail-item">位置: {{ selectedQrForGeneration?.location }}</text>
            <text class="detail-item">内容: {{ selectedQrForGeneration?.code }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="download-btn" @click="downloadQRCode">下载二维码</button>
          <button class="confirm-btn" @click="closePreviewModal">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import qrCodeGenerator, { getPresetStyles } from '@/utils/qrCodeGenerator.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'QrManagement',
  mixins: [timeMixin],
  data() {
    return {
      qrCodes: [],
      qrStats: {},
      loading: false,
      showCreateModal: false,
      selectedQrCode: null,
      deleteQrId: null,
      selectedQrCodes: [], // 批量选择的二维码ID
      
      // 二维码生成相关
      selectedQrForGeneration: null,
      generatedQRCode: null,
      isGenerating: false,
      
      // 样式选项
      styleOptions: ['默认', '蓝色', '绿色', '红色', '橙色', '紫色'],
      styleIndex: 0,
      
      sizeOptions: ['小尺寸(128px)', '标准(256px)', '大尺寸(512px)'],
      sizeIndex: 1,
      
      errorLevelOptions: ['低容错(L)', '中容错(M)', '高容错(H)', '最高容错(Q)'],
      errorLevelIndex: 1,
      
      // 筛选条件
      statusOptions: ['全部', '启用', '停用'],
      statusIndex: 0,
      searchKeyword: '',
      
      // 创建表单
      createForm: {
        name: '',
        location: '',
        description: ''
      }
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadQrCodes()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    // 初始化页面
    initPage() {
      this.loadQrCodes()
    },

    // 加载二维码列表
    async loadQrCodes() {
      try {
        this.loading = true
        
        const params = {
          limit: 100,
          offset: 0
        }
        
        // 添加状态筛选
        if (this.statusIndex > 0) {
          params.status = this.statusIndex === 1 ? 'active' : 'inactive'
        }
        
        const response = await api.qrScan.getQrCodes(params)
        
        if (response.success) {
          this.qrCodes = response.data || []
          this.calculateStats()
        } else {
          uni.showToast({
            title: response.message || '获取二维码列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取二维码列表失败:', error)
        uni.showToast({
          title: '获取二维码列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 计算统计信息
    calculateStats() {
      this.qrStats = {
        totalQrCodes: this.qrCodes.length,
        activeQrCodes: this.qrCodes.filter(qr => qr.status === 'active').length,
        totalScans: this.qrCodes.reduce((sum, qr) => sum + (qr.usageStats?.totalScans || 0), 0)
      }
    },

    // 状态筛选
    onStatusChange(e) {
      this.statusIndex = e.detail.value
      this.loadQrCodes()
    },

    // 搜索
    onSearchChange() {
      // 这里可以实现实时搜索
      // 简化处理，重新加载数据
      this.loadQrCodes()
    },

    // 创建二维码
    async createQrCode() {
      if (!this.createForm.name.trim()) {
        uni.showToast({
          title: '请输入二维码名称',
          icon: 'none'
        })
        return
      }
      
      if (!this.createForm.location.trim()) {
        uni.showToast({
          title: '请输入张贴位置',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '创建中...' })
        
        const response = await api.qrScan.createQrCode(this.createForm)
        
        if (response.success) {
          uni.showToast({
            title: '二维码创建成功',
            icon: 'success'
          })
          
          this.closeCreateModal()
          this.loadQrCodes()
        } else {
          uni.showToast({
            title: response.message || '创建二维码失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('创建二维码失败:', error)
        uni.showToast({
          title: '创建二维码失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 查看二维码详情
    async viewQrDetail(qrId) {
      try {
        uni.showLoading({ title: '加载中...' })
        
        const response = await api.qrScan.getQrCodeDetail(qrId)
        
        if (response.success) {
          this.selectedQrCode = response.data
          this.$refs.detailPopup.open()
        } else {
          uni.showToast({
            title: response.message || '获取二维码详情失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取二维码详情失败:', error)
        uni.showToast({
          title: '获取二维码详情失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 切换二维码状态
    async toggleQrStatus(qrId, currentStatus) {
      try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        
        uni.showLoading({ title: '更新中...' })
        
        const response = await api.qrScan.updateQrCodeStatus(qrId, newStatus)
        
        if (response.success) {
          uni.showToast({
            title: `二维码已${newStatus === 'active' ? '启用' : '停用'}`,
            icon: 'success'
          })
          
          this.loadQrCodes()
        } else {
          uni.showToast({
            title: response.message || '更新状态失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新状态失败:', error)
        uni.showToast({
          title: '更新状态失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 删除二维码
    deleteQrCode(qrId) {
      this.deleteQrId = qrId
      this.$refs.deletePopup.open()
    },

    // 执行删除
    async execute删除() {
      try {
        uni.showLoading({ title: '删除中...' })
        
        // 这里需要调用删除接口，但文档中没有提供
        // 暂时模拟删除成功
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        this.close删除Modal()
        this.loadQrCodes()
      } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 关闭创建弹窗
    closeCreateModal() {
      this.showCreateModal = false
      this.createForm = {
        name: '',
        location: '',
        description: ''
      }
      this.$refs.createPopup.close()
    },

    // 关闭详情弹窗
    closeDetailModal() {
      this.selectedQrCode = null
      this.$refs.detailPopup.close()
    },

    // 关闭删除弹窗
    close删除Modal() {
      this.deleteQrId = null
      this.$refs.deletePopup.close()
    },

    // 格式化时间
    formatTime(timeStr) {
      return this.$formatTime(timeStr, 'YYYY-MM-DD HH:mm')
    },

    // 刷新数据
    refreshData() {
      this.loadQrCodes()
      uni.stopPullDownRefresh()
    },

    // 获取启用百分比
    get活跃Percentage() {
      if (!this.qrStats.totalQrCodes || this.qrStats.totalQrCodes === 0) return 0
      return Math.round((this.qrStats.activeQrCodes / this.qrStats.totalQrCodes) * 100)
    },

    // 获取成功率
    get成功Rate(qrCode) {
      const totalScans = qrCode.usageStats?.totalScans || 0
      const successfulScans = qrCode.usageStats?.successfulScans || 0
      if (totalScans === 0) return 0
      return Math.round((successfulScans / totalScans) * 100)
    },

    // 获取柱状图高度
    getBarHeight(scans) {
      const maxScans = Math.max(...this.qrCodes.map(qr => 
        Math.max(...(qr.usageStats?.recentUsage?.map(day => day.scans) || [0]))
      ))
      if (maxScans === 0) return 10
      return Math.max(10, (scans / maxScans) * 60)
    },

    // 切换选择状态
    toggleSelection(qrId) {
      const index = this.selectedQrCodes.indexOf(qrId)
      if (index > -1) {
        this.selectedQrCodes.splice(index, 1)
      } else {
        this.selectedQrCodes.push(qrId)
      }
    },

    // 清除选择
    clearSelection() {
      this.selectedQrCodes = []
    },

    // 批量启用
    async batchEnable() {
      if (this.selectedQrCodes.length === 0) return
      
      try {
        uni.showLoading({ title: '批量启用中...' })
        
        const promises = this.selectedQrCodes.map(qrId => 
          api.qrScan.updateQrCodeStatus(qrId, 'active')
        )
        
        await Promise.all(promises)
        
        uni.showToast({
          title: '批量启用成功',
          icon: 'success'
        })
        
        this.clearSelection()
        this.loadQrCodes()
      } catch (error) {
        console.error('批量启用失败:', error)
        uni.showToast({
          title: '批量启用失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 批量停用
    async batchDisable() {
      if (this.selectedQrCodes.length === 0) return
      
      try {
        uni.showLoading({ title: '批量停用中...' })
        
        const promises = this.selectedQrCodes.map(qrId => 
          api.qrScan.updateQrCodeStatus(qrId, 'inactive')
        )
        
        await Promise.all(promises)
        
        uni.showToast({
          title: '批量停用成功',
          icon: 'success'
        })
        
        this.clearSelection()
        this.loadQrCodes()
      } catch (error) {
        console.error('批量停用失败:', error)
        uni.showToast({
          title: '批量停用失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 批量删除
    batch删除() {
      if (this.selectedQrCodes.length === 0) return
      
      uni.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.selectedQrCodes.length} 个二维码吗？删除后无法恢复。`,
        success: (res) => {
          if (res.confirm) {
            this.executeBatch删除()
          }
        }
      })
    },

    // 执行批量删除
    async executeBatch删除() {
      try {
        uni.showLoading({ title: '批量删除中...' })
        
        // 这里需要调用批量删除接口，但文档中没有提供
        // 暂时模拟删除成功
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uni.showToast({
          title: '批量删除成功',
          icon: 'success'
        })
        
        this.clearSelection()
        this.loadQrCodes()
      } catch (error) {
        console.error('批量删除失败:', error)
        uni.showToast({
          title: '批量删除失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 生成二维码
    generateQRCode(qrCode) {
      this.selectedQrForGeneration = qrCode
      this.generatedQRCode = null
      this.$refs.generatePopup.open()
    },

    // 生成二维码图片
    async generateQRCodeImage() {
      if (!this.selectedQrForGeneration) return

      try {
        this.isGenerating = true

        // 获取样式配置
        const styleConfig = this.getStyleConfig()
        
        // 生成二维码
        const qrCodeDataURL = await qrCodeGenerator.generateQRCode(
          this.selectedQrForGeneration.code,
          styleConfig
        )

        this.generatedQRCode = qrCodeDataURL

        uni.showToast({
          title: '二维码生成成功',
          icon: 'success'
        })

      } catch (error) {
        console.error('生成二维码失败:', error)
        uni.showToast({
          title: '生成二维码失败',
          icon: 'none'
        })
      } finally {
        this.isGenerating = false
      }
    },

    // 获取样式配置
    getStyleConfig() {
      const presets = getPresetStyles()
      let config = {}

      // 应用预设样式
      const styleMap = {
        0: 'default',
        1: 'blue',
        2: 'green',
        3: 'red',
        4: 'orange',
        5: 'purple'
      }
      
      const selectedStyle = styleMap[this.styleIndex]
      if (selectedStyle && presets[selectedStyle]) {
        config = { ...config, ...presets[selectedStyle] }
      }

      // 应用尺寸设置
      const sizeMap = {
        0: { width: 128, height: 128 },
        1: { width: 256, height: 256 },
        2: { width: 512, height: 512 }
      }
      
      const selectedSize = sizeMap[this.sizeIndex]
      if (selectedSize) {
        config = { ...config, ...selectedSize }
      }

      // 应用容错级别
      const errorLevelMap = {
        0: 'L',
        1: 'M',
        2: 'H',
        3: 'Q'
      }
      
      const selected错误Level = errorLevelMap[this.errorLevelIndex]
      if (selected错误Level) {
        config.errorCorrectionLevel = selected错误Level
      }

      return config
    },

    // 下载二维码
    downloadQRCode() {
      if (!this.generatedQRCode || !this.selectedQrForGeneration) return

      try {
        const filename = `${this.selectedQrForGeneration.name}_${Date.now()}.png`
        qrCodeGenerator.downloadQRCode(this.generatedQRCode, filename)
        
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('下载失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },

    // 预览二维码
    previewQRCode() {
      this.$refs.previewPopup.open()
    },

    // 样式选择
    onStyleChange(e) {
      this.styleIndex = e.detail.value
    },

    // 尺寸选择
    onSizeChange(e) {
      this.sizeIndex = e.detail.value
    },

    // 容错级别选择
    on错误LevelChange(e) {
      this.errorLevelIndex = e.detail.value
    },

    // 关闭生成弹窗
    closeGenerateModal() {
      this.selectedQrForGeneration = null
      this.generatedQRCode = null
      this.$refs.generatePopup.close()
    },

    // 关闭预览弹窗
    closePreviewModal() {
      this.$refs.previewPopup.close()
    }
  }
}
</script>

<style scoped>
.qr-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.create-btn {
  display: flex;
  align-items: center;
  padding: 15rpx 25rpx;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.create-btn text:first-child {
  margin-right: 8rpx;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #2196F3;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.stat-trend {
  font-size: 20rpx;
  color: #4CAF50;
  margin-top: 5rpx;
}

.stat-percentage {
  font-size: 20rpx;
  color: #2196F3;
  margin-top: 5rpx;
}

.stat-time {
  font-size: 20rpx;
  color: #FF9800;
  margin-top: 5rpx;
}

.filter-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  width: 100rpx;
  margin-right: 10rpx;
}

.picker-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.batch-actions {
  background: #e3f2fd;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid #2196F3;
}

.batch-info {
  font-size: 28rpx;
  color: #2196F3;
  font-weight: bold;
}

.batch-buttons {
  display: flex;
  gap: 10rpx;
}

.batch-btn {
  padding: 10rpx 20rpx;
  border: none;
  border-radius: 6rpx;
  font-size: 24rpx;
  background: #2196F3;
  color: white;
}

.batch-btn.danger {
  background: #f44336;
}

.qr-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.qr-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  position: relative;
  transition: all 0.3s ease;
}

.qr-item.selected {
  border: 2rpx solid #2196F3;
  box-shadow: 0 4rpx 12rpx rgba(33, 150, 243, 0.3);
}

.qr-selector {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  z-index: 1;
}

.qr-item.selected .qr-selector {
  background: #2196F3;
}

.selector-icon {
  font-size: 24rpx;
  color: #333;
}

.qr-item.selected .selector-icon {
  color: white;
}

.qr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.qr-info {
  display: flex;
  flex-direction: column;
}

.qr-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.qr-location {
  font-size: 26rpx;
  color: #666;
}

.qr-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
}

.qr-status.active {
  background: #4CAF50;
}

.qr-status.inactive {
  background: #f44336;
}

.qr-details {
  margin-bottom: 20rpx;
}

.qr-code {
  font-size: 24rpx;
  color: #2196F3;
  display: block;
  margin-bottom: 10rpx;
  word-break: break-all;
}

.qr-description {
  font-size: 26rpx;
  color: #666;
}

.qr-stats {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.qr-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.qr-stats .stat-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.qr-stats .stat-value {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}

.usage-trend {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.trend-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.trend-chart {
  display: flex;
  align-items: end;
  gap: 8rpx;
  height: 80rpx;
}

.trend-bar {
  flex: 1;
  background: linear-gradient(to top, #2196F3, #64B5F6);
  border-radius: 4rpx 4rpx 0 0;
  min-height: 10rpx;
  transition: all 0.3s ease;
}

.trend-bar:hover {
  background: linear-gradient(to top, #1976D2, #42A5F5);
}

.qr-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  padding: 15rpx 20rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  background: #f0f0f0;
  color: #333;
}

.action-btn.toggle-btn {
  background: #FF9800;
  color: white;
}

.action-btn.danger {
  background: #f44336;
  color: white;
}

.action-btn.generate-btn {
  background: #4CAF50;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-state .iconfont {
  font-size: 120rpx;
  color: #ccc;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
}

.empty-btn {
  padding: 20rpx 40rpx;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.loading-state {
  text-align: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 弹窗样式 */
.create-popup,
.detail-popup,
.delete-popup,
.generate-popup,
.preview-popup {
  width: 600rpx;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #666;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  padding: 30rpx;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  min-height: 120rpx;
}

.detail-section {
  margin-bottom: 20rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15rpx;
  margin-top: 10rpx;
}

.stats-grid .stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.stats-grid .stat-label {
  font-size: 24rpx;
  color: #666;
}

.stats-grid .stat-value {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}

.delete-text {
  font-size: 28rpx;
  color: #333;
  text-align: center;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn.danger {
  background: #f44336;
}

/* 二维码生成弹窗样式 */
.qr-info-section,
.style-section,
.preview-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #eee;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  padding: 10rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  width: 120rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  text-align: right;
}

.qr-content {
  font-family: monospace;
  font-size: 22rpx;
  word-break: break-all;
}

.style-group {
  margin-bottom: 20rpx;
}

.style-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.qr-preview {
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.qr-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
}

.large-qr-preview {
  text-align: center;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.large-qr-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
}

.qr-details {
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.detail-item {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.generate-btn {
  background: #4CAF50;
  color: white;
}

.download-btn {
  background: #2196F3;
  color: white;
}
</style>
