// VNode对象

import { patchProps } from './patch.js'

function VNode(vm, tag, key, data, children, text){
    this.vm = vm;
    this.tag = tag;
    this.key = key;
    this.data = data;
    this.children = children;
    this.text = text;
}

// 创建VNode虚拟节点
export function createVNodeElement(vm, tag, data, ...children) {
    if(!data){
        data = {};
    }
    let key = data.key;
    if(key) {
        delete data.key;
    }
    return new VNode(vm, tag, key, data, children);
}

// 创建文本节点
export function createVNodeText(vm, text){
    return new VNode(vm, undefined, undefined, undefined, undefined, text);
}

// 创建真实节点
export function createElement(vnode) {
    const { tag, data, children, text } = vnode;
    if(typeof tag === 'string') {
        // 这里把真实元素对应起来，方便后续diff算法使用
        vnode.realElement = document.createElement(tag);
        patchProps(vnode.realElement, {}, data);
        // 如果有子节点，放入到该元素下面
        children.forEach(child => {
            vnode.realElement.appendChild(createElement(child));
        })
    }else {
        vnode.realElement = document.createTextNode(text);
    }

    return vnode.realElement;
}
