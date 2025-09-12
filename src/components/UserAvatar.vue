<template>
  <view class="user-avatar" :class="sizeClass">
    <image
      :src="avatarUrl"
      :alt="userName"
      class="avatar-image"
      mode="aspectFill"
    />
  </view>
</template>

<script>
export default {
  name: '    UserAvatar,',
  props: {
    user: {
      type: Object,
      required: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    }
  },
  computed: {
    userName() {
      return this.user.nickName || this.user.username || '用户'
    },
    
    avatarUrl() {
      // 直接使用静态头像图片
      return '/static/person.png'
    },
    
    sizeClass() {
      return `avatar-${this.size}`
    }
  }
}
</script>

<style scoped>
.user-avatar {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 尺寸样式 */
.avatar-small {
  width: 64rpx;
  height: 64rpx;
}

.avatar-medium {
  width: 96rpx;
  height: 96rpx;
}

.avatar-large {
  width: 128rpx;
  height: 128rpx;
}

.avatar-xlarge {
  width: 200rpx;
  height: 200rpx;
}
</style>