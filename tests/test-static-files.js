/**
 * 测试后端静态文件服务
 * 运行: node test-static-files.js
 */

const http = require('http')
const https = require('https')

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testPaths: [
    '/uploads/avatars/avatar_1756687222017_hsnganr3o.png',
    '/uploads/avatars/avatar_1756686939130_kqcsvlrgi.png',
    '/api/static/uploads/avatars/avatar_1756687222017_hsnganr3o.png',
    '/api/static/uploads/avatars/avatar_1756686939130_kqcsvlrgi.png'
  ]
}

/**
 * 测试URL是否可访问
 */
function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, (res) => {
      console.log(`✅ ${url} - 状态码: ${res.statusCode}`)
      console.log(`   内容类型: ${res.headers['content-type']}`)
      console.log(`   内容长度: ${res.headers['content-length']} bytes`)
      console.log(`   CORS头: ${res.headers['access-control-allow-origin'] || '未设置'}`)
      
      if (res.statusCode === 200) {
        resolve({ success: true, statusCode: res.statusCode, headers: res.headers })
      } else {
        resolve({ success: false, statusCode: res.statusCode, headers: res.headers })
      }
    })
    
    req.on('error', (err) => {
      console.log(`❌ ${url} - 错误: ${err.message}`)
      resolve({ success: false, error: err.message })
    })
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} - 超时`)
      req.destroy()
      resolve({ success: false, error: '超时' })
    })
  })
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('🚀 开始测试后端静态文件服务...\n')
  
  for (const path of TEST_CONFIG.testPaths) {
    const url = TEST_CONFIG.baseUrl + path
    console.log(`📡 测试: ${url}`)
    
    const result = await testUrl(url)
    
    if (result.success) {
      console.log(`✅ 成功: ${path}`)
    } else {
      console.log(`❌ 失败: ${path} - ${result.error || `状态码: ${result.statusCode}`}`)
    }
    
    console.log('') // 空行分隔
  }
  
  console.log('🏁 测试完成')
}

// 运行测试
runTests().catch(console.error)
