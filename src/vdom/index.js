// VNode对象

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
        patchProps(vnode.realElement, data);
        // 如果有子节点，放入到该元素下面
        children.forEach(child => {
            vnode.realElement.appendChild(createElement(child));
        })
    }else {
        vnode.realElement = document.createTextNode(text);
    }

    return vnode.realElement;
}

// 设置标签的属性
export function patchProps(element, props) {
    for (let key in props){
        if(key === 'style'){
            for(let styleName in props.style){
                element.style[styleName] = props.style[styleName]
            }
            return;
        }
        element.setAttribute(key, props[key]);
    }
}

// 更新节点信息
// element: 真实节点元素
// vnode: 虚拟DOM元素
export function patch(element, vnode){
    const isRealElement = element.nodeType;
    /**
     * nodeType 属性以数字形式返回指定节点的节点类型。
     *
     * 如果节点是元素节点，则 nodeType 属性将返回 1。
     * 如果节点是属性节点，则 nodeType 属性将返回 2。
     * 如果节点是文本节点，则 nodeType 属性将返回 3。
     * 如果节点是注释节点，则 nodeType 属性将返回 8
     */
    // 判断一下是否为真实元素
    if(isRealElement){
        const parentElement = element.parentNode;
        // console.log('parentElement', parentElement);
        const newElement = createElement(vnode);
        // console.log('newElement', newElement);
        parentElement.insertBefore(newElement, element.nextSibling);
        parentElement.removeChild(element);
        return newElement
    }else {
        // diff算法
    }
}

