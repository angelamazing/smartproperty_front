# Node.js后端服务关闭指南

## 📋 概述

本指南提供了多种关闭Node.js后端服务的方法，适用于不同的运行场景和需求。

## 🔍 检查服务状态

### 1. 查看当前运行的Node.js进程
```bash
# 查看所有Node.js进程
ps aux | grep node

# 查看特定端口的服务
netstat -tlnp | grep :3000

# 查看项目相关的Node.js进程
ps aux | grep -E "(server\.js|node.*server|nodemon)" | grep -v grep
```

### 2. 检查端口占用情况
```bash
# 检查3000端口是否被占用
netstat -tlnp | grep :3000

# 或者使用ss命令
ss -tlnp | grep :3000
```

## 🛑 关闭服务的方法

### 方法1: 优雅关闭（推荐）

#### 1.1 使用Ctrl+C
如果服务在终端前台运行：
```bash
# 在运行服务的终端中按 Ctrl+C
Ctrl + C
```

#### 1.2 使用SIGTERM信号
```bash
# 查找进程ID
ps aux | grep server.js | grep -v grep

# 发送SIGTERM信号（优雅关闭）
kill -TERM <进程ID>

# 或者使用kill命令（默认发送SIGTERM）
kill <进程ID>
```

#### 1.3 使用pkill命令
```bash
# 根据进程名关闭
pkill -f "server.js"

# 根据端口关闭
pkill -f ":3000"
```

### 方法2: 强制关闭

#### 2.1 使用SIGKILL信号
```bash
# 强制关闭（不推荐，可能导致数据丢失）
kill -9 <进程ID>

# 或者使用killall
killall -9 node
```

#### 2.2 使用pkill强制关闭
```bash
# 强制关闭所有Node.js进程
pkill -9 -f node

# 强制关闭特定服务
pkill -9 -f "server.js"
```

### 方法3: 使用PM2管理（如果使用PM2）

#### 3.1 查看PM2进程
```bash
pm2 list
```

#### 3.2 关闭PM2服务
```bash
# 关闭特定服务
pm2 stop <app_name>

# 关闭所有服务
pm2 stop all

# 删除服务
pm2 delete <app_name>

# 删除所有服务
pm2 delete all
```

### 方法4: 使用Docker（如果使用Docker）

#### 4.1 查看Docker容器
```bash
docker ps
```

#### 4.2 关闭Docker容器
```bash
# 停止容器
docker stop <container_id>

# 停止并删除容器
docker stop <container_id> && docker rm <container_id>
```

## 🔧 自动化关闭脚本

### 创建关闭脚本
```bash
#!/bin/bash
# stop-server.sh

echo "正在查找Node.js后端服务..."

# 查找服务进程
PID=$(ps aux | grep -E "(server\.js|node.*server)" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "未找到运行中的Node.js后端服务"
    exit 0
fi

echo "找到服务进程: $PID"

# 尝试优雅关闭
echo "正在优雅关闭服务..."
kill -TERM $PID

# 等待5秒
sleep 5

# 检查是否还在运行
if ps -p $PID > /dev/null; then
    echo "服务仍在运行，强制关闭..."
    kill -9 $PID
fi

echo "服务已关闭"
```

### 使用脚本
```bash
# 给脚本执行权限
chmod +x stop-server.sh

# 运行脚本
./stop-server.sh
```

## 🚨 紧急情况处理

### 1. 服务无响应
```bash
# 强制关闭所有Node.js进程
sudo pkill -9 -f node

# 或者使用killall
sudo killall -9 node
```

### 2. 端口被占用
```bash
# 查找占用端口的进程
sudo netstat -tlnp | grep :3000

# 强制关闭占用端口的进程
sudo kill -9 <进程ID>
```

### 3. 系统资源不足
```bash
# 查看系统资源使用情况
top
htop

# 关闭占用资源最多的Node.js进程
kill -9 <高CPU使用率的进程ID>
```

## 📊 服务状态检查

### 检查服务是否已关闭
```bash
# 检查进程
ps aux | grep server.js | grep -v grep

# 检查端口
netstat -tlnp | grep :3000

# 检查服务响应
curl -I http://localhost:3000/health
```

### 验证关闭结果
```bash
# 如果命令没有输出，说明服务已关闭
ps aux | grep server.js | grep -v grep

# 端口检查
netstat -tlnp | grep :3000
# 如果没有输出，说明端口已释放
```

## 🔄 重启服务

### 重启命令
```bash
# 停止服务
./stop-server.sh

# 等待几秒
sleep 3

# 重新启动服务
npm start
# 或者
node server.js
# 或者
nodemon server.js
```

## 📝 最佳实践

### 1. 优雅关闭
- 优先使用SIGTERM信号
- 给服务时间完成当前请求
- 保存重要数据

### 2. 日志记录
```bash
# 记录关闭操作
echo "$(date): 服务已关闭" >> server.log
```

### 3. 健康检查
```bash
# 关闭前检查服务状态
curl -f http://localhost:3000/health || echo "服务无响应"
```

### 4. 备份重要数据
```bash
# 关闭前备份数据库
mysqldump -u root -p smart_property > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🛠️ 故障排除

### 常见问题

#### 1. 进程无法关闭
```bash
# 检查进程状态
ps aux | grep <进程ID>

# 使用更强力的信号
kill -9 <进程ID>
```

#### 2. 端口仍被占用
```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 强制关闭
sudo kill -9 <进程ID>
```

#### 3. 权限问题
```bash
# 使用sudo权限
sudo kill <进程ID>
sudo pkill -f "server.js"
```

## 📋 关闭检查清单

- [ ] 检查服务状态
- [ ] 尝试优雅关闭
- [ ] 验证关闭结果
- [ ] 检查端口释放
- [ ] 记录关闭日志
- [ ] 备份重要数据（如需要）

## 🚀 快速命令参考

```bash
# 查看服务状态
ps aux | grep server.js | grep -v grep

# 优雅关闭
kill -TERM <PID>

# 强制关闭
kill -9 <PID>

# 关闭所有Node.js进程
pkill -f node

# 检查端口
netstat -tlnp | grep :3000

# 重启服务
npm start
```

---

**注意**: 在生产环境中，建议使用PM2或Docker等进程管理工具来管理Node.js服务，这样可以更方便地进行启动、停止、重启等操作。

**文档版本**: v1.0.0  
**创建时间**: 2025年1月  
**维护团队**: 湖北省地质局第三地质大队

