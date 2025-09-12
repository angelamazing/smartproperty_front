/*
 * @Author: Jerry Han angelamazing@163.com
 * @Date: 2025-08-23 13:54:33
 * @LastEditors: Jerry Han angelamazing@163.com
 * @LastEditTime: 2025-08-28 15:26:36
 * @FilePath: \my-vue3-project\src\shime-uni.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export {};

declare module "vue" {
  type Hooks = App.AppInstance & Page.PageInstance;
  interface ComponentCustomOptions extends Hooks {}
}