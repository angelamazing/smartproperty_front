/**
 * API连接测试脚本
 * 测试远程API是否可访问
 */

const axios = require('axios');

const API_CONFIG = {
  baseURL: 'https://uauotggfeiao.sealosbja.site',
  timeout: 10000
};

async function testConnection() {
  console.log('🔍 测试API连接...');
  console.log(`📍 目标地址: ${API_CONFIG.baseURL}`);
  
  try {
    // 测试健康检查接口
    console.log('\n1. 测试健康检查接口...');
    const healthResponse = await axios.get(`${API_CONFIG.baseURL}/health`);
    console.log('✅ 健康检查接口正常');
    console.log(`   状态码: ${healthResponse.status}`);
    
  } catch (error) {
    console.log('⚠️ 健康检查接口不可用，尝试其他接口...');
  }

  try {
    // 测试登录接口
    console.log('\n2. 测试登录接口...');
    const loginResponse = await axios.post(`${API_CONFIG.baseURL}/api/auth/test-login-sys-admin`);
    
    if (loginResponse.data && loginResponse.data.success) {
      console.log('✅ 登录接口正常');
      console.log(`   用户: ${loginResponse.data.data.user?.name || '系统管理员'}`);
      console.log(`   角色: ${loginResponse.data.data.user?.role || 'sys_admin'}`);
      
      // 测试需要认证的接口
      const token = loginResponse.data.data.token;
      console.log('\n3. 测试用户列表接口...');
      
      const userResponse = await axios.get(`${API_CONFIG.baseURL}/api/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { page: 1, pageSize: 10 }
      });
      
      if (userResponse.data && userResponse.data.success) {
        console.log('✅ 用户列表接口正常');
        console.log(`   用户数量: ${userResponse.data.data.list?.length || 0}`);
      }
      
      console.log('\n4. 测试菜单历史接口...');
      
      const menuResponse = await axios.get(`${API_CONFIG.baseURL}/api/admin/menu/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { page: 1, pageSize: 10 }
      });
      
      if (menuResponse.data && menuResponse.data.success) {
        console.log('✅ 菜单历史接口正常');
        console.log(`   菜单数量: ${menuResponse.data.data.list?.length || 0}`);
      }
      
    } else {
      console.log('❌ 登录接口返回错误');
      console.log(`   错误信息: ${loginResponse.data?.message || '未知错误'}`);
    }
    
  } catch (error) {
    console.log('❌ API连接失败');
    console.log(`   错误类型: ${error.code || 'UNKNOWN'}`);
    console.log(`   错误信息: ${error.message}`);
    
    if (error.response) {
      console.log(`   HTTP状态码: ${error.response.status}`);
      console.log(`   响应数据: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// 运行测试
testConnection().then(() => {
  console.log('\n🏁 测试完成');
}).catch((error) => {
  console.error('❌ 测试过程中发生错误:', error.message);
  process.exit(1);
});
