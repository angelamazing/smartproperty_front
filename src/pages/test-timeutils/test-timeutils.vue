<!-- TimeUtils 实际使用示例 -->
<template>
  <div class="time-utils-demo">
    <h2>📅 TimeUtils iOS兼容性解决方案演示</h2>
    
    <!-- 基本使用演示 -->
    <div class="demo-section">
      <h3>1. 基本使用演示</h3>
      <div class="demo-item">
        <label>问题格式输入:</label>
        <input 
          v-model="problematicTime" 
          placeholder="例如: 9/13/2025, 5:39:15 PM"
          class="time-input"
        />
        <button @click="processTime" class="btn">解析并格式化</button>
      </div>
      
      <div class="result-box" v-if="processedResult">
        <p><strong>原始输入:</strong> {{ processedResult.original }}</p>
        <p><strong>解析状态:</strong> 
          <span :class="processedResult.isValid ? 'success' : 'error'">
            {{ processedResult.isValid ? '✅ 成功' : '❌ 失败' }}
          </span>
        </p>
        <p><strong>格式化结果:</strong> {{ processedResult.formatted }}</p>
        <p><strong>相对时间:</strong> {{ processedResult.relativeTime }}</p>
        <p><strong>ISO格式:</strong> {{ processedResult.isoString }}</p>
      </div>
    </div>

    <!-- 实际业务场景演示 -->
    <div class="demo-section">
      <h3>2. 实际业务场景</h3>
      
      <!-- 用户注册时间显示 -->
      <div class="business-demo">
        <h4>👤 用户信息显示</h4>
        <div class="user-info">
          <p><strong>注册时间:</strong> {{ userInfo.registerTimeDisplay }}</p>
          <p><strong>最后登录:</strong> {{ userInfo.lastLoginDisplay }}</p>
          <p><strong>账户状态:</strong> {{ userInfo.accountStatus }}</p>
        </div>
      </div>

      <!-- 预约时间处理 -->
      <div class="business-demo">
        <h4>📅 预约时间处理</h4>
        <div class="appointment-info">
          <p><strong>预约时间:</strong> {{ appointmentInfo.timeDisplay }}</p>
          <p><strong>距离预约:</strong> {{ appointmentInfo.timeUntil }}</p>
          <p><strong>状态:</strong> {{ appointmentInfo.status }}</p>
        </div>
      </div>

      <!-- 报餐时间显示 -->
      <div class="business-demo">
        <h4>🍽️ 报餐记录</h4>
        <div class="meal-records">
          <div v-for="meal in mealRecords" :key="meal.id" class="meal-item">
            <span class="meal-type">{{ meal.type }}</span>
            <span class="meal-time">{{ meal.timeDisplay }}</span>
            <span class="meal-status" :class="meal.statusClass">{{ meal.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量测试 -->
    <div class="demo-section">
      <h3>3. 批量兼容性测试</h3>
      <button @click="runBatchTest" class="btn">运行测试</button>
      
      <div v-if="batchTestResults.length > 0" class="test-results">
        <h4>测试结果:</h4>
        <div class="test-summary">
          <span class="success-count">✅ 成功: {{ successCount }}</span>
          <span class="total-count">📊 总计: {{ batchTestResults.length }}</span>
          <span class="success-rate">🎯 成功率: {{ successRate }}%</span>
        </div>
        
        <div class="test-details">
          <div v-for="(result, index) in batchTestResults" :key="index" class="test-item">
            <div class="test-input">{{ result.original }}</div>
            <div class="test-output" :class="result.isValid ? 'success' : 'error'">
              {{ result.isValid ? result.formatted : '解析失败' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { TimeUtils } from '@/utils/timeUtils.js';
import { quickExample, batchProcessTimes, handleApiResponse } from '@/utils/timeUtilsQuickstart.js';

export default {
  name: 'TimeUtilsDemo',
  
  data() {
    return {
      problematicTime: '9/13/2025, 5:39:15 PM',
      processedResult: null,
      batchTestResults: [],
      
      // 模拟用户数据
      userData: {
        registerTime: '12/25/2025, 11:59:59 PM',
        lastLoginTime: '1/1/2026, 12:00:00 AM',
        accountCreated: '9/2/2025, 3:35:21 AM'
      },
      
      // 模拟预约数据
      appointmentData: {
        appointmentTime: '9/15/2025, 2:30:00 PM'
      },
      
      // 模拟报餐数据
      mealData: [
        { id: 1, type: '早餐', time: '9/13/2025, 7:30:00 AM', status: 'confirmed' },
        { id: 2, type: '午餐', time: '9/13/2025, 12:00:00 PM', status: 'pending' },
        { id: 3, type: '晚餐', time: '9/13/2025, 6:30:00 PM', status: 'cancelled' }
      ]
    };
  },
  
  computed: {
    // 用户信息显示
    userInfo() {
      return {
        registerTimeDisplay: TimeUtils.formatTime(
          TimeUtils.parseTime(this.userData.registerTime), 
          'YYYY年MM月DD日 HH:mm'
        ),
        lastLoginDisplay: TimeUtils.formatForDisplay(this.userData.lastLoginTime),
        accountStatus: TimeUtils.isPastDate(this.userData.registerTime) ? '已激活' : '待激活'
      };
    },
    
    // 预约信息
    appointmentInfo() {
      const parsed = TimeUtils.parseTime(this.appointmentData.appointmentTime);
      const now = TimeUtils.parseTime(new Date());
      
      return {
        timeDisplay: TimeUtils.formatTime(parsed, 'YYYY年MM月DD日 HH:mm'),
        timeUntil: parsed ? TimeUtils.getRelativeTime(parsed) : '--',
        status: parsed && parsed.isAfter(now) ? '未到时间' : '已过期'
      };
    },
    
    // 报餐记录
    mealRecords() {
      return this.mealData.map(meal => ({
        ...meal,
        timeDisplay: TimeUtils.formatTime(
          TimeUtils.parseTime(meal.time), 
          'MM-DD HH:mm'
        ),
        statusClass: meal.status
      }));
    },
    
    // 批量测试统计
    successCount() {
      return this.batchTestResults.filter(r => r.isValid).length;
    },
    
    successRate() {
      if (this.batchTestResults.length === 0) return 0;
      return Math.round((this.successCount / this.batchTestResults.length) * 100);
    }
  },
  
  methods: {
    // 处理单个时间
    processTime() {
      try {
        const parsed = TimeUtils.parseTime(this.problematicTime);
        
        this.processedResult = {
          original: this.problematicTime,
          isValid: parsed && parsed.isValid(),
          formatted: TimeUtils.formatTime(parsed, 'YYYY-MM-DD HH:mm:ss'),
          relativeTime: parsed ? TimeUtils.getRelativeTime(parsed) : '--',
          isoString: parsed ? parsed.toISOString() : 'null'
        };
        
        // 显示控制台信息
        console.log('🔧 时间处理结果:', this.processedResult);
        
      } catch (error) {
        console.error('时间处理出错:', error);
        this.processedResult = {
          original: this.problematicTime,
          isValid: false,
          formatted: '处理失败',
          relativeTime: '--',
          isoString: 'null'
        };
      }
    },
    
    // 运行批量测试
    runBatchTest() {
      const testCases = [
        "9/13/2025, 5:39:15 PM",     // 主要问题格式
        "1/1/2026, 12:00:00 AM",     // 午夜时间
        "12/25/2025, 11:59:59 PM",   // 晚上时间
        "9/2/2025, 3:35:21 AM",      // 凌晨时间
        "9/13/2025",                 // 纯日期格式
        "2025-09-13T17:39:15.000Z",  // ISO 格式
        "2025-09-13 17:39:15",       // 标准格式
        "2/29/2024, 11:59:59 PM",    // 闰年
        "12/31/2025, 11:59:59 PM",   // 年末
        "9/13/2025 5:39:15 PM",      // 没有逗号
      ];
      
      this.batchTestResults = batchProcessTimes(testCases);
      
      // 显示控制台信息
      console.log('🧪 批量测试完成:', {
        total: this.batchTestResults.length,
        success: this.successCount,
        successRate: this.successRate + '%'
      });
    },
    
    // 快速演示
    quickDemo() {
      quickExample();
    }
  },
  
  mounted() {
    // 页面加载时运行快速演示
    this.quickDemo();
    console.log('📱 TimeUtils iOS兼容性演示页面已加载');
    console.log('💡 这个页面演示了如何使用增强版 TimeUtils 解决 iOS 日期兼容性问题');
  }
};
</script>

<style scoped>
.time-utils-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.demo-item {
  margin-bottom: 15px;
}

.demo-item label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}

.time-input {
  width: 250px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.btn {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.result-box {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border-left: 4px solid #007bff;
}

.result-box p {
  margin: 8px 0;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

.business-demo {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
}

.business-demo h4 {
  margin-top: 0;
  color: #333;
}

.user-info, .appointment-info {
  margin-left: 20px;
}

.meal-records {
  margin-left: 20px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.meal-type {
  font-weight: bold;
  width: 60px;
}

.meal-time {
  flex: 1;
  text-align: center;
}

.meal-status {
  width: 80px;
  text-align: right;
}

.meal-status.confirmed {
  color: #28a745;
}

.meal-status.pending {
  color: #ffc107;
}

.meal-status.cancelled {
  color: #dc3545;
}

.test-results {
  margin-top: 20px;
}

.test-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
}

.success-count {
  color: #28a745;
  font-weight: bold;
}

.total-count {
  color: #6c757d;
}

.success-rate {
  color: #007bff;
  font-weight: bold;
}

.test-details {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
}

.test-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.test-input {
  flex: 1;
  font-family: monospace;
  color: #666;
}

.test-output {
  flex: 1;
  text-align: right;
  font-family: monospace;
}

.test-output.success {
  color: #28a745;
}

.test-output.error {
  color: #dc3545;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}
</style>