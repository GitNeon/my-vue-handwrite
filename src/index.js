/**
 * @Author: fanx
 * @Date: 2023年03月06日 11:28
 * @Description: vue
 */
import { initMixin }     from "./init.js";
import { initLifeCycle } from "./lifecycle/init.js";

/**
 * Vue的设计不是一个Class类，而是通过function构建出来的一个对象
 * 这个对象接收一个参数option
 *
 * Vue的核心创建流程：
 *  1) 解析传入的option，并把一些属性挂载vm实例上，方便取值
 *  2) 解析过程中，首先使用Object.defineProperty对data进行响应式处理，由于需要深度变量对象
 *     多次劫持，所以这也是vue2性能瓶颈所在
 *  3) 解析传入的模板，并将模板转化成ast语法树，最后编译成render函数
 *      在vue中，无论是通过template传入模板，还是通过el获取html模板，都会编译成render函数
 *  4) 使用render函数产生虚拟节点(同时结合响应式数据)
 *  5) 根据虚拟节点创造真是DOM
 *  ...
 */
function Vue(options) {
    // 这里面只干了一件事就是通过调用原型上的init方法来初始化vue的创建
    this._init(options)
}

// 这个方法给vue原型上添加初始化方法，例如_init方法,$mount方法等等
initMixin(Vue);
// 初始化生命周期
initLifeCycle(Vue);

export default Vue;
