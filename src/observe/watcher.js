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

// 把执行的任务放进队列中，不立即执行
// 这样做的好处是，如果更改了一个属性多次，则只执行最后一次，达到防抖的效果
let queue = [];
let has = {}; // 去重
let pending = false; // 防抖标志
function queueWatcher(watcher) {
    const id = watcher.id;
    // 利用对象去重，保证队列里放置的任务不是重复的
    if(!has[id]) {
        queue.push(watcher);
        has[id] = true;

        // 放进异步队列，在同步任务之后，最终执行一轮刷新操作
        if(!pending) {
            setTimeout(() => {
                flushQueue();
            }, 0)
            pending = true;
        }
    }
}

function flushQueue() {
    let _queue = queue.slice(0);
    _queue.forEach(q => q.get());
    // 执行任务后，清空
    queue = [];
    has = {};
    pending = false;
}

let callbacks = [];
let waiting = false;
export function nextTick(cb) {
    callbacks.push(cb);
    if(!waiting) {
        setTimeout(() => {
            flushCallback();
        }, 0)
        waiting = true;
    }
}

function flushCallback() {
    callbacks.forEach(cb => cb());
    waiting = false;
    callbacks = [];
}

// 需要给每个劫持的数据增加一个dep属性，让dep记住是哪一个watcher
// 一个组件可以定义多个数据，n个数据有n个dep; 一般一个组件对应一个watcher
export default Watcher
