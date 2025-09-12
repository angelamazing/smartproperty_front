<template>
  <view class="test-container">
    <view class="header">
      <text class="title">时间处理优化测试</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">基础时间功能测试</text>
      
      <view class="test-item">
        <text class="test-label">当前日期:</text>
        <text class="test-value">{{ currentDate }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">当前时间:</text>
        <text class="test-value">{{ currentTime }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">UTC时间戳:</text>
        <text class="test-value">{{ utcTimestamp }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">时间格式化测试</text>
      
      <view class="test-item">
        <text class="test-label">完整格式:</text>
        <text class="test-value">{{ fullTimeFormat }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">日期格式:</text>
        <text class="test-value">{{ dateFormat }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">时间格式:</text>
        <text class="test-value">{{ timeFormat }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">相对时间:</text>
        <text class="test-value">{{ relativeTime }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">业务功能测试</text>
      
      <view class="test-item">
        <text class="test-label">当前餐次:</text>
        <text class="test-value">{{ currentMealType }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">下一个餐次:</text>
        <text class="test-value">{{ nextMealInfo }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">早餐时间范围:</text>
        <text class="test-value">{{ breakfastTimeRange }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">时间转换测试</text>
      
      <view class="test-item">
        <text class="test-label">北京时间转UTC:</text>
        <text class="test-value">{{ beijingToUTC }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">UTC转北京时间:</text>
        <text class="test-value">{{ utcToBeijing }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">日期计算测试</text>
      
      <view class="test-item">
        <text class="test-label">昨天:</text>
        <text class="test-value">{{ yesterday }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">明天:</text>
        <text class="test-value">{{ tomorrow }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">日期范围:</text>
        <text class="test-value">{{ dateRange }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">缓存性能测试</text>
      
      <view class="test-item">
        <text class="test-label">缓存大小:</text>
        <text class="test-value">{{ cacheSize }}</text>
      </view>
      
      <button class="test-btn" @click="performanceTest">性能测试</button>
      <text class="test-result">{{ performanceResult }}</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">错误处理测试</text>
      
      <view class="test-item">
        <text class="test-label">无效时间:</text>
        <text class="test-value">{{ invalidTime }}</text>
      </view>
      
      <view class="test-item">
        <text class="test-label">空值处理:</text>
        <text class="test-value">{{ nullTime }}</text>
      </view>
    </view>
    
    <button class="refresh-btn" @click="refreshTests">刷新测试</button>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'TimeOptimizationTest',
  mixins: [timeMixin],
  
  data() {
    return {
      testTime: '2024-01-15T10:30:00.000Z',
      performanceResult: '',
      cacheSize: 0
    }
  },
  
  computed: {
    currentDate() {
      return this.$getCurrentDate()
    },
    
    currentTime() {
      return this.$getCurrentTime()
    },
    
    utcTimestamp() {
      return this.$getCurrentTimestamp()
    },
    
    fullTimeFormat() {
      return this.$formatTime(this.testTime, 'YYYY-MM-DD HH:mm:ss')
    },
    
    dateFormat() {
      return this.$formatDate(this.testTime)
    },
    
    timeFormat() {
      return this.$formatTimeOnly(this.testTime)
    },
    
    relativeTime() {
      return this.$formatRelativeTime(this.testTime)
    },
    
    currentMealType() {
      const mealType = this.$getCurrentMealType()
      return mealType ? this.$getMealInfo(mealType).name : '非就餐时间'
    },
    
    nextMealInfo() {
      const nextMeal = this.$getNextMeal()
      return `${nextMeal.name} (${nextMeal.time}, ${nextMeal.hoursLeft}小时后)`
    },
    
    breakfastTimeRange() {
      return this.$formatMealTime('breakfast')
    },
    
    beijingToUTC() {
      const beijingTime = '2024-01-15 18:30:00'
      return this.$toUTCForSubmit(beijingTime)
    },
    
    utcToBeijing() {
      return this.$formatTime(this.testTime, 'YYYY-MM-DD HH:mm:ss')
    },
    
    yesterday() {
      return this.$getYesterday()
    },
    
    tomorrow() {
      return this.$getTomorrow()
    },
    
    dateRange() {
      const start = this.$getPreviousDay(this.currentDate)
      const end = this.$getNextDay(this.currentDate)
      return `${start} 至 ${end}`
    },
    
    invalidTime() {
      return this.$safeFormatTime('invalid-time-string')
    },
    
    nullTime() {
      return this.$safeFormatTime(null)
    }
  },
  
  mounted() {
    this.updateCacheSize()
  },
  
  methods: {
    refreshTests() {
      this.updateCacheSize()
      uni.showToast({
        title: '测试数据已刷新',
        icon: 'success'
      })
    },
    
    updateCacheSize() {
      this.cacheSize = this.$getTimeCacheSize()
    },
    
    performanceTest() {
      const startTime = Date.now()
      const testCount = 1000
      
      // 测试大量时间格式化
      for (let i = 0; i < testCount; i++) {
        this.$formatTimeWithCache(this.testTime, 'YYYY-MM-DD HH:mm:ss')
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      this.performanceResult = `格式化${testCount}次时间，耗时${duration}ms`
      this.updateCacheSize()
      
      uni.showToast({
        title: '性能测试完成',
        icon: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-container {
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.test-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .test-label {
    font-size: 26rpx;
    color: #666;
    flex: 1;
  }
  
  .test-value {
    font-size: 24rpx;
    color: #333;
    flex: 2;
    text-align: right;
    word-break: break-all;
  }
}

.test-btn {
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 30rpx;
  font-size: 26rpx;
  margin: 20rpx 0;
  
  &:active {
    background: #0056b3;
  }
}

.test-result {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.refresh-btn {
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 25rpx 50rpx;
  font-size: 28rpx;
  margin: 40rpx auto;
  display: block;
  
  &:active {
    background: #1e7e34;
  }
}
</style>
