# 测试文件组织

## 📁 目录结构

```
tests/
├── unit/                   # 单元测试
├── integration/            # 集成测试
├── e2e/                    # 端到端测试
├── test-api-methods.js     # API方法测试
├── test-module-loading.js  # 模块加载测试
├── test-optimized-layout.html  # 布局优化测试
├── test-password-dish-style.html  # 密码样式测试
├── test-password-input.html  # 密码输入测试
├── test-redesigned-inputs.html  # 输入框重设计测试
├── test-reset-password-modal.html  # 重置密码模态框测试
├── test-static-files.js    # 静态文件测试
├── test-user-list-api.js   # 用户列表API测试
├── 公告管理测试说明.md     # 公告管理测试文档
├── 用户列表API测试说明.md  # 用户列表API测试文档
└── README.md              # 本文档
```

## 🧪 测试分类

### 单元测试 (unit/)
- 组件级别的测试
- 工具函数测试
- 业务逻辑测试

### 集成测试 (integration/)
- 组件间交互测试
- API集成测试
- 数据流测试

### 端到端测试 (e2e/)
- 完整用户流程测试
- 跨页面功能测试
- 真实环境测试

### 专项测试文件
- **API测试**：`test-*-api.js` - 测试API接口功能
- **模块测试**：`test-module-*.js` - 测试模块加载和依赖
- **静态文件测试**：`test-static-*.js` - 测试静态资源加载
- **HTML测试页面**：`test-*-.html` - 用于浏览器中直接测试的页面

## 📋 测试说明文档

### 公告管理测试说明.md
- 公告管理功能的测试用例
- 测试步骤和预期结果
- 测试数据和环境要求

### 用户列表API测试说明.md
- 用户列表API的测试方法
- 测试参数和返回值验证
- 错误处理测试

## 🚀 运行测试

### 单元测试
```bash
# 运行单元测试
npm run test:unit
```

### 集成测试
```bash
# 运行集成测试
npm run test:integration
```

### 端到端测试
```bash
# 运行端到端测试
npm run test:e2e
```

### 手动测试
```bash
# 在浏览器中打开HTML测试页面
# 例如：http://localhost:3000/tests/test-optimized-layout.html
```

## 📝 测试编写规范

1. **测试文件命名**：使用 `test-` 前缀，描述性名称
2. **测试用例**：每个测试用例应该独立且可重复
3. **测试数据**：使用固定的测试数据，避免随机性
4. **断言**：使用清晰的断言，包含错误信息
5. **文档**：为复杂测试添加说明文档

## 🔧 测试环境配置

- **Node.js**：v16+
- **测试框架**：Jest / Mocha
- **浏览器**：Chrome, Firefox, Safari
- **移动端**：iOS Safari, Android Chrome

## 📊 测试覆盖率

- 目标代码覆盖率：> 80%
- 关键功能覆盖率：100%
- API接口覆盖率：> 90%
