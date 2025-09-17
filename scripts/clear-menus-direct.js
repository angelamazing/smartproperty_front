/**
 * 直接清空菜单数据脚本
 * 专门用于删除菜单记录
 */

const axios = require('axios');

const API_CONFIG = {
  baseURL: 'https://uauotggfeiao.sealosbja.site',
  timeout: 30000
};

class MenuClearer {
  constructor() {
    this.token = null;
  }

  /**
   * 登录获取管理员token
   */
  async login() {
    try {
      console.log('🔐 正在登录系统管理员...');
      
      const response = await axios.post(`${API_CONFIG.baseURL}/api/auth/test-login-sys-admin`);
      
      if (response.data && response.data.success) {
        this.token = response.data.data.token;
        console.log('✅ 登录成功');
        return true;
      } else {
        throw new Error(response.data?.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return false;
    }
  }

  /**
   * 获取所有菜单（使用不同的参数）
   */
  async getAllMenus() {
    try {
      console.log('📋 正在获取菜单列表...');
      
      // 尝试不同的参数组合
      const paramsList = [
        { page: 1, pageSize: 100 },
        { page: 1, pageSize: 50 },
        { page: 1, pageSize: 20 },
        {} // 不传参数
      ];

      for (const params of paramsList) {
        try {
          console.log(`   尝试参数:`, params);
          const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/menu/history`, {
            headers: { 'Authorization': `Bearer ${this.token}` },
            params: params
          });
          
          if (response.data && response.data.success) {
            const menus = response.data.data.list || [];
            console.log(`✅ 获取到 ${menus.length} 个菜单`);
            return menus;
          }
        } catch (error) {
          console.log(`   ❌ 参数失败: ${error.response?.status} - ${error.message}`);
          continue;
        }
      }
      
      throw new Error('所有参数组合都失败了');
    } catch (error) {
      console.error('❌ 获取菜单列表失败:', error.message);
      return [];
    }
  }

  /**
   * 删除菜单
   */
  async deleteMenu(menuId) {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/admin/menu/${menuId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return response.data && response.data.success;
    } catch (error) {
      console.warn(`⚠️ 删除菜单 ${menuId} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 清空所有菜单
   */
  async clearAllMenus() {
    try {
      // 1. 登录
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        console.log('❌ 登录失败，无法继续操作');
        return;
      }

      // 2. 获取菜单列表
      const menus = await this.getAllMenus();
      
      if (menus.length === 0) {
        console.log('✅ 没有菜单需要删除');
        return;
      }

      console.log(`\n⚠️ 找到 ${menus.length} 个菜单，准备删除...`);
      
      // 3. 显示菜单信息
      console.log('\n📋 菜单列表:');
      menus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ID: ${menu._id}`);
        console.log(`      日期: ${menu.publishDate || '未知'}`);
        console.log(`      餐次: ${menu.mealType || '未知'}`);
        console.log(`      状态: ${menu.publishStatus || '未知'}`);
        console.log('');
      });

      // 4. 确认删除
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirm = await new Promise((resolve) => {
        rl.question(`确认删除这 ${menus.length} 个菜单吗？输入 "YES" 继续: `, (answer) => {
          resolve(answer === 'YES');
        });
      });

      rl.close();

      if (!confirm) {
        console.log('❌ 删除操作已取消');
        return;
      }

      // 5. 执行删除
      console.log('\n🗑️ 开始删除菜单...');
      let deleted = 0;
      let errors = 0;

      for (const menu of menus) {
        console.log(`   删除菜单: ${menu._id} (${menu.publishDate} ${menu.mealType})`);
        const success = await this.deleteMenu(menu._id);
        if (success) {
          deleted++;
          console.log(`   ✅ 删除成功`);
        } else {
          errors++;
          console.log(`   ❌ 删除失败`);
        }
      }

      console.log(`\n📊 删除完成统计:`);
      console.log(`   - 成功删除: ${deleted} 个`);
      console.log(`   - 删除失败: ${errors} 个`);
      console.log(`   - 总计: ${menus.length} 个`);

      if (deleted > 0) {
        console.log('\n✅ 菜单清空操作完成！');
      } else {
        console.log('\n❌ 没有成功删除任何菜单');
      }

    } catch (error) {
      console.error('❌ 清空菜单操作失败:', error.message);
    }
  }
}

// 主函数
async function main() {
  const clearer = new MenuClearer();
  await clearer.clearAllMenus();
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🗑️ 菜单清空工具');
  console.log('⚠️ 此操作将删除所有菜单记录！');
  console.log('');
  main();
}

module.exports = MenuClearer;
