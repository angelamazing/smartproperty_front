# 图标系统说明文档

## 概述

本项目的图标系统采用SVG格式，提供高质量、可缩放的矢量图标。所有图标都经过精心设计，确保在不同尺寸下都能保持清晰。

## 图标类型

### 1. TabBar 图标
用于底部导航栏的图标，包含正常状态和激活状态。

#### 首页图标 (home.svg / home-active.svg)
- **设计理念**: 简洁的房屋轮廓，代表家的概念
- **使用场景**: 底部导航栏首页标签
- **颜色**: 正常状态为描边，激活状态为填充

#### 报餐图标 (dining.svg / dining-active.svg)
- **设计理念**: 餐盘和餐具的组合，代表用餐
- **使用场景**: 底部导航栏报餐标签
- **颜色**: 正常状态为描边，激活状态为填充

#### 预约图标 (reservation.svg / reservation-active.svg)
- **设计理念**: 日历设计，代表时间安排
- **使用场景**: 底部导航栏预约标签
- **颜色**: 正常状态为描边，激活状态为填充

#### 个人中心图标 (profile.svg / profile-active.svg)
- **设计理念**: 人形轮廓，代表用户个人
- **使用场景**: 底部导航栏个人中心标签
- **颜色**: 正常状态为描边，激活状态为填充

### 2. 功能模块图标
用于首页功能模块的图标，采用emoji风格。

- **🍽️ 日常报餐**: 餐具图标，代表日常用餐
- **📅 特殊预约**: 日历图标，代表预约功能
- **🏸 球馆预约**: 羽毛球图标，代表运动场地
- **✅ 用餐验证**: 对勾图标，代表验证功能

### 3. 统计图标
用于数据统计展示的图标。

- **🍽️ 今日报餐**: 餐具图标
- **🏸 今日预约**: 羽毛球图标
- **✅ 用餐验证**: 对勾图标
- **📋 今日菜单**: 菜单图标

### 4. 活动图标
用于活动列表的图标。

- **🍽️ 报餐活动**: 餐具图标
- **🏸 预约活动**: 羽毛球图标
- **✅ 验证活动**: 对勾图标
- **⚙️ 系统活动**: 齿轮图标

## 使用方法

### 1. 在pages.json中使用TabBar图标

```json
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/icons/home.svg",
        "selectedIconPath": "static/icons/home-active.svg"
      }
    ]
  }
}
```

### 2. 在Vue组件中使用图标

```vue
<template>
  <!-- 使用SVG图标 -->
  <image class="tab-bar-icon" :src="iconPath" mode="aspectFit" />
  
  <!-- 使用emoji图标 -->
  <view class="function-icon dining">🍽️</view>
</template>

<script>
import { getTabBarIcon, getFunctionIcon } from '@/static/icons/index.js'

export default {
  computed: {
    iconPath() {
      return getTabBarIcon('home', this.isActive)
    }
  }
}
</script>
```

### 3. 引入图标样式

```vue
<style lang="scss" scoped>
@import '@/static/icons/icons.scss';

.custom-icon {
  @extend .function-icon;
  @extend .dining;
}
</style>
```

## 图标规范

### 1. 尺寸规范
- **TabBar图标**: 24x24px
- **功能图标**: 48x48px
- **统计图标**: 40x40px
- **活动图标**: 32x32px

### 2. 颜色规范
- **正常状态**: 描边样式，使用currentColor
- **激活状态**: 填充样式，使用currentColor
- **功能图标**: 渐变背景，白色图标

### 3. 设计原则
- **简洁性**: 图标设计简洁明了，易于识别
- **一致性**: 所有图标保持统一的设计风格
- **可扩展性**: SVG格式支持任意缩放
- **可访问性**: 图标含义清晰，支持语义化

## 自定义图标

### 1. 添加新图标
1. 在 `src/static/icons/` 目录下创建SVG文件
2. 在 `src/static/icons/index.js` 中添加图标配置
3. 在 `src/static/icons/icons.scss` 中添加样式

### 2. 图标命名规范
- 文件名使用小写字母和连字符
- 功能图标使用描述性名称
- 状态图标使用 `-active` 后缀

### 3. SVG代码规范
- 使用标准的SVG标签
- 设置合适的viewBox
- 使用currentColor作为颜色值
- 保持代码简洁

## 性能优化

### 1. SVG优化
- 移除不必要的属性
- 优化路径数据
- 压缩SVG文件大小

### 2. 缓存策略
- 图标文件使用长期缓存
- 考虑使用图标字体
- 支持懒加载

### 3. 兼容性
- 支持现代浏览器
- 提供PNG备选方案
- 测试不同设备显示效果

## 更新日志

### v1.0.0 (当前版本)
- ✅ 创建基础TabBar图标
- ✅ 设计功能模块图标
- ✅ 建立图标管理系统
- ✅ 提供完整的样式支持
- ✅ 支持响应式设计

## 注意事项

1. **图标一致性**: 确保所有图标保持统一的设计风格
2. **颜色适配**: 图标颜色要与整体设计风格协调
3. **尺寸适配**: 在不同设备上测试图标显示效果
4. **性能考虑**: 避免图标文件过大影响加载速度
5. **维护更新**: 定期检查和更新图标系统

---

*最后更新时间: 2025年9月7日*
*图标设计: 智慧物业管理系统设计团队*
