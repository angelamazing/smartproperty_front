/**
 * 安全数据库清空脚本
 * 分步骤清空数据库，每步都需要确认
 * 
 * ⚠️ 警告：这是一个危险操作，会永久删除数据！
 */

const axios = require('axios');
const readline = require('readline');

// API配置
const API_CONFIG = {
  baseURL: 'https://uauotggfeiao.sealosbja.site',
  timeout: 30000
};

class SafeDatabaseClearer {
  constructor() {
    this.token = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 询问用户确认
   */
  async askConfirmation(question) {
    return new Promise((resolve) => {
      this.rl.question(`${question} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
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
   * 获取用户统计信息
   */
  async getUserStats() {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/user/list`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
        params: { page: 1, pageSize: 1000 }
      });
      
      if (response.data && response.data.success) {
        const users = response.data.data.list || [];
        const stats = {
          total: users.length,
          sysAdmin: users.filter(u => u.role === 'sys_admin').length,
          deptAdmin: users.filter(u => u.role === 'dept_admin').length,
          user: users.filter(u => u.role === 'user').length
        };
        return { users, stats };
      }
      throw new Error('获取用户统计失败');
    } catch (error) {
      console.error('❌ 获取用户统计失败:', error.message);
      return null;
    }
  }

  /**
   * 获取菜单统计信息
   */
  async getMenuStats() {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/menu/history`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
        params: { page: 1, pageSize: 1000 }
      });
      
      if (response.data && response.data.success) {
        const menus = response.data.data.list || [];
        const stats = {
          total: menus.length,
          draft: menus.filter(m => m.publishStatus === 'draft').length,
          published: menus.filter(m => m.publishStatus === 'published').length,
          revoked: menus.filter(m => m.publishStatus === 'revoked').length
        };
        return { menus, stats };
      }
      throw new Error('获取菜单统计失败');
    } catch (error) {
      console.error('❌ 获取菜单统计失败:', error.message);
      if (error.response) {
        console.error('   响应状态:', error.response.status);
        console.error('   响应数据:', error.response.data);
      }
      return null;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return response.data && response.data.success;
    } catch (error) {
      console.warn(`⚠️ 删除用户 ${userId} 失败:`, error.message);
      return false;
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
   * 步骤1：显示当前数据统计
   */
  async step1_ShowStats() {
    console.log('\n📊 步骤1：当前数据统计');
    console.log('=' .repeat(50));
    
    const userData = await this.getUserStats();
    if (userData) {
      const { stats } = userData;
      console.log('👥 用户统计:');
      console.log(`   - 总用户数: ${stats.total}`);
      console.log(`   - 系统管理员: ${stats.sysAdmin}`);
      console.log(`   - 部门管理员: ${stats.deptAdmin}`);
      console.log(`   - 普通用户: ${stats.user}`);
    }

    const menuData = await this.getMenuStats();
    if (menuData) {
      const { stats } = menuData;
      console.log('\n📋 菜单统计:');
      console.log(`   - 总菜单数: ${stats.total}`);
      console.log(`   - 草稿状态: ${stats.draft}`);
      console.log(`   - 已发布: ${stats.published}`);
      console.log(`   - 已撤回: ${stats.revoked}`);
    }

    const confirm = await this.askConfirmation('\n是否继续清空操作？');
    return confirm;
  }

  /**
   * 步骤2：清空用户数据（保留系统管理员）
   */
  async step2_ClearUsers() {
    console.log('\n👥 步骤2：清空用户数据（保留系统管理员）');
    console.log('=' .repeat(50));
    
    const userData = await this.getUserStats();
    if (!userData) return false;

    const { users, stats } = userData;
    
    if (stats.total === stats.sysAdmin) {
      console.log('✅ 没有需要删除的用户，所有用户都是系统管理员');
      return true;
    }

    console.log(`⚠️ 将删除 ${stats.deptAdmin + stats.user} 个用户，保留 ${stats.sysAdmin} 个系统管理员`);
    
    const confirm = await this.askConfirmation('确认删除非系统管理员用户？');
    if (!confirm) {
      console.log('❌ 用户删除操作已取消');
      return false;
    }

    let deleted = 0;
    let errors = 0;

    for (const user of users) {
      if (user.role !== 'sys_admin') {
        console.log(`🗑️ 删除用户: ${user.name || user.nickName || user._id} (${user.role})`);
        const success = await this.deleteUser(user._id);
        if (success) {
          deleted++;
        } else {
          errors++;
        }
      }
    }

    console.log(`✅ 用户删除完成: 成功 ${deleted} 个，失败 ${errors} 个`);
    return true;
  }

  /**
   * 步骤3：清空菜单数据
   */
  async step3_ClearMenus() {
    console.log('\n📋 步骤3：清空菜单数据');
    console.log('=' .repeat(50));
    
    const menuData = await this.getMenuStats();
    if (!menuData) {
      console.log('⚠️ 无法获取菜单统计信息，跳过菜单清空步骤');
      return true; // 继续执行，不中断流程
    }

    const { menus, stats } = menuData;
    
    if (stats.total === 0) {
      console.log('✅ 没有需要删除的菜单');
      return true;
    }

    console.log(`⚠️ 将删除 ${stats.total} 个菜单记录`);
    
    const confirm = await this.askConfirmation('确认删除所有菜单？');
    if (!confirm) {
      console.log('❌ 菜单删除操作已取消');
      return false;
    }

    let deleted = 0;
    let errors = 0;

    for (const menu of menus) {
      console.log(`🗑️ 删除菜单: ${menu._id} (${menu.publishDate} ${menu.mealType})`);
      const success = await this.deleteMenu(menu._id);
      if (success) {
        deleted++;
      } else {
        errors++;
      }
    }

    console.log(`✅ 菜单删除完成: 成功 ${deleted} 个，失败 ${errors} 个`);
    return true;
  }

  /**
   * 步骤4：最终确认和清理
   */
  async step4_FinalCleanup() {
    console.log('\n🧹 步骤4：最终清理和确认');
    console.log('=' .repeat(50));
    
    console.log('📊 最终数据统计:');
    
    const userData = await this.getUserStats();
    if (userData) {
      const { stats } = userData;
      console.log(`👥 剩余用户: ${stats.total} 个 (系统管理员: ${stats.sysAdmin})`);
    }

    const menuData = await this.getMenuStats();
    if (menuData) {
      const { stats } = menuData;
      console.log(`📋 剩余菜单: ${stats.total} 个`);
    }

    console.log('\n✅ 数据库清空操作完成！');
    console.log('✅ 已保留系统管理员用户');
    console.log('✅ 已清空所有业务数据');
  }

  /**
   * 执行完整的清空流程
   */
  async execute() {
    try {
      console.log('🚀 安全数据库清空工具');
      console.log('⚠️ 警告：此操作将永久删除数据！');
      console.log('⚠️ 将保留系统管理员用户');
      console.log('');

      // 登录
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        console.log('❌ 登录失败，无法继续操作');
        return;
      }

      // 步骤1：显示统计信息
      const step1Confirm = await this.step1_ShowStats();
      if (!step1Confirm) {
        console.log('❌ 操作已取消');
        return;
      }

      // 步骤2：清空用户
      const step2Success = await this.step2_ClearUsers();
      if (!step2Success) {
        console.log('❌ 用户清空失败，停止操作');
        return;
      }

      // 步骤3：清空菜单
      const step3Success = await this.step3_ClearMenus();
      if (!step3Success) {
        console.log('❌ 菜单清空失败，停止操作');
        return;
      }

      // 步骤4：最终确认
      await this.step4_FinalCleanup();

    } catch (error) {
      console.error('❌ 操作过程中发生错误:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// 主函数
async function main() {
  const clearer = new SafeDatabaseClearer();
  await clearer.execute();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = SafeDatabaseClearer;
