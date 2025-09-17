/**
 * 数据库清空API接口
 * 通过API接口安全地清空数据库
 */

const axios = require('axios');

// API配置
const API_CONFIG = {
  baseURL: 'https://uauotggfeiao.sealosbja.site',
  timeout: 30000
};

class DatabaseClearAPI {
  constructor() {
    this.token = null;
  }

  /**
   * 登录获取管理员token
   */
  async login() {
    try {
      console.log('🔐 正在登录...');
      
      // 使用系统管理员测试登录
      const response = await axios.post(`${API_CONFIG.baseURL}/api/auth/test-login-sys-admin`, {
        // 测试登录不需要参数
      });
      
      if (response.data && response.data.success) {
        this.token = response.data.data.token;
        console.log('✅ 登录成功');
        return true;
      } else {
        throw new Error(response.data?.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取所有用户列表
   */
  async getAllUsers() {
    try {
      console.log('👥 正在获取用户列表...');
      
      const response = await axios.get(`${API_CONFIG.baseURL}/api/user/list`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        params: {
          page: 1,
          pageSize: 1000  // 获取所有用户
        }
      });
      
      if (response.data && response.data.success) {
        const users = response.data.data.list || [];
        console.log(`✅ 获取到 ${users.length} 个用户`);
        return users;
      } else {
        throw new Error(response.data?.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('❌ 获取用户列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data && response.data.success;
    } catch (error) {
      console.warn(`⚠️ 删除用户 ${userId} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 获取菜单历史
   */
  async getAllMenus() {
    try {
      console.log('📋 正在获取菜单列表...');
      
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/menu/history`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        params: {
          page: 1,
          pageSize: 1000  // 获取所有菜单
        }
      });
      
      if (response.data && response.data.success) {
        const menus = response.data.data.list || [];
        console.log(`✅ 获取到 ${menus.length} 个菜单`);
        return menus;
      } else {
        throw new Error(response.data?.message || '获取菜单列表失败');
      }
    } catch (error) {
      console.error('❌ 获取菜单列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除菜单
   */
  async deleteMenu(menuId) {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/admin/menu/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data && response.data.success;
    } catch (error) {
      console.warn(`⚠️ 删除菜单 ${menuId} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  async clearAllData() {
    const stats = {
      usersDeleted: 0,
      usersPreserved: 0,
      menusDeleted: 0,
      errors: []
    };

    try {
      // 1. 登录
      await this.login();

      // 2. 获取并删除用户（保留系统管理员）
      console.log('\n👥 开始处理用户数据...');
      const users = await this.getAllUsers();
      
      for (const user of users) {
        if (user.role === 'sys_admin') {
          console.log(`⏭️ 保留系统管理员: ${user.name || user.nickName || user._id}`);
          stats.usersPreserved++;
        } else {
          console.log(`🗑️ 删除用户: ${user.name || user.nickName || user._id} (${user.role})`);
          const success = await this.deleteUser(user._id);
          if (success) {
            stats.usersDeleted++;
          } else {
            stats.errors.push(`删除用户 ${user._id} 失败`);
          }
        }
      }

      // 3. 获取并删除菜单
      console.log('\n📋 开始处理菜单数据...');
      const menus = await this.getAllMenus();
      
      for (const menu of menus) {
        console.log(`🗑️ 删除菜单: ${menu._id} (${menu.publishDate} ${menu.mealType})`);
        const success = await this.deleteMenu(menu._id);
        if (success) {
          stats.menusDeleted++;
        } else {
          stats.errors.push(`删除菜单 ${menu._id} 失败`);
        }
      }

      // 4. 显示统计信息
      console.log('\n📊 清空操作完成统计:');
      console.log(`   - 已删除用户: ${stats.usersDeleted} 个`);
      console.log(`   - 已保留用户: ${stats.usersPreserved} 个`);
      console.log(`   - 已删除菜单: ${stats.menusDeleted} 个`);
      console.log(`   - 错误数量: ${stats.errors.length} 个`);

      if (stats.errors.length > 0) {
        console.log('\n❌ 错误详情:');
        stats.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      console.log('\n✅ 数据库清空操作完成！');

    } catch (error) {
      console.error('❌ 清空操作失败:', error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const clearer = new DatabaseClearAPI();
  
  try {
    await clearer.clearAllData();
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('⚠️ 数据库清空API脚本');
  console.log('⚠️ 此操作将永久删除数据！');
  console.log('⚠️ 将保留系统管理员用户');
  console.log('');
  
  // 确认操作
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('确认要清空数据库吗？输入 "YES" 继续: ', (answer) => {
    if (answer === 'YES') {
      main();
    } else {
      console.log('❌ 操作已取消');
      process.exit(0);
    }
    rl.close();
  });
}

module.exports = DatabaseClearAPI;
