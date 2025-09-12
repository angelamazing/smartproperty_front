# 智慧物业管理系统 API 接口文档

## 📋 文档概览

本文档是智慧物业管理系统所有API接口的统一文档，包含认证、用户管理、报餐管理、预约管理等核心功能的接口说明。

**服务地址**：
- 生产环境：`https://jcdtnpaompjy.sealosbja.site`
- 开发环境：`http://localhost:3000`

**文档版本**：v2.0.0  
**最后更新**：2025年9月7日

## 🔧 通用说明

### 请求格式
所有接口均使用 HTTP REST API，支持 JSON 格式的请求和响应。

**完整接口地址格式**：`{BASE_URL}` + `接口路径`

### 认证方式
大部分接口需要在请求头中携带Token：
```http
Authorization: Bearer <your-token>
```

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {} // 可选，响应数据
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述" // 可选
}
```

### HTTP状态码
- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 未授权/Token过期
- `403` - 权限不足
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器内部错误

---

## 🔐 认证接口

### 微信登录
```http
POST /api/auth/wechat-login
```

**请求参数**：
```json
{
  "code": "微信授权码",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```

**响应示例**：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "用户ID",
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "role": "用户角色"
    }
  }
}
```

### 测试登录
```http
POST /api/auth/test-login
```

**请求参数**：
```json
{
  "role": "user|admin|sys_admin"
}
```

### 登出
```http
POST /api/auth/logout
```

### 刷新Token
```http
POST /api/auth/refresh-token
```

---

## 👥 用户接口

### 获取用户信息
```http
GET /api/user/info
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "用户ID",
    "realName": "真实姓名",
    "nickName": "昵称",
    "phoneNumber": "手机号",
    "email": "邮箱",
    "avatarUrl": "头像URL",
    "role": "用户角色",
    "department": "部门名称",
    "permissions": ["权限列表"]
  }
}
```

### 更新用户信息
```http
PUT /api/user/info
```

### 更新用户头像
```http
PUT /api/user/avatar
```

**请求参数**：
```json
{
  "avatarUrl": "新的头像URL"
}
```

### 修改密码
```http
PUT /api/user/password
```

**请求参数**：
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

---

## 🍽️ 报餐接口

### 获取今日菜单
```http
GET /api/dining/menu/today
```

**查询参数**：
- `mealType` - 用餐类型（breakfast/lunch/dinner）

**响应示例**：
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "mealType": "lunch",
    "dishes": [
      {
        "id": "菜品ID",
        "name": "菜品名称",
        "description": "菜品描述",
        "image": "菜品图片",
        "category": "菜品分类",
        "nutrition": "营养信息"
      }
    ]
  }
}
```

### 提交部门报餐
```http
POST /api/dining/order/dept
```

**请求参数**：
```json
{
  "date": "2024-01-15",
  "mealType": "lunch",
  "members": [
    {
      "userId": "用户ID",
      "userName": "用户姓名"
    }
  ],
  "remark": "备注信息"
}
```

### 获取报餐记录
```http
GET /api/dining/records
```

**查询参数**：
- `page` - 页码（默认1）
- `pageSize` - 每页数量（默认10）
- `startDate` - 开始日期
- `endDate` - 结束日期
- `status` - 状态筛选

### 特殊预约报餐
```http
POST /api/dining/special-reservation
```

**请求参数**：
```json
{
  "reservationTime": "2024-01-15 12:00:00",
  "diningCount": 5,
  "specialRequirements": "特殊要求",
  "contactPerson": "联系人",
  "contactPhone": "联系电话"
}
```

### 用餐验证
```http
POST /api/dining/verify
```

**请求参数**：
```json
{
  "verificationMethod": "qr_code|card_swipe|direct_confirm",
  "verificationCode": "验证码（可选）",
  "cardInfo": "卡片信息（可选）"
}
```

---

## 🏟️ 预约接口

### 获取场地列表
```http
GET /api/reservation/venues
```

### 获取可用时间段
```http
GET /api/reservation/time-slots
```

**查询参数**：
- `venueId` - 场地ID
- `date` - 预约日期

### 提交预约
```http
POST /api/reservation/book
```

**请求参数**：
```json
{
  "venueId": "场地ID",
  "date": "2024-01-15",
  "timeSlots": ["09:00-10:00", "10:00-11:00"],
  "purpose": "预约用途",
  "remark": "备注"
}
```

### 获取预约记录
```http
GET /api/reservation/records
```

### 取消预约
```http
PUT /api/reservation/cancel/{reservationId}
```

---

## 👨‍💼 管理员接口

### 用户管理

#### 获取用户列表
```http
GET /api/admin/users
```

**查询参数**：
- `page` - 页码
- `pageSize` - 每页数量
- `search` - 搜索关键词
- `role` - 角色筛选
- `department` - 部门筛选

#### 创建用户
```http
POST /api/admin/users
```

#### 更新用户
```http
PUT /api/admin/users/{userId}
```

#### 删除用户
```http
DELETE /api/admin/users/{userId}
```

#### 批量删除用户
```http
DELETE /api/admin/users/batch
```

**请求参数**：
```json
{
  "userIds": ["用户ID1", "用户ID2"]
}
```

### 菜品管理

#### 获取菜品列表
```http
GET /api/admin/dishes
```

#### 创建菜品
```http
POST /api/admin/dishes
```

**请求参数**：
```json
{
  "name": "菜品名称",
  "description": "菜品描述",
  "category": "菜品分类",
  "image": "菜品图片",
  "nutrition": "营养信息",
  "price": 15.00
}
```

#### 更新菜品
```http
PUT /api/admin/dishes/{dishId}
```

#### 删除菜品
```http
DELETE /api/admin/dishes/{dishId}
```

### 菜单管理

#### 获取菜单列表
```http
GET /api/admin/menus
```

#### 创建菜单
```http
POST /api/admin/menus
```

**请求参数**：
```json
{
  "date": "2024-01-15",
  "mealType": "lunch",
  "dishes": ["菜品ID1", "菜品ID2"],
  "publishStatus": "published"
}
```

#### 发布菜单
```http
PUT /api/admin/menus/{menuId}/publish
```

### 公告管理

#### 获取公告列表
```http
GET /api/admin/notices
```

#### 创建公告
```http
POST /api/admin/notices
```

**请求参数**：
```json
{
  "title": "公告标题",
  "content": "公告内容",
  "type": "system|maintenance|update",
  "priority": "high|medium|low",
  "isPinned": true
}
```

#### 更新公告
```http
PUT /api/admin/notices/{noticeId}
```

#### 删除公告
```http
DELETE /api/admin/notices/{noticeId}
```

### 数据统计

#### 获取系统统计
```http
GET /api/admin/statistics
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "userCount": 150,
    "todayOrders": 45,
    "todayReservations": 12,
    "activeUsers": 89,
    "systemStatus": "normal"
  }
}
```

#### 获取报餐统计
```http
GET /api/admin/statistics/dining
```

#### 获取预约统计
```http
GET /api/admin/statistics/reservation
```

---

## 📊 系统接口

### 健康检查
```http
GET /health
```

### 获取系统信息
```http
GET /api/system/info
```

### 获取系统公告
```http
GET /api/system/notices
```

**查询参数**：
- `type` - 公告类型
- `limit` - 限制数量

---

## 🔧 文件上传

### 上传头像
```http
POST /api/upload/avatar
```

**请求格式**：`multipart/form-data`

**请求参数**：
- `avatar` - 头像文件

**响应示例**：
```json
{
  "success": true,
  "data": {
    "avatarUrl": "上传后的头像URL"
  }
}
```

### 上传菜品图片
```http
POST /api/upload/dish-image
```

---

## 📝 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 10001 | 参数错误 | 检查请求参数格式 |
| 10002 | 认证失败 | 检查Token是否有效 |
| 10003 | 权限不足 | 联系管理员分配权限 |
| 10004 | 资源不存在 | 检查请求的资源ID |
| 10005 | 操作失败 | 查看详细错误信息 |
| 10006 | 数据重复 | 检查数据是否已存在 |
| 10007 | 业务规则错误 | 检查业务逻辑限制 |

---

## 🚀 快速开始

### 1. 获取Token
```javascript
// 微信登录
const response = await fetch('/api/auth/wechat-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'wx_code',
    userInfo: {
      nickName: '用户昵称',
      avatarUrl: '头像URL'
    }
  })
})

const data = await response.json()
const token = data.data.token
```

### 2. 使用Token请求数据
```javascript
// 获取用户信息
const response = await fetch('/api/user/info', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const userInfo = await response.json()
```

### 3. 错误处理
```javascript
try {
  const response = await fetch('/api/user/info', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message)
  }
  
  console.log('用户信息:', data.data)
} catch (error) {
  console.error('请求失败:', error.message)
}
```

---

## 📞 技术支持

如有接口相关问题，请联系开发团队：
- 邮箱：dev@example.com
- 文档更新：请查看Git提交记录
- 问题反馈：请使用项目Issue系统

---

*最后更新：2025年9月7日*  
*维护者：开发团队*
