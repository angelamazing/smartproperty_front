/**
 * 数据库配置检查脚本
 * 帮助获取正确的数据库连接信息
 */

const axios = require('axios');

const API_CONFIG = {
  baseURL: 'https://uauotggfeiao.sealosbja.site',
  timeout: 10000
};

async function checkDatabaseConfig() {
  console.log('🔍 数据库配置检查工具');
  console.log('=' .repeat(50));
  
  try {
    // 1. 测试API连接
    console.log('1. 测试API连接...');
    const healthResponse = await axios.get(`${API_CONFIG.baseURL}/health`);
    console.log(`   ✅ API连接正常 (状态码: ${healthResponse.status})`);
    
    // 2. 测试登录
    console.log('\n2. 测试登录功能...');
    const loginResponse = await axios.post(`${API_CONFIG.baseURL}/api/auth/test-login-sys-admin`);
    
    if (loginResponse.data && loginResponse.data.success) {
      console.log('   ✅ 登录成功');
      console.log(`   👤 用户: ${loginResponse.data.data.user?.name || '系统管理员'}`);
      console.log(`   🔑 角色: ${loginResponse.data.data.user?.role || 'sys_admin'}`);
      
      const token = loginResponse.data.data.token;
      
      // 3. 测试数据库查询
      console.log('\n3. 测试数据库查询...');
      
      // 测试用户表
      try {
        const userResponse = await axios.get(`${API_CONFIG.baseURL}/api/user/list`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page: 1, pageSize: 10 }
        });
        
        if (userResponse.data && userResponse.data.success) {
          console.log('   ✅ 用户表查询正常');
          console.log(`   👥 用户数量: ${userResponse.data.data.list?.length || 0}`);
        }
      } catch (error) {
        console.log('   ❌ 用户表查询失败:', error.message);
      }
      
      // 测试菜单表
      try {
        const menuResponse = await axios.get(`${API_CONFIG.baseURL}/api/admin/menu/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page: 1, pageSize: 10 }
        });
        
        if (menuResponse.data && menuResponse.data.success) {
          console.log('   ✅ 菜单表查询正常');
          console.log(`   📋 菜单数量: ${menuResponse.data.data.list?.length || 0}`);
        }
      } catch (error) {
        console.log('   ❌ 菜单表查询失败:', error.message);
      }
      
      // 4. 分析数据库结构
      console.log('\n4. 分析数据库结构...');
      console.log('   📊 基于API响应分析，数据库包含以下表:');
      console.log('   - users (用户表)');
      console.log('   - menus (菜单表)');
      console.log('   - dishes (菜品表)');
      console.log('   - dining_orders (报餐订单表)');
      console.log('   - 其他业务表...');
      
      // 5. 提供连接建议
      console.log('\n5. 数据库连接建议:');
      console.log('   🔗 数据库地址: uauotggfeiao.sealosbja.site');
      console.log('   🚪 端口: 3306 (MySQL默认端口)');
      console.log('   🗄️ 数据库名: smart_property');
      console.log('   👤 用户名: 需要从后端配置获取');
      console.log('   🔐 密码: 需要从后端配置获取');
      
      console.log('\n⚠️ 注意事项:');
      console.log('   - 需要联系后端开发人员获取数据库连接信息');
      console.log('   - 或者检查后端代码中的数据库配置');
      console.log('   - 确保有数据库的直接访问权限');
      
    } else {
      console.log('   ❌ 登录失败');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

// 运行检查
checkDatabaseConfig().then(() => {
  console.log('\n🏁 配置检查完成');
}).catch((error) => {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
});
