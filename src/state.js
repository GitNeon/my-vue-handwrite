/**
 * @Author: fanx
 * @Date: 2023年03月06日 14:07
 * @Description: file content
 */
import { observe } from "./observe/index.js";
import Watcher     from "./observe/watcher.js";
import Dep         from "./observe/dep.js";

export function initState(vm) {
    const opts = vm.$options;
    // 如果有data，做初始化工作
    if(opts.data){
        initData(vm)
    }
    // 如果有computed
    if(opts.computed){
        initComputed(vm)
    }
}

// 代理vm对象，使其能够直接取data上的属性
function proxy(vm, targetKey){
    Object.keys(vm[targetKey]).forEach(key => {
            Object.defineProperty(vm, key, {
                get() {
                    return vm[targetKey][key]
                },
                set(newValue) {
                    vm[targetKey][key] = newValue
                }
            })
    })
}

function initData(vm) {
    let data = vm.$options.data;
    // data可能是对象也可能是函数
    // 注意：vue根实例data可以是对象，其他组件或者自己封装的组件data必须是函数，
    data = typeof data === 'function' ? data.call(vm) : data;
    // 将_data赋值到vm上，方便后续取值
    vm._data = data;
    // 响应式
    observe(data);
    // 代理vm取值
    proxy(vm, '_data');
}

function initComputed(vm) {
    const computed = vm.$options.computed;
    const watcher_map = {};
    vm._computedWatchers = watcher_map;
    for (const key in computed) {
        const useDef = computed[key];
        const getter = typeof useDef === 'function' ? useDef : useDef.get;
        watcher_map[key] = new Watcher(vm, getter, { lazy: true })
        defineComputed(vm, key, useDef);
    }
}

function defineComputed(vm, key, useDef) {
    const setter = useDef.set || (() => {});
    Object.defineProperty(vm, key, {
        get: createComputedGetter(key),
        set: setter,
    })
}

function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key];
        if(watcher.dirty) {
            watcher.evaluate();
        }
        // 计算属性出栈后，还要渲染watcher
        if(Dep.target) {
            watcher.depend();
        }
        return watcher.value;
    }
}
