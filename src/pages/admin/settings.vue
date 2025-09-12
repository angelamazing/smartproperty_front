<template>
  <view class="settings-admin-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-title">系统设置</view>
      <view class="header-subtitle">管理系统参数、监控和维护功能</view>
    </view>

    <!-- 功能导航 -->
    <view class="tab-navigation">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'config' }"
        @click="switchTab('config')"
      >
        <text>系统配置</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'verification' }"
        @click="switchTab('verification')"
      >
        <text>验证设置</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'stats' }"
        @click="switchTab('stats')"
      >
        <text>数据统计</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'maintenance' }"
        @click="switchTab('maintenance')"
      >
        <text>系统维护</text>
      </view>
    </view>

    <!-- 系统配置标签页 -->
    <view v-if="activeTab === 'config'" class="tab-content">
      <!-- 基础配置 -->
      <view class="config-section">
        <view class="section-title">
          <text>基础配置</text>
          <button class="save-config-btn" @click="saveBasicConfig" :disabled="!hasConfigChanges">
            保存配置
          </button>
        </view>
        
        <view class="config-form">
          <view class="form-item">
            <text class="form-label">系统名称</text>
            <input 
              class="form-input" 
              v-model="basicConfig.systemName" 
              placeholder="请输入系统名称"
              @input="onConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">系统版本</text>
            <input 
              class="form-input" 
              v-model="basicConfig.systemVersion" 
              placeholder="请输入系统版本"
              @input="onConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">联系邮箱</text>
            <input 
              class="form-input" 
              v-model="basicConfig.contactEmail" 
              placeholder="请输入联系邮箱"
              type="email"
              @input="onConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">联系电话</text>
            <input 
              class="form-input" 
              v-model="basicConfig.contactPhone" 
              placeholder="请输入联系电话"
              type="number"
              @input="onConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">公司地址</text>
            <textarea 
              class="form-textarea" 
              v-model="basicConfig.company添加ress" 
              placeholder="请输入公司地址"
              @input="onConfigChange"
            />
          </view>
        </view>
      </view>

      <!-- 业务配置 -->
      <view class="config-section">
        <view class="section-title">
          <text>业务配置</text>
        </view>
        
        <view class="config-form">
          <view class="form-item">
            <text class="form-label">预约提前天数</text>
            <input 
              class="form-input" 
              v-model="businessConfig.reservationDays" 
              placeholder="用户可提前几天预约"
              type="number"
              @input="onConfigChange"
            />
            <text class="form-hint">设置用户可以提前多少天进行场地预约</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">取消预约时限（小时）</text>
            <input 
              class="form-input" 
              v-model="businessConfig.cancellationHours" 
              placeholder="预约前几小时可取消"
              type="number"
              @input="onConfigChange"
            />
            <text class="form-hint">预约开始前多少小时内不能取消</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">默认预约时长（小时）</text>
            <input 
              class="form-input" 
              v-model="businessConfig.defaultDuration" 
              placeholder="默认预约时长"
              type="number"
              @input="onConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">报餐截止时间</text>
            <picker mode="time" :value="businessConfig.diningDeadline" @change="onTimeChange">
              <view class="time-picker">
                <text>{{ businessConfig.diningDeadline || '请选择时间' }}</text>
                <text class="picker-icon">🕐</text>
              </view>
            </picker>
            <text class="form-hint">每日报餐的截止时间</text>
          </view>
          
          <view class="form-item switch-item">
            <text class="form-label">启用自动确认预约</text>
            <switch 
              :checked="businessConfig.auto确认" 
              @change="onSwitchChange"
              data-field="auto确认"
            />
            <text class="form-hint">开启后预约将自动确认，无需管理员审核</text>
          </view>
          
          <view class="form-item switch-item">
            <text class="form-label">启用短信通知</text>
            <switch 
              :checked="businessConfig.smsNotification" 
              @change="onSwitchChange"
              data-field="smsNotification"
            />
            <text class="form-hint">开启后重要操作将发送短信通知</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 验证设置标签页 -->
    <view v-if="activeTab === 'verification'" class="tab-content">
      <view class="verification-section">
        <view class="section-title">
          <text>验证方案配置</text>
          <button class="save-config-btn" @click="saveVerificationConfig">
            保存配置
          </button>
        </view>
        
        <view class="verification-schemes">
          <view 
            v-for="scheme in verificationSchemes" 
            :key="scheme.id"
            class="scheme-item"
            :class="{ active: scheme.is启用 }"
          >
            <view class="scheme-header">
              <view class="scheme-info">
                <text class="scheme-name">{{ scheme.name }}</text>
                <text class="scheme-desc">{{ scheme.description }}</text>
              </view>
              <switch 
                :checked="scheme.is启用" 
                @change="onSchemeToggle"
                :data-id="scheme.id"
              />
            </view>
            
            <view v-if="scheme.is启用" class="scheme-config">
              <view v-if="scheme.type === 'qr_code'" class="qr-config">
                <view class="config-item">
                  <text class="config-label">验证码有效期（分钟）</text>
                  <input 
                    class="config-input" 
                    v-model="scheme.config.validityMinutes" 
                    type="number"
                    @input="onSchemeConfigChange(scheme)"
                  />
                </view>
                <view class="config-item">
                  <text class="config-label">验证码长度</text>
                  <input 
                    class="config-input" 
                    v-model="scheme.config.codeLength" 
                    type="number"
                    @input="onSchemeConfigChange(scheme)"
                  />
                </view>
              </view>
              
              <view v-if="scheme.type === 'card_swipe'" class="card-config">
                <view class="config-item">
                  <text class="config-label">支持的卡片类型</text>
                  <checkbox-group @change="onCardTypeChange">
                    <label v-for="cardType in cardTypes" :key="cardType.value">
                      <checkbox 
                        :value="cardType.value" 
                        :checked="scheme.config.supportedCardTypes.includes(cardType.value)"
                      />
                      {{ cardType.label }}
                    </label>
                  </checkbox-group>
                </view>
              </view>
              
              <view v-if="scheme.type === 'direct_confirm'" class="direct-config">
                <view class="config-item switch-item">
                  <text class="config-label">需要地理位置验证</text>
                  <switch 
                    :checked="scheme.config.requireLocation" 
                    @change="onLocationToggle"
                    :data-id="scheme.id"
                  />
                </view>
                <view v-if="scheme.config.requireLocation" class="location-config">
                  <view class="config-item">
                    <text class="config-label">允许的距离范围（米）</text>
                    <input 
                      class="config-input" 
                      v-model="scheme.config.locationRadius" 
                      type="number"
                      @input="onSchemeConfigChange(scheme)"
                    />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据统计标签页 -->
    <view v-if="activeTab === 'stats'" class="tab-content">
      <!-- 统计时间选择 -->
      <view class="stats-filters">
        <view class="filter-row">
          <picker mode="date" :value="statsStartDate" @change="onStatsStartDateChange">
            <view class="filter-picker">
              <text>{{ statsStartDate || '开始日期' }}</text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
          
          <picker mode="date" :value="statsEndDate" @change="onStatsEndDateChange">
            <view class="filter-picker">
              <text>{{ statsEndDate || '结束日期' }}</text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
          
          <button class="refresh-stats-btn" @click="loadStatistics">
            刷新统计
          </button>
        </view>
      </view>

      <!-- 综合统计 -->
      <view class="overall-stats">
        <view class="stats-grid">
          <view class="stat-card">
            <view class="stat-icon users">
              <text>👥</text>
            </view>
            <view class="stat-info">
              <text class="stat-number">{{ overallStats.total用户s || 0 }}</text>
              <text class="stat-label">总用户数</text>
            </view>
          </view>
          
          <view class="stat-card">
            <view class="stat-icon orders">
              <text>🍽️</text>
            </view>
            <view class="stat-info">
              <text class="stat-number">{{ overallStats.totalOrders || 0 }}</text>
              <text class="stat-label">总报餐次数</text>
            </view>
          </view>
          
          <view class="stat-card">
            <view class="stat-icon reservations">
              <text>📅</text>
            </view>
            <view class="stat-info">
              <text class="stat-number">{{ overallStats.totalReservations || 0 }}</text>
              <text class="stat-label">总预约次数</text>
            </view>
          </view>
          
          <view class="stat-card">
            <view class="stat-icon verifications">
              <text>✅</text>
            </view>
            <view class="stat-info">
              <text class="stat-number">{{ overallStats.totalVerifications || 0 }}</text>
              <text class="stat-label">总验证次数</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 详细统计 -->
      <view class="detailed-stats">
        <view class="stats-section">
          <view class="section-title">
            <text>报餐统计</text>
            <button class="export-btn" @click="exportDiningStats">导出</button>
          </view>
          <view class="stats-content">
            <view class="stats-item">
              <text class="stats-label">今日报餐人数</text>
              <text class="stats-value">{{ diningStats.todayCount || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">本周报餐人数</text>
              <text class="stats-value">{{ diningStats.weekCount || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">本月报餐人数</text>
              <text class="stats-value">{{ diningStats.monthCount || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">平均每日报餐</text>
              <text class="stats-value">{{ diningStats.averageDaily || 0 }}</text>
            </view>
          </view>
        </view>

        <view class="stats-section">
          <view class="section-title">
            <text>预约统计</text>
            <button class="export-btn" @click="exportReservationStats">导出</button>
          </view>
          <view class="stats-content">
            <view class="stats-item">
              <text class="stats-label">今日预约数量</text>
              <text class="stats-value">{{ reservationStats.todayCount || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">本周预约数量</text>
              <text class="stats-value">{{ reservationStats.weekCount || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">场地使用率</text>
              <text class="stats-value">{{ reservationStats.utilizationRate || 0 }}%</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">热门场地</text>
              <text class="stats-value">{{ reservationStats.popularVenue || '暂无' }}</text>
            </view>
          </view>
        </view>

        <view class="stats-section">
          <view class="section-title">
            <text>用户统计</text>
            <button class="export-btn" @click="export用户Stats">导出</button>
          </view>
          <view class="stats-content">
            <view class="stats-item">
              <text class="stats-label">新增用户（今日）</text>
              <text class="stats-value">{{ userStats.new用户s今天 || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">活跃用户（今日）</text>
              <text class="stats-value">{{ userStats.active用户s今天 || 0 }}</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">用户留存率</text>
              <text class="stats-value">{{ userStats.retentionRate || 0 }}%</text>
            </view>
            <view class="stats-item">
              <text class="stats-label">平均使用时长</text>
              <text class="stats-value">{{ userStats.averageUsageTime || 0 }}分钟</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 系统维护标签页 -->
    <view v-if="activeTab === 'maintenance'" class="tab-content">
      <!-- 系统状态 -->
      <view class="system-status">
        <view class="section-title">
          <text>系统状态</text>
          <button class="refresh-status-btn" @click="checkSystemStatus">
            刷新状态
          </button>
        </view>
        
        <view class="status-grid">
          <view class="status-item">
            <view class="status-icon" :class="{ online: systemStatus.apiStatus }">
              <text>🔗</text>
            </view>
            <view class="status-info">
              <text class="status-label">API服务</text>
              <text class="status-value" :class="{ online: systemStatus.apiStatus }">
                {{ systemStatus.apiStatus ? 'normal' : '异常' }}
              </text>
            </view>
          </view>
          
          <view class="status-item">
            <view class="status-icon" :class="{ online: systemStatus.dbStatus }">
              <text>💾</text>
            </view>
            <view class="status-info">
              <text class="status-label">数据库</text>
              <text class="status-value" :class="{ online: systemStatus.dbStatus }">
                {{ systemStatus.dbStatus ? 'normal' : '异常' }}
              </text>
            </view>
          </view>
          
          <view class="status-item">
            <view class="status-icon" :class="{ online: systemStatus.storageStatus }">
              <text>☁️</text>
            </view>
            <view class="status-info">
              <text class="status-label">云存储</text>
              <text class="status-value" :class="{ online: systemStatus.storageStatus }">
                {{ systemStatus.storageStatus ? 'normal' : '异常' }}
              </text>
            </view>
          </view>
          
          <view class="status-item">
            <view class="status-icon" :class="{ online: systemStatus.functionStatus }">
              <text>⚡</text>
            </view>
            <view class="status-info">
              <text class="status-label">云函数</text>
              <text class="status-value" :class="{ online: systemStatus.functionStatus }">
                {{ systemStatus.functionStatus ? 'normal' : '异常' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 维护操作 -->
      <view class="maintenance-actions">
        <view class="section-title">
          <text>维护操作</text>
        </view>
        
        <view class="actions-grid">
          <view class="action-card" @click="clearCache">
            <view class="action-icon">
              <text>🧹</text>
            </view>
            <view class="action-info">
              <text class="action-title">清理缓存</text>
              <text class="action-desc">清理系统缓存数据</text>
            </view>
          </view>
          
          <view class="action-card" @click="backupData">
            <view class="action-icon">
              <text>💾</text>
            </view>
            <view class="action-info">
              <text class="action-title">数据备份</text>
              <text class="action-desc">备份重要数据</text>
            </view>
          </view>
          
          <view class="action-card" @click="viewLogs">
            <view class="action-icon">
              <text>📋</text>
            </view>
            <view class="action-info">
              <text class="action-title">系统日志</text>
              <text class="action-desc">查看系统运行日志</text>
            </view>
          </view>
          
          <view class="action-card" @click="sendNotification">
            <view class="action-icon">
              <text>📢</text>
            </view>
            <view class="action-info">
              <text class="action-title">发送通知</text>
              <text class="action-desc">向用户发送系统通知</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统信息 -->
      <view class="system-info">
        <view class="section-title">
          <text>系统信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">系统版本</text>
            <text class="info-value">{{ system信息.version || '1.0.0' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">数据库版本</text>
            <text class="info-value">{{ system信息.dbVersion || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务器时间</text>
            <text class="info-value">{{ system信息.serverTime || getCurrentTime() }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">运行时长</text>
            <text class="info-value">{{ system信息.uptime || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">内存使用</text>
            <text class="info-value">{{ system信息.memoryUsage || '未知' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <BottomNav :currentPage="'/pages/admin/settings'" />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import api from '@/utils/api'

export default {
  name: 'Settings管理员',
  components: {
    BottomNav
  },
  data() {
    return {
      activeTab: 'config',
      hasConfigChanges: false,
      
      // 基础配置
      basicConfig: {
        systemName: '',
        systemVersion: '',
        contactEmail: '',
        contactPhone: '',
        company添加ress: ''
      },
      
      // 业务配置
      businessConfig: {
        reservationDays: 7,
        cancellationHours: 2,
        defaultDuration: 1,
        diningDeadline: '09:00',
        auto确认: false,
        smsNotification: false
      },
      
      // 验证方案
      verificationSchemes: [
        {
          id: 1,
          name: '二维码验证',
          description: '用户扫码验证用餐资格',
          type: 'qr_code',
          is启用: true,
          config: {
            validityMinutes: 30,
            codeLength: 6
          }
        },
        {
          id: 2,
          name: '刷卡验证',
          description: '刷卡验证用户身份',
          type: 'card_swipe',
          is启用: false,
          config: {
            supportedCardTypes: ['employee', 'visitor']
          }
        },
        {
          id: 3,
          name: '直接确认',
          description: '无需验证码直接确认',
          type: 'direct_confirm',
          is启用: false,
          config: {
            requireLocation: false,
            locationRadius: 50
          }
        }
      ],
      
      cardTypes: [
        { value: 'employee', label: '员工卡' },
        { value: 'visitor', label: '访客卡' },
        { value: 'vip', label: 'VIP卡' }
      ],
      
      // 统计数据
      statsStartDate: '',
      statsEndDate: '',
      overallStats: {},
      diningStats: {},
      reservationStats: {},
      userStats: {},
      
      // 系统状态
      systemStatus: {
        apiStatus: true,
        dbStatus: true,
        storageStatus: true,
        functionStatus: true
      },
      
      system信息: {},
      
      loading: false
    }
  },
  onLoad(options) {
    this.check管理员Permission()
    
    // 根据参数设置初始标签页
    if (options.tab) {
      this.activeTab = options.tab
    }
    
    this.loadSystemConfig()
    this.loadVerificationSchemes()
    this.initStatsDate()
    this.checkSystemStatus()
  },
  methods: {
    /**
     * 检查管理员权限
     */
    async check管理员Permission() {
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
      if (tab === 'stats') {
        this.loadStatistics()
      } else if (tab === 'maintenance') {
        this.checkSystemStatus()
      }
    },

    /**
     * 系统配置相关
     */
    async loadSystemConfig() {
      try {
        const response = await api.admin.getSystemConfig()
        if (response.success) {
          this.basicConfig = { ...this.basicConfig, ...response.data.basic }
          this.businessConfig = { ...this.businessConfig, ...response.data.business }
        }
      } catch (error) {
        console.error('加载系统配置失败:', error)
      }
    },

    onConfigChange() {
      this.hasConfigChanges = true
    },

    onTimeChange(e) {
      this.businessConfig.diningDeadline = e.detail.value
      this.hasConfigChanges = true
    },

    onSwitchChange(e) {
      const field = e.currentTarget.dataset.field
      this.businessConfig[field] = e.detail.value
      this.hasConfigChanges = true
    },

    async saveBasicConfig() {
      if (!this.hasConfigChanges) return
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        const configData = {
          basic: this.basicConfig,
          business: this.businessConfig
        }
        
        const response = await api.admin.updateSystemConfig(configData)
        if (response.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.hasConfigChanges = false
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    /**
     * 验证方案相关
     */
    async loadVerificationSchemes() {
      try {
        const response = await api.admin.getVerificationSchemes()
        if (response.success) {
          this.verificationSchemes = response.data || this.verificationSchemes
        }
      } catch (error) {
        console.error('加载验证方案失败:', error)
      }
    },

    onSchemeToggle(e) {
      const schemeId = parseInt(e.currentTarget.dataset.id)
      const scheme = this.verificationSchemes.find(s => s.id === schemeId)
      if (scheme) {
        scheme.is启用 = e.detail.value
      }
    },

    onSchemeConfigChange(scheme) {
      // 配置已更改，标记需要保存
    },

    onCardTypeChange(e) {
      const cardScheme = this.verificationSchemes.find(s => s.type === 'card_swipe')
      if (cardScheme) {
        cardScheme.config.supportedCardTypes = e.detail.value
      }
    },

    onLocationToggle(e) {
      const schemeId = parseInt(e.currentTarget.dataset.id)
      const scheme = this.verificationSchemes.find(s => s.id === schemeId)
      if (scheme) {
        scheme.config.requireLocation = e.detail.value
      }
    },

    async saveVerificationConfig() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        const response = await api.admin.updateVerificationSchemes(this.verificationSchemes)
        if (response.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存验证配置失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    /**
     * 统计相关
     */
    initStatsDate() {
      const today = this.$createDate()
      const lastWeek = today.subtract(7, 'day')
      
      this.statsEndDate = today.format('YYYY-MM-DD')
      this.statsStartDate = lastWeek.toISOString().split('T')[0]
    },

    onStatsStartDateChange(e) {
      this.statsStartDate = e.detail.value
    },

    onStatsEndDateChange(e) {
      this.statsEndDate = e.detail.value
    },

    async loadStatistics() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        const params = {
          startDate: this.statsStartDate,
          endDate: this.statsEndDate
        }
        
        // 并行加载各种统计数据
        const [overallRes, diningRes, reservationRes, userRes] = await Promise.all([
          api.admin.getOverallStats(params),
          api.admin.getDiningStats(params),
          api.admin.getReservationStats(params),
          api.admin.getUserStats(params)
        ])
        
        if (overallRes.success) this.overallStats = overallRes.data
        if (diningRes.success) this.diningStats = diningRes.data
        if (reservationRes.success) this.reservationStats = reservationRes.data
        if (userRes.success) this.userStats = userRes.data
        
      } catch (error) {
        console.error('加载统计数据失败:', error)
        uni.showToast({
          title: '加载统计数据失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    exportDiningStats() {
      this.exportData('dining')
    },

    exportReservationStats() {
      this.exportData('reservations')
    },

    export用户Stats() {
      this.exportData('users')
    },

    async exportData(type) {
      try {
        const params = {
          type,
          startDate: this.statsStartDate,
          endDate: this.statsEndDate
        }
        
        const response = await api.admin.exportStatisticsData(params)
        if (response.success) {
          // 处理下载逻辑
          uni.showToast({
            title: '导出成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('导出数据失败:', error)
        uni.showToast({
          title: '导出失败',
          icon: 'error'
        })
      }
    },

    /**
     * 系统维护相关
     */
    async checkSystemStatus() {
      try {
        const response = await api.admin.getSystemStatus()
        if (response.success) {
          this.systemStatus = response.data.status
          this.system信息 = response.data.info
        }
      } catch (error) {
        console.error('检查系统状态失败:', error)
        // 假设服务异常
        this.systemStatus = {
          apiStatus: false,
          dbStatus: false,
          storageStatus: false,
          functionStatus: false
        }
      }
    },

    async clearCache() {
      uni.showModal({
        title: '确认清理',
        content: '确定要清理系统缓存吗？此操作可能会影响系统性能。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await api.admin.clearCache()
              if (response.success) {
                uni.showToast({
                  title: '清理成功',
                  icon: 'success'
                })
              }
            } catch (error) {
              console.error('清理缓存失败:', error)
              uni.showToast({
                title: '清理失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },

    async backupData() {
      uni.showModal({
        title: '确认备份',
        content: '确定要开始数据备份吗？此操作可能需要较长时间。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '备份中...' })
              const response = await api.admin.backupData()
              if (response.success) {
                uni.showToast({
                  title: '备份成功',
                  icon: 'success'
                })
              }
            } catch (error) {
              console.error('数据备份失败:', error)
              uni.showToast({
                title: '备份失败',
                icon: 'error'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },

    viewLogs() {
      uni.navigateTo({
        url: '/pages/admin/system-logs'
      })
    },

    sendNotification() {
      uni.navigateTo({
        url: '/pages/admin/send-notification'
      })
    },

    /**
     * 工具方法
     */
    getCurrentTime() {
      return this.$formatTime(this.$createDate(), 'YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-admin-container {
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
  padding: 30rpx 20rpx;
  text-align: center;
  font-size: 24rpx;
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

/* 配置区域 */
.config-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
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

.save-config-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.save-config-btn:disabled {
  background: #ccc;
  color: #999;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item.switch-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.switch-item .form-label {
  margin-bottom: 0;
  flex: 1;
}

.form-input,
.form-textarea {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
}

.form-textarea {
  min-height: 120rpx;
}

.form-hint {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.time-picker {
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
}

.picker-icon {
  font-size: 28rpx;
}

/* 验证方案 */
.verification-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.verification-schemes {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.scheme-item {
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 24rpx;
  transition: all 0.3s ease;
}

.scheme-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.scheme-info {
  flex: 1;
}

.scheme-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.scheme-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.scheme-config {
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-top: 16rpx;
}

.config-item {
  margin-bottom: 20rpx;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-item.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.switch-item .config-label {
  margin-bottom: 0;
}

.config-input {
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 6rpx;
  padding: 16rpx;
  font-size: 24rpx;
  color: #333;
}

.location-config {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #e9ecef;
}

/* 统计相关 */
.stats-filters {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.filter-picker {
  flex: 1;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
}

.refresh-stats-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 30rpx;
  font-size: 24rpx;
}

.overall-stats {
  margin-bottom: 30rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 36rpx;
}

.stat-icon.users {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stat-icon.orders {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.stat-icon.reservations {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.stat-icon.verifications {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.detailed-stats {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.stats-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.export-btn {
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.stats-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stats-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
  text-align: center;
}

.stats-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.stats-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

/* 系统维护 */
.system-status {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.refresh-status-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.status-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
}

.status-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 28rpx;
  background: #e74c3c;
  color: white;
}

.status-icon.online {
  background: #27ae60;
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.status-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #e74c3c;
}

.status-value.online {
  color: #27ae60;
}

.maintenance-actions {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.action-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-card:active {
  transform: scale(0.98);
  background: #e9ecef;
}

.action-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 28rpx;
}

.action-info {
  display: flex;
  flex-direction: column;
}

.action-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.action-desc {
  font-size: 22rpx;
  color: #666;
}

.system-info {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.info-label {
  font-size: 26rpx;
  color: #333;
}

.info-value {
  font-size: 24rpx;
  color: #666;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .tab-item {
    padding: 20rpx 10rpx;
    font-size: 22rpx;
  }
  
  .stats-grid,
  .status-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-content {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .form-item.switch-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }
}
</style>
