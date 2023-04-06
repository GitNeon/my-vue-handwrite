/**
 * @Author: fanx
 * @Date: 2023年03月06日 16:48
 * @Description: file content
 */

const arrayPrototype = Array.prototype;

// 新建一个对象，并将该对象的原型链指向数组的原型：Array.prototype
const newArrayPrototype = Object.create(arrayPrototype);

// 引起数组改变的方法
const methods = [
    'pop',
    'push',
    'shift',
    'unshift',
    'splice',
    'reverse',
    'sort'
]

methods.forEach(method => {
    newArrayPrototype[method] = function (...args) {
        const res = arrayPrototype[method].call(this, ...args);
        const ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                ob.observeArray(args);
                break;
            case 'splice':
                ob.observeArray(args.slice(2));
                break;
            default:
                break;
        }
        // 通知更新
        ob.dep.notify();
        return res;
    }
})

export default newArrayPrototype;
