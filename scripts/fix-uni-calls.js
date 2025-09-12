/**
 * 修复uni API调用的脚本
 * 将uni调用替换为平台兼容的调用
 */

const fs = require('fs')
const path = require('path')

// 需要修复的文件列表 - 动态获取所有包含uni调用的文件

function findFilesWithUniCalls(dir) {
  const files = []
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath)
      } else if (stat.isFile() && (item.endsWith('.vue') || item.endsWith('.js'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          if (content.includes('uni.')) {
            files.push(fullPath)
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }
  }
  
  scanDirectory(dir)
  return files
}

// 动态获取需要修复的文件
const filesToFix = findFilesWithUniCalls('src')

// uni API映射到平台兼容函数
const uniApiMapping = {
  'uni.showToast': 'showToast',
  'uni.showModal': 'showModal',
  'uni.showLoading': 'showLoading',
  'uni.hideLoading': 'hideLoading',
  'uni.navigateTo': 'navigateTo',
  'uni.redirectTo': 'redirectTo',
  'uni.switchTab': 'switchTab',
  'uni.reLaunch': 'reLaunch',
  'uni.navigateBack': 'navigateBack',
  'uni.getStorageSync': 'getStorageSync',
  'uni.setStorageSync': 'setStorageSync',
  'uni.removeStorageSync': 'removeStorageSync'
}

// 需要导入的平台兼容函数
const platformImports = [
  'showToast',
  'showModal', 
  'showLoading',
  'hideLoading',
  'navigateTo',
  'navigateBack',
  'redirectTo',
  'switchTab',
  'reLaunch',
  'getStorageSync',
  'setStorageSync',
  'removeStorageSync'
]

function fixUniCalls(filePath) {
  try {
    console.log(`正在修复文件: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`)
      return
    }
    
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    // 检查是否已经导入了平台兼容函数
    const hasPlatformImport = content.includes('from \'@/utils/platform.js\'')
    
    // 替换uni调用
    for (const [uniApi, platformApi] of Object.entries(uniApiMapping)) {
      const regex = new RegExp(uniApi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      if (content.includes(uniApi)) {
        content = content.replace(regex, platformApi)
        modified = true
        console.log(`  - 替换 ${uniApi} -> ${platformApi}`)
      }
    }
    
    // 添加平台兼容函数导入
    if (modified && !hasPlatformImport) {
      // 查找import语句的位置
      const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?\s*\n/g
      const imports = content.match(importRegex) || []
      const lastImport = imports[imports.length - 1]
      
      if (lastImport) {
        const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length
        const platformImport = `import { ${platformImports.join(', ')} } from '@/utils/platform.js'\n`
        content = content.slice(0, lastImportIndex) + platformImport + content.slice(lastImportIndex)
        console.log(`  - 添加平台兼容函数导入`)
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ 文件修复完成: ${filePath}`)
    } else {
      console.log(`ℹ️  文件无需修复: ${filePath}`)
    }
    
  } catch (error) {
    console.error(`❌ 修复文件失败: ${filePath}`, error.message)
  }
}

// 主函数
function main() {
  console.log('开始修复uni API调用...')
  
  filesToFix.forEach(filePath => {
    fixUniCalls(filePath)
  })
  
  console.log('修复完成！')
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = { fixUniCalls, uniApiMapping, platformImports }
