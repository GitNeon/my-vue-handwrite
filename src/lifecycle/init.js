import { createVNodeElement, createVNodeText, patch } from "../vdom/index.js";

export function initLifeCycle(Vue){
    Vue.prototype._update = function(vnode){
        const vm = this;
        const el = vm.$el;
        // console.log('update', vnode)
        vm.$el = patch(el, vnode);
    }

    Vue.prototype._c = function (){
        return createVNodeElement(this, ...arguments);
    }

    Vue.prototype._v = function (){
        return createVNodeText(this, ...arguments);
    }

    // 就是JSON.stringify方法,用来格式化字符串
    Vue.prototype._s = function (value){
        return JSON.stringify(value)
    }

    Vue.prototype._render = function(){
        const vm = this;
        return vm.$options.render.call(vm);
    }
}

export function mountComponent(vm, el){
    vm.$el = el;
    vm._update(vm._render());
}
