export function initLifeCycle(Vue){
    Vue.prototype._update = function(){
        console.log('update')
    }

    Vue.prototype._render = function(){
        const vm = this;
        vm.$options.render.call(vm);
    }
}

export function mountComponent(vm, el){
    vm._update(vm._render());
}
