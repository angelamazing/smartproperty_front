# 智慧物业管理系统

## 项目简介
这是一个基于 Vue 3 + Uni-app 的智慧物业管理系统，为湖北省地质局第三地质大队提供一站式服务体验。系统支持多端运行（H5、小程序、App），集成了报餐管理、场地预约、用户管理、系统管理等核心功能。

## 核心功能模块

### 🍽️ 报餐管理
- **日常报餐**：部门批量报餐、菜单查看、报餐记录查询
- **特殊预约报餐**：商务接待预约、特殊用餐需求管理
- **用餐验证**：多种验证方式（二维码、刷卡、直接确认）
- **报餐统计**：部门报餐数据统计和分析

### 🏟️ 场地预约
- **球馆预约**：场地时间预约、预约记录管理
- **预约审核**：管理员审核预约申请
- **场地管理**：场地信息管理和时间安排

### 👥 用户管理
- **用户信息管理**：用户增删改查、权限控制
- **角色权限管理**：多角色权限分配
- **部门管理**：部门信息管理和用户归属

### 🏢 系统管理
- **公告管理**：系统公告发布和管理
- **菜单管理**：菜品管理和菜单发布
- **数据统计**：系统使用统计和报表分析
- **系统设置**：系统参数配置和权限控制

### 👤 个人中心
- **个人信息管理**：个人资料编辑和头像管理
- **密码管理**：密码修改和重置
- **通知设置**：消息通知偏好设置

## 头像功能统一说明

### 头像获取标准
根据后端API文档，系统统一使用 `avatarUrl` 字段作为用户头像的唯一标识：

```javascript
// 获取用户信息
const response = await api.user.getInfo()
const avatarUrl = response.data.avatarUrl

// 显示头像
<UserAvatar :user="userInfo" />
```

### 头像上传标准
- **管理员上传**：使用 `FormData` 格式，字段名为 `avatar`
- **普通用户更新**：使用 `PUT /api/user/avatar` 接口，传递 `avatarUrl` 字符串

### 头像组件特性
- 自动处理加载状态
- 超时处理（10秒）
- 错误回退到占位符
- 响应式更新
- 支持多种尺寸

### 已修复的页面
1. **UserAvatar.vue** - 统一头像显示组件
2. **personal-info.vue** - 个人信息页面
3. **index.vue** - 首页
4. **profile.vue** - 个人资料页面

### 头像更新流程
1. 用户选择头像文件
2. 上传到后端获取 `avatarUrl`
3. 调用 `PUT /api/user/avatar` 更新用户头像
4. 立即更新本地 `userInfo.avatarUrl`
5. 强制组件重新渲染
6. 延迟1秒后重新获取用户信息

## 技术栈

### 前端技术
- **框架**：Vue 3 (Composition API)
- **跨平台**：Uni-app
- **构建工具**：Vite
- **UI组件**：自定义组件库
- **状态管理**：Vue 3 响应式系统
- **HTTP客户端**：uni.request

### 后端技术
- **运行环境**：Node.js >= 16.0.0
- **Web框架**：Express.js 4.x
- **数据库**：MySQL 8.0
- **认证方式**：JWT Token + 微信授权
- **安全防护**：Helmet + CORS + Rate Limiting

### 部署支持
- **H5**：浏览器访问
- **小程序**：微信小程序
- **APP**：移动应用

## 开发环境

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev:h5
```

### 构建生产版本
```bash
npm run build:h5
```

## 项目结构
```
my-vue3-project/
├── src/                    # 源代码
│   ├── components/         # 公共组件
│   │   ├── UserAvatar.vue  # 用户头像组件
│   │   ├── UserEditModal.vue # 用户编辑弹窗
│   │   ├── DishSelector.vue # 菜品选择器
│   │   ├── SystemNotice.vue # 系统公告组件
│   │   └── form/           # 表单组件集合
│   ├── pages/              # 页面文件
│   │   ├── index/          # 首页模块
│   │   ├── dining/         # 报餐模块
│   │   ├── reservation/    # 预约模块
│   │   ├── admin/          # 管理后台
│   │   ├── profile/        # 个人中心
│   │   └── login/          # 登录模块
│   ├── utils/              # 工具函数
│   │   ├── api.js          # API接口封装
│   │   ├── auth.js         # 认证工具
│   │   ├── apiCache.js     # 接口缓存
│   │   └── imageUtils.js   # 图片处理工具
│   └── static/             # 静态资源
├── docs/                   # 文档目录
├── tests/                  # 测试文件
├── examples/               # 示例代码
├── cloudfunctions/         # 云函数
└── node_modules/           # 依赖包
```

## API 接口

### 用户相关
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/avatar` - 更新用户头像
- `POST /api/admin/upload/avatar` - 管理员上传头像

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

## 注意事项

### 头像处理
1. 所有头像相关操作都使用 `avatarUrl` 字段
2. 头像上传支持 H5 和 App-Plus 环境
3. 头像加载有10秒超时保护
4. 加载失败时自动显示占位符

### 环境兼容性
- H5环境：使用 `uni.uploadFile`
- App-Plus环境：优先使用 `uni.getFileSystemManager().readFile` + `FormData`

### 错误处理
- 所有API调用都有完整的错误处理
- 用户友好的错误提示
- 详细的调试日志

## 更新日志

### 最新更新
- 统一头像获取和显示逻辑
- 优化头像加载性能
- 修复头像上传兼容性问题
- 完善错误处理机制
- **修复API方法缺失问题**
  - 添加 `api.admin.getMenuByDate()` 方法
  - 添加 `api.admin.getMenuDetail()` 方法
  - 添加 `api.admin.getSystemStats()` 方法
  - 添加 `api.admin.getUserDetail()` 方法
  - 添加 `api.admin.getUsersList()` 方法
  - 添加 `api.admin.batchDeleteUsers()` 方法
  - 修复API调用参数格式问题
- **修复页面缺失问题**
  - 创建 `pages/admin/menu-history.vue` 菜单历史页面
  - 添加完整的菜单历史管理功能
  - 支持筛选、分页、查看、编辑、复制、删除操作

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
MIT License
