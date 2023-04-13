import newArrayPrototype from "./array.js";
import Dep               from "./dep.js";

class Observer {
    constructor(data) {

        // 给每个对象增加依赖收集功能
        this.dep = new Dep();

        // data.__ob__ = this;
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        Array.isArray(data) ? this.observeArray(data) : this.observeObject(data);
    }

    // 循环对象，对属性依次劫持
    observeObject(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }

    // 观测数组
    observeArray(data) {
        data.__proto__ = newArrayPrototype;
        data.forEach(item => observe(item))
    }
}

// 对于数组，需要递归解决依赖收集问题
function dependArray(value) {
    if(value) {
        value.forEach(item => {
            item.__ob__ && item.__ob__.dep.depend();
            if(Array.isArray(item)) {
                dependArray(item);
            }
        })
    }
}

// 属性劫持方法，这个方法可以被单独使用，所以可以作为公共的方法导出
// 而不是依赖在Observer类上
export function defineReactive(target, key, value) {
    // 如果value还是个对象，就继续劫持
    let childObj = observe(value);

    // 每个属性都有一个dep
    let dep = new Dep();
    Object.defineProperty(target, key, {
        get() {
            // 取值的时候记住是哪个watcher
            if(Dep.target) {
                dep.depend();
                // 让数组和对象也进行依赖收集
                if(childObj) {
                    childObj.dep.depend();
                    if(Array.isArray(childObj)) {
                        dependArray(childObj);
                    }
                }
            }
            return value;
        },
        set(newValue) {
            if ( value === newValue ) return;
            // 如果用户设置值的时候，传入了对象
            // 例如 vm.address = { ... }, 这也是合法操作
            // 这时也应该代理新设置的对象
            observe(newValue);
            value = newValue;

            // 更新的时候通知所有watcher
            dep.notify();
        }
    })
}

// observe对data数据进行劫持
export function observe(data) {
    if ( data === null || typeof data !== 'object' ) {
        return;
    }
    // 说明该对象被监测过了
    if ( data.__ob__ instanceof Observer ) {
        return data.__ob__;
    }

    return new Observer(data);
}
