/**
 * @Author: fanx
 * @Date: 2023年03月06日 11:28
 * @Description: vue
 */
import { initMixin } from "./init";

/**
 * Vue的设计不是一个Class类，而是通过function构建出来的一个对象
 * 这个对象接收一个参数option,
 */
function Vue(options) {
    // 这里面只干了一件事就是通过调用原型上的init方法来初始化vue的创建
    this._init(options)
}

// 这个方法给vue原型上添加初始化方法，例如_init方法,$mount方法等等
initMixin(Vue);

export default Vue;
