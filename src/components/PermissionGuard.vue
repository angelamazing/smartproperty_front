<template>
  <view v-if="hasPermission" class="permission-guard">
    <slot></slot>
  </view>
  <view v-else-if="showFallback" class="permission-fallback">
    <view class="fallback-content">
      <text class="fallback-icon">🔒</text>
      <text class="fallback-title">权限不足</text>
      <text class="fallback-message">{{ fallbackMessage }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PermissionGuard',
  props: {
    // 需要的角色列表
    roles: {
      type: Array,
      default: () => []
    },
    // 需要的权限等级（数字）
    minLevel: {
      type: Number,
      default: 0
    },
    // 是否显示无权限时的fallback内容
    showFallback: {
      type: Boolean,
      default: true
    },
    // 无权限时的提示信息
    fallbackMessage: {
      type: String,
      default: '您没有权限访问此功能'
    }
  },
  computed: {
    // 当前用户信息
    current用户() {
      return this.$store?.state?.user?.userInfo || uni.getStorageSync('userInfo') || {}
    },
    
    // 当前用户角色
    currentRole() {
      return this.current用户.role || 'user'
    },
    
    // 当前用户权限等级
    currentLevel() {
      const levelMap = {
        user: 1,
        verifier: 1,
        dept_admin: 2,
        admin: 3,
        sys_admin: 4
      }
      return levelMap[this.currentRole] || 0
    },
    
    // 是否有权限
    hasPermission() {
      // 检查角色权限
      if (this.roles.length > 0) {
        if (!this.roles.includes(this.currentRole)) {
          return false
        }
      }
      
      // 检查权限等级
      if (this.minLevel > 0) {
        if (this.currentLevel < this.minLevel) {
          return false
        }
      }
      
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-guard {
  width: 100%;
}

.permission-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx dashed #dee2e6;
}

.fallback-content {
  text-align: center;
  padding: 40rpx;
}

.fallback-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 20rpx;
}

.fallback-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6c757d;
  display: block;
  margin-bottom: 12rpx;
}

.fallback-message {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}
</style>
