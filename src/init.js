/**
 * @Author: fanx
 * @Date: 2023年03月06日 13:52
 * @Description: vue init初始化
 */

import { initState }         from "./state.js";
import { compileToFunction } from "./compile/index.js";
import { mountComponent }    from "./lifecycle/init.js";
import { nextTick } from "./observe/watcher.js";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        // 将传入的options放入到vm自身上，方便其他方法体内取值
        vm.$options = options;

        // 初始化状态
        initState(vm);


        // 挂载模板
        if(options.el){
            vm.$mount(options.el);
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this;
        const opts = vm.$options;
        const queryEl = document.querySelector(el);

        // 如果没有render函数
        if(!opts.render){
            const template = opts.template || queryEl.outerHTML;
            if(template){
                const render = compileToFunction(template);
                opts.render = render;
            }
        }

        mountComponent(vm, queryEl)
    }

    Vue.prototype.$nextTick = nextTick;
}
