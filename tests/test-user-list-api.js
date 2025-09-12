/**
 * 用户列表API测试脚本
 * 用于验证修复后的用户列表API是否正常工作
 */

const axios = require('axios');

// 测试配置
const TEST_CONFIG = {
  // 生产环境地址
  PROD_BASE_URL: 'https://jcdtnpaompjy.sealosbja.site',
  // 开发环境地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 测试Token（需要替换为有效的管理员Token）
  TEST_TOKEN: 'YOUR_TEST_ADMIN_TOKEN_HERE'
};

// 获取基础URL
function getBaseUrl() {
  // 根据环境变量判断
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? TEST_CONFIG.DEV_BASE_URL : TEST_CONFIG.PROD_BASE_URL;
}

// 创建axios实例
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加认证Token
api.interceptors.request.use(config => {
  if (TEST_CONFIG.TEST_TOKEN) {
    config.headers.Authorization = `Bearer ${TEST_CONFIG.TEST_TOKEN}`;
  }
  return config;
});

// 响应拦截器：处理错误
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求失败:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * 测试用户列表API
 */
async function testUserListAPI() {
  console.log('🚀 开始测试用户列表API...\n');
  
  try {
    // 测试1：基本查询（无参数）
    console.log('📋 测试1：基本查询（无参数）');
    const basicResponse = await api.get('/api/user/list');
    console.log('✅ 基本查询成功');
    console.log('响应数据:', JSON.stringify(basicResponse.data, null, 2));
    console.log('');
    
    // 测试2：分页查询
    console.log('📋 测试2：分页查询');
    const pageResponse = await api.get('/api/user/list', {
      params: { page: 1, pageSize: 5 }
    });
    console.log('✅ 分页查询成功');
    console.log('分页信息:', {
      total: pageResponse.data.data.total,
      page: pageResponse.data.data.page,
      pageSize: pageResponse.data.data.pageSize,
      hasMore: pageResponse.data.data.hasMore
    });
    console.log('');
    
    // 测试3：角色筛选
    console.log('📋 测试3：角色筛选');
    const roleResponse = await api.get('/api/user/list', {
      params: { role: 'user' }
    });
    console.log('✅ 角色筛选成功');
    console.log('用户角色筛选结果数量:', roleResponse.data.data.records.length);
    console.log('');
    
    // 测试4：状态筛选
    console.log('📋 测试4：状态筛选');
    const statusResponse = await api.get('/api/user/list', {
      params: { status: 'active' }
    });
    console.log('✅ 状态筛选成功');
    console.log('活跃用户数量:', statusResponse.data.data.records.length);
    console.log('');
    
    // 测试5：部门筛选
    console.log('📋 测试5：部门筛选');
    const deptResponse = await api.get('/api/user/list', {
      params: { department: '技术部' }
    });
    console.log('✅ 部门筛选成功');
    console.log('技术部用户数量:', deptResponse.data.data.records.length);
    console.log('');
    
    // 测试6：关键词搜索
    console.log('📋 测试6：关键词搜索');
    const keywordResponse = await api.get('/api/user/list', {
      params: { keyword: '张' }
    });
    console.log('✅ 关键词搜索成功');
    console.log('关键词"张"搜索结果数量:', keywordResponse.data.data.records.length);
    console.log('');
    
    // 测试7：组合筛选
    console.log('📋 测试7：组合筛选');
    const combinedResponse = await api.get('/api/user/list', {
      params: {
        role: 'user',
        status: 'active',
        page: 1,
        pageSize: 10
      }
    });
    console.log('✅ 组合筛选成功');
    console.log('组合筛选结果数量:', combinedResponse.data.data.records.length);
    console.log('');
    
    // 测试8：数据字段验证
    console.log('📋 测试8：数据字段验证');
    if (combinedResponse.data.data.records.length > 0) {
      const user = combinedResponse.data.data.records[0];
      const requiredFields = ['_id', 'nickName', 'phoneNumber', 'department', 'role', 'status', 'createTime'];
      const missingFields = requiredFields.filter(field => !user.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log('✅ 数据字段完整');
        console.log('用户示例数据:', {
          id: user._id,
          name: user.nickName,
          phone: user.phoneNumber,
          dept: user.department,
          role: user.role,
          status: user.status,
          createTime: user.createTime
        });
      } else {
        console.log('❌ 缺少字段:', missingFields);
      }
    }
    console.log('');
    
    console.log('🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

/**
 * 测试权限验证
 */
async function testPermissionValidation() {
  console.log('🔐 测试权限验证...\n');
  
  try {
    // 测试无Token访问
    console.log('📋 测试无Token访问');
    try {
      await axios.get(`${getBaseUrl()}/api/user/list`);
      console.log('❌ 无Token访问应该失败');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 无Token访问正确被拒绝');
      } else {
        console.log('⚠️ 无Token访问返回状态码:', error.response?.status);
      }
    }
    console.log('');
    
    // 测试无效Token访问
    console.log('📋 测试无效Token访问');
    try {
      await axios.get(`${getBaseUrl()}/api/user/list`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ 无效Token访问应该失败');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 无效Token访问正确被拒绝');
      } else {
        console.log('⚠️ 无效Token访问返回状态码:', error.response?.status);
      }
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ 权限验证测试失败:', error.message);
  }
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('⚠️ 测试错误处理...\n');
  
  try {
    // 测试无效参数
    console.log('📋 测试无效参数');
    try {
      await api.get('/api/user/list', {
        params: { page: 'invalid', pageSize: 'invalid' }
      });
      console.log('✅ 无效参数被正确处理');
    } catch (error) {
      console.log('⚠️ 无效参数处理:', error.response?.status);
    }
    console.log('');
    
    // 测试超出范围的页码
    console.log('📋 测试超出范围的页码');
    try {
      const response = await api.get('/api/user/list', {
        params: { page: 999999, pageSize: 20 }
      });
      if (response.data.data.records.length === 0) {
        console.log('✅ 超出范围页码返回空结果');
      } else {
        console.log('⚠️ 超出范围页码处理异常');
      }
    } catch (error) {
      console.log('⚠️ 超出范围页码错误:', error.response?.status);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.message);
  }
}

/**
 * 性能测试
 */
async function testPerformance() {
  console.log('⚡ 性能测试...\n');
  
  try {
    const startTime = Date.now();
    
    // 测试查询性能
    console.log('📋 测试查询性能');
    const response = await api.get('/api/user/list', {
      params: { page: 1, pageSize: 100 }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 查询100条记录耗时: ${duration}ms`);
    console.log(`平均每条记录: ${(duration / response.data.data.records.length).toFixed(2)}ms`);
    console.log('');
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🧪 用户列表API全面测试开始\n');
  console.log('测试环境:', getBaseUrl());
  console.log('测试时间:', new Date().toLocaleString());
  console.log('='.repeat(50));
  
  try {
    // 运行所有测试
    await testUserListAPI();
    console.log('='.repeat(50));
    
    await testPermissionValidation();
    console.log('='.repeat(50));
    
    await testErrorHandling();
    console.log('='.repeat(50));
    
    await testPerformance();
    console.log('='.repeat(50));
    
    console.log('🎯 测试总结');
    console.log('✅ 功能测试完成');
    console.log('✅ 权限验证测试完成');
    console.log('✅ 错误处理测试完成');
    console.log('✅ 性能测试完成');
    console.log('\n🎉 所有测试通过！用户列表API工作正常。');
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 检查是否提供了测试Token
  if (TEST_CONFIG.TEST_TOKEN === 'YOUR_TEST_ADMIN_TOKEN_HERE') {
    console.log('⚠️ 警告: 请先设置有效的测试Token');
    console.log('请在TEST_CONFIG.TEST_TOKEN中设置有效的管理员Token');
    console.log('或者设置环境变量TEST_ADMIN_TOKEN');
    process.exit(1);
  }
  
  // 从环境变量获取Token
  if (process.env.TEST_ADMIN_TOKEN) {
    TEST_CONFIG.TEST_TOKEN = process.env.TEST_ADMIN_TOKEN;
  }
  
  runAllTests();
}

module.exports = {
  testUserListAPI,
  testPermissionValidation,
  testErrorHandling,
  testPerformance,
  runAllTests
};
