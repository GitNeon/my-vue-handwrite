/**
 * @Author: fanx
 * @Date: 2023年03月30日 17:17
 * @Description: file content
 */
import watcher from "./watcher.js";

let id = 0;

class Dep {
    constructor() {
        this.id = id++;
        // 收集watcher, 这里存放着当前属性对应的watcher有哪些
        this.subs = [];
    }

    depend() {
        // 为了避免重复收集watcher,不要再此处push
        // this.subs.push(Dep.target);
        // watcher也记住当前dep
        Dep.target.addDep(this);
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() {
        this.subs.forEach(watcher => {
            watcher.update();
        })
    }
}

// 这个target为类的静态属性，只有一份，
// 当每次创建watcher的时候，就让dep记住
Dep.target = null;

// 记住watcher的时候维护一个数组，这样方便计算属性使用了哪些watcher
let stack = [];

export function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}

export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep;
