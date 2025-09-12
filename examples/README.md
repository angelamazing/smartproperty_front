# 示例文件组织

## 📁 目录结构

```
examples/
├── forms/                  # 表单示例
│   ├── court-reservation.html  # 球馆预约表单
│   ├── daily-dining.html       # 日常用餐表单
│   ├── dining-verification.html # 用餐验证表单
│   ├── index.html              # 表单索引页面
│   └── special-reservation.html # 特殊预约表单
├── static/                 # 静态文件示例
├── layout-test.html        # 布局测试页面
├── index.html              # 主页面示例
└── README.md              # 本文档
```

## 📋 示例分类

### 表单示例 (forms/)
包含各种业务表单的HTML示例，用于：
- 表单设计和布局参考
- 表单验证逻辑示例
- 用户交互流程展示
- 样式和组件参考

#### 表单列表
- **court-reservation.html** - 球馆预约表单
  - 预约时间选择
  - 场地类型选择
  - 用户信息填写
  
- **daily-dining.html** - 日常用餐表单
  - 用餐类型选择
  - 菜品选择
  - 用餐时间设置
  
- **dining-verification.html** - 用餐验证表单
  - 二维码扫描
  - 验证码输入
  - 验证结果展示
  
- **special-reservation.html** - 特殊预约表单
  - 特殊需求填写
  - 审批流程
  - 状态跟踪

### 静态文件示例 (static/)
- 图片资源示例
- 图标使用示例
- 样式文件示例
- 配置文件示例

### 测试页面
- **layout-test.html** - 布局测试页面
  - 响应式布局测试
  - 组件排列测试
  - 样式兼容性测试

- **index.html** - 主页面示例
  - 完整页面结构
  - 导航和路由示例
  - 组件集成示例

## 🚀 使用方式

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 访问示例页面
# http://localhost:3000/examples/forms/index.html
# http://localhost:3000/examples/layout-test.html
```

### 静态预览
```bash
# 直接在浏览器中打开HTML文件
open examples/forms/index.html
```

## 📝 示例编写规范

1. **HTML结构**：使用语义化标签，保持结构清晰
2. **CSS样式**：内联样式或外部样式表，保持一致性
3. **JavaScript**：使用现代ES6+语法，添加注释
4. **响应式**：确保在不同设备上正常显示
5. **可访问性**：添加适当的ARIA标签和alt属性

## 🔧 示例维护

- **定期更新**：保持示例与最新代码同步
- **版本控制**：记录示例的版本和更新历史
- **文档说明**：为每个示例添加使用说明
- **测试验证**：确保示例在主流浏览器中正常工作

## 📊 示例统计

- 表单示例：5个
- 测试页面：2个
- 静态文件：待整理
- 总文件数：7个

## 🎯 示例目标

1. **开发参考**：为开发者提供代码参考
2. **设计展示**：展示UI/UX设计效果
3. **功能演示**：演示各种功能的使用方法
4. **测试工具**：提供测试和调试工具
