/**
 * @Author: fanx
 * @Date: 2023年03月06日 13:52
 * @Description: vue init初始化
 */

import { initState } from "./state.js";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        // 将传入的options放入到vm自身上，方便其他方法体内取值
        vm.$options = options;

        // 初始化状态
        initState(vm);
    }
}
