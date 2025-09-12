# 用户列表API测试说明

## 概述

本文档说明如何使用 `test-user-list-api.js` 测试脚本来验证用户列表API的修复效果。

## 测试脚本功能

测试脚本 `test-user-list-api.js` 提供了以下测试功能：

### 1. 功能测试
- **基本查询测试**：验证无参数查询是否正常
- **分页查询测试**：验证分页功能是否正常
- **角色筛选测试**：验证按角色筛选是否正常
- **状态筛选测试**：验证按状态筛选是否正常
- **部门筛选测试**：验证按部门筛选是否正常
- **关键词搜索测试**：验证关键词搜索是否正常
- **组合筛选测试**：验证多条件组合筛选是否正常
- **数据字段验证**：验证返回数据字段是否完整

### 2. 权限验证测试
- **无Token访问测试**：验证未认证访问是否被正确拒绝
- **无效Token测试**：验证无效Token是否被正确拒绝

### 3. 错误处理测试
- **无效参数测试**：验证无效参数是否被正确处理
- **超出范围测试**：验证超出范围的页码是否被正确处理

### 4. 性能测试
- **查询性能测试**：测试查询大量数据的性能表现

## 使用方法

### 1. 安装依赖

确保已安装 `axios` 依赖：

```bash
npm install axios
```

### 2. 设置测试Token

在运行测试前，需要设置有效的管理员Token。有两种方式：

#### 方式1：直接修改脚本
在 `test-user-list-api.js` 文件中修改 `TEST_CONFIG.TEST_TOKEN` 的值：

```javascript
const TEST_CONFIG = {
  // ... 其他配置
  TEST_TOKEN: 'your_actual_admin_token_here'
};
```

#### 方式2：使用环境变量
设置环境变量 `TEST_ADMIN_TOKEN`：

```bash
# Windows PowerShell
$env:TEST_ADMIN_TOKEN="your_actual_admin_token_here"

# Windows CMD
set TEST_ADMIN_TOKEN=your_actual_admin_token_here

# Linux/Mac
export TEST_ADMIN_TOKEN="your_actual_admin_token_here"
```

### 3. 运行测试

#### 运行所有测试
```bash
node test-user-list-api.js
```

#### 在代码中使用
```javascript
const { runAllTests, testUserListAPI } = require('./test-user-list-api.js');

// 运行所有测试
runAllTests();

// 或者运行特定测试
testUserListAPI();
```

## 测试环境配置

测试脚本会自动根据环境变量选择测试环境：

- **开发环境**：`NODE_ENV=development` 时使用 `http://localhost:3000`
- **生产环境**：默认使用 `https://jcdtnpaompjy.sealosbja.site`

## 测试结果解读

### 成功标志
- ✅ 所有测试项显示绿色对勾
- 响应数据格式正确
- 分页信息完整
- 筛选功能正常

### 失败标志
- ❌ 测试项显示红色叉号
- 响应状态码异常
- 数据字段缺失
- 筛选功能异常

### 警告标志
- ⚠️ 测试项显示黄色警告
- 部分功能异常但不影响主要功能

## 常见问题解决

### 1. Token无效错误
**问题**：`401 Unauthorized` 错误
**解决**：检查Token是否有效，确保Token具有管理员权限

### 2. 网络连接错误
**问题**：`ECONNREFUSED` 或超时错误
**解决**：检查服务器是否正常运行，网络连接是否正常

### 3. 参数验证错误
**问题**：`400 Bad Request` 错误
**解决**：检查请求参数格式是否正确

### 4. 权限不足错误
**问题**：`403 Forbidden` 错误
**解决**：确保使用的Token具有足够的权限

## 测试报告示例

```
🧪 用户列表API全面测试开始

测试环境: https://jcdtnpaompjy.sealosbja.site
测试时间: 2023-11-15 18:30:45
==================================================

🚀 开始测试用户列表API...

📋 测试1：基本查询（无参数）
✅ 基本查询成功
响应数据: {
  "success": true,
  "message": "获取用户列表成功",
  "code": 200,
  "data": {
    "records": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}

📋 测试2：分页查询
✅ 分页查询成功
分页信息: { total: 100, page: 1, pageSize: 5, hasMore: true }

...

🎯 测试总结
✅ 功能测试完成
✅ 权限验证测试完成
✅ 错误处理测试完成
✅ 性能测试完成

🎉 所有测试通过！用户列表API工作正常。
```

## 注意事项

1. **Token安全**：不要在代码中硬编码Token，建议使用环境变量
2. **测试频率**：避免频繁运行测试，以免对生产环境造成压力
3. **数据验证**：测试时注意验证返回数据的完整性和准确性
4. **错误处理**：关注测试过程中的错误信息，及时排查问题

## 联系支持

如果在测试过程中遇到问题，请：

1. 检查测试日志中的错误信息
2. 确认Token和权限设置是否正确
3. 验证网络连接和服务器状态
4. 查看后端日志获取更多错误信息
