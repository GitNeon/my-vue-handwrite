import Dep from "./dep.js";

/**
 * @Author: fanx
 * @Date: 2023年03月30日 16:42
 * @Description: file content
 */
// 每次创建watcher时都给一个不同的id
let id = 0;

class Watcher {

    /**
     * 构造函数，初始化watcher
     * @param vm 组件实例
     * @param callback 回调函数
     * @param isRender 是否为一个渲染Watcher
     */
    constructor(vm, callback, isRender = false) {
        this.id = id++;
        // 保存回调函数
        this.isRender = isRender;
        this.getter = callback;
        this.deps = [];
        // 利用set去重
        this.depsId = new Set();
        this.get()
    }

    get() {
        // 让dep记住当前的watcher实例
        Dep.target = this;
        this.getter();
        // 回调函数执行完毕，清空target
        Dep.target = null;
    }

    addDep(dep) {
        let id = dep.id;

        if(!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);
        }

    }

    update() {
        // 重新渲染
        this.get();
    }
}

// 需要给每个劫持的数据增加一个dep属性，让dep记住是哪一个watcher
// 一个组件可以定义多个数据，n个数据有n个dep; 一般一个组件对应一个watcher
export default Watcher
