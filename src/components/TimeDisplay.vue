<template>
  <text class="time-display" :class="timeClass">
    {{ displayTime }}
  </text>
</template>

<script>
import TimeUtils from '@/utils/timeUtils.js'

export default {
  name: 'TimeDisplay',
  props: {
    // UTC时间字符串
    utcTime: {
      type: String,
      default: ''
    },
    // 显示类型: simple(智能), relative(相对), full(完整), date(日期), time(时间)
    type: {
      type: String,
      default: 'simple',
      validator: value => ['simple', 'relative', 'full', 'date', 'time', 'dining', 'register', 'scan', 'confirm', 'create', 'update'].includes(value)
    },
    // 自定义格式 (当type为full时使用)
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    // 是否显示相对时间
    showRelative: {
      type: Boolean,
      default: false
    },
    // 自定义样式类
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayTime() {
      if (!this.utcTime) return '--'
      
      switch (this.type) {
        case 'simple':
          return TimeUtils.formatToBeijingSimple(this.utcTime)
        case 'relative':
          return TimeUtils.formatRelativeTime(this.utcTime)
        case 'full':
          return TimeUtils.formatToBeijing(this.utcTime, this.format)
        case 'date':
          return TimeUtils.formatDate开启ly(this.utcTime)
        case 'time':
          return TimeUtils.formatTime开启ly(this.utcTime)
        case 'dining':
          return TimeUtils.formatDiningTime(this.utcTime)
        case 'register':
          return TimeUtils.formatRegisterTime(this.utcTime)
        case 'scan':
          return TimeUtils.formatScanTime(this.utcTime)
        case 'confirm':
          return TimeUtils.format确认Time(this.utcTime)
        case 'create':
          return TimeUtils.formatCreateTime(this.utcTime)
        case 'update':
          return TimeUtils.formatUpdateTime(this.utcTime)
        default:
          return TimeUtils.formatToBeijingSimple(this.utcTime)
      }
    },
    timeClass() {
      const classes = ['time-display']
      
      if (this.customClass) {
        classes.push(this.customClass)
      }
      
      if (this.type) {
        classes.push(`time-${this.type}`)
      }
      
      return classes.join(' ')
    }
  }
}
</script>

<style scoped>
.time-display {
  font-size: 28rpx;
  color: #666;
  display: inline-block;
}

.time-simple {
  font-size: 26rpx;
  color: #333;
}

.time-relative {
  font-size: 24rpx;
  color: #999;
}

.time-full {
  font-size: 28rpx;
  color: #333;
}

.time-date {
  font-size: 26rpx;
  color: #666;
}

.time-time {
  font-size: 26rpx;
  color: #666;
}

.time-dining {
  font-size: 28rpx;
  color: #07c160;
  font-weight: bold;
}

.time-register {
  font-size: 28rpx;
  color: #007bff;
}

.time-scan {
  font-size: 28rpx;
  color: #ff9800;
}

.time-confirm {
  font-size: 28rpx;
  color: #4caf50;
}

.time-create {
  font-size: 24rpx;
  color: #999;
}

.time-update {
  font-size: 24rpx;
  color: #999;
}
</style>
