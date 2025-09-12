# 生产环境API地址问题修复

## 🐛 问题描述

用户反馈：生产环境请求地址还是localhost，而不是配置的生产环境地址 `https://uauotggfeiao.sealosbja.site`。

## 🔍 问题分析

### 问题原因
在 `src/utils/api.js` 的 `getBaseUrl()` 函数中，使用了URL判断逻辑来区分开发环境和生产环境：

```javascript
// 问题代码
const currentUrl = window.location?.href || ''
const isLocalhost = currentUrl.includes('localhost') ||
                   currentUrl.includes('127.0.0.1') ||
                   currentUrl.includes('192.168.') ||
                   currentUrl.includes('10.0.') ||
                   currentUrl.includes('172.')

if (isLocalhost) {
  return API_CONFIG.DEV_BASE_URL  // 返回 localhost:3000
}
```

### 问题影响
- 即使构建了生产版本，如果通过localhost访问，仍然会使用开发环境的API地址
- 导致生产环境无法正确调用后端接口
- 用户体验受到影响

## 🔧 修复方案

### 修复前的问题代码
```javascript
function getBaseUrl() {
  // 方法3：通过URL判断（简单有效）
  const currentUrl = window.location?.href || ''
  const isLocalhost = currentUrl.includes('localhost') ||
                     currentUrl.includes('127.0.0.1') ||
                     currentUrl.includes('192.168.') ||
                     currentUrl.includes('10.0.') ||
                     currentUrl.includes('172.')

  // 优先使用方法3，如果本地开发则使用开发服务器
  if (isLocalhost) {
    console.log('当前为开发环境，使用本地开发服务器:', API_CONFIG.DEV_BASE_URL)
    return API_CONFIG.DEV_BASE_URL
  }

  // 默认使用生产环境
  console.log('当前为生产环境，使用生产服务器:', API_CONFIG.PROD_BASE_URL)
  return API_CONFIG.PROD_BASE_URL
}
```

### 修复后的正确代码
```javascript
function getBaseUrl() {
  // 方法1：通过环境变量判断（推荐）
  const isDev = process.env.NODE_ENV === 'development'

  // 方法2：通过 uni-app 的条件编译判断
  // #ifdef MP-WEIXIN || MP-ALIPAY
  //   return API_CONFIG.PROD_BASE_URL // 小程序使用生产环境
  // #endif

  // 方法3：通过构建模式判断
  if (isDev) {
    console.log('当前为开发环境，使用本地开发服务器:', API_CONFIG.DEV_BASE_URL)
    return API_CONFIG.DEV_BASE_URL
  }

  // 默认使用生产环境
  console.log('当前为生产环境，使用生产服务器:', API_CONFIG.PROD_BASE_URL)
  return API_CONFIG.PROD_BASE_URL
}
```

## 📋 修复内容

### 1. **移除URL判断逻辑**
- 删除了基于 `window.location.href` 的判断逻辑
- 删除了对 `localhost`、`127.0.0.1` 等本地地址的检测

### 2. **使用环境变量判断**
- 使用 `process.env.NODE_ENV === 'development'` 来判断环境
- 这是Vite构建工具的标准环境变量

### 3. **简化判断逻辑**
- 开发环境：`NODE_ENV === 'development'` → 使用 `localhost:3000`
- 生产环境：其他情况 → 使用 `https://uauotggfeiao.sealosbja.site`

## 🎯 环境判断逻辑

### 开发环境
```bash
# 开发模式启动
npm run dev:h5
# NODE_ENV = 'development'
# API地址 = 'http://localhost:3000'
```

### 生产环境
```bash
# 生产模式构建
npm run build:h5
# NODE_ENV = 'production'
# API地址 = 'https://uauotggfeiao.sealosbja.site'
```

## 🧪 测试验证

### 1. **开发环境测试**
```bash
# 启动开发服务器
npm run dev:h5

# 访问 http://localhost:3000
# 控制台应显示：当前为开发环境，使用本地开发服务器: http://localhost:3000
```

### 2. **生产环境测试**
```bash
# 构建生产版本
npm run build:h5

# 启动生产服务器
npx serve -s dist/build/h5 -l 3000

# 访问 http://localhost:3000 (注意：这里是生产版本，但通过localhost访问)
# 控制台应显示：当前为生产环境，使用生产服务器: https://uauotggfeiao.sealosbja.site
```

## 📊 修复效果对比

### 修复前
| 环境 | 访问地址 | API地址 | 状态 |
|------|----------|---------|------|
| 开发 | localhost:3000 | localhost:3000 | ✅ 正确 |
| 生产 | localhost:3000 | localhost:3000 | ❌ 错误 |
| 生产 | 生产域名 | 生产域名 | ✅ 正确 |

### 修复后
| 环境 | 访问地址 | API地址 | 状态 |
|------|----------|---------|------|
| 开发 | localhost:3000 | localhost:3000 | ✅ 正确 |
| 生产 | localhost:3000 | 生产域名 | ✅ 正确 |
| 生产 | 生产域名 | 生产域名 | ✅ 正确 |

## ⚠️ 注意事项

### 1. **环境变量**
- 确保 `NODE_ENV` 环境变量正确设置
- 开发模式：`NODE_ENV=development`
- 生产模式：`NODE_ENV=production`

### 2. **构建命令**
- 开发：`npm run dev:h5`
- 生产：`npm run build:h5`

### 3. **调试方法**
- 查看控制台日志确认当前使用的API地址
- 检查网络请求的实际目标地址

## 🎉 修复完成

### 修复状态
- ✅ 移除了错误的URL判断逻辑
- ✅ 使用正确的环境变量判断
- ✅ 简化了判断逻辑
- ✅ 确保生产环境使用正确的API地址

### 验证方法
1. 构建生产版本：`npm run build:h5`
2. 启动生产服务器：`npx serve -s dist/build/h5 -l 3000`
3. 访问页面并查看控制台日志
4. 确认API请求地址为 `https://uauotggfeiao.sealosbja.site`

现在生产环境将正确使用配置的生产API地址，不再出现请求localhost的问题！
