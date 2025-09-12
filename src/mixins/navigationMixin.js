/**
 * 导航混入
 * 为所有页面提供智能导航功能
 */
import { smartNavigate, smartRedirect, smartReload } from '@/utils/navigation.js'

export default {
  methods: {
    /**
     * 智能导航
     * @param {string} url 目标页面路径
     * @param {Object} options 导航选项
     * @returns {Promise} 导航结果
     */
    $smartNavigate(url, options = {}) {
      return smartNavigate(url, options)
    },

    /**
     * 智能重定向
     * @param {string} url 目标页面路径
     * @param {Object} options 重定向选项
     * @returns {Promise} 重定向结果
     */
    $smartRedirect(url, options = {}) {
      return smartRedirect(url, options)
    },

    /**
     * 智能重启
     * @param {string} url 目标页面路径
     * @param {Object} options 重启选项
     * @returns {Promise} 重启结果
     */
    $smartReload(url, options = {}) {
      return smartReload(url, options)
    },

    /**
     * 跳转到首页
     * @param {Object} options 导航选项
     * @returns {Promise} 导航结果
     */
    $goToHome(options = {}) {
      return this.$smartNavigate('/pages/index/index', options)
    },

    /**
     * 跳转到报餐页面
     * @param {Object} options 导航选项
     * @returns {Promise} 导航结果
     */
    $goToDining(options = {}) {
      return this.$smartNavigate('/pages/dining/dining', options)
    },

    /**
     * 跳转到预约页面
     * @param {Object} options 导航选项
     * @returns {Promise} 导航结果
     */
    $goToReservation(options = {}) {
      return this.$smartNavigate('/pages/reservation/reservation', options)
    },

    /**
     * 跳转到个人中心
     * @param {Object} options 导航选项
     * @returns {Promise} 导航结果
     */
    $goToProfile(options = {}) {
      return this.$smartNavigate('/pages/profile/profile', options)
    }
  }
}
