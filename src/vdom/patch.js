/**
 * @Author: fanx
 * @Date: 2023年04月12日 16:10
 * @Description: file content
 */
import { createElement } from "./index.js";

// 设置标签的属性
export function patchProps(element, oldProps, newProps) {

    let oldStyles = oldProps.style || {};
    let newStyles = newProps.style || {};

    // 老的样式中有，新的样式中没有，则删除这个样式
    for (let key in oldStyles) {
        if(!newStyles[key]) {
            element.style[key] = '';
        }
    }
    // 老的属性中有，新的没有，则删除这个属性
    for (let key in oldProps) {
        if(!newProps[key]){
            element.removeAttribute(key);
        }
    }

    // 如果新的属性中有style，就覆盖老的
    for (let key in newProps){
        if(key === 'style'){
            for(let styleName in newProps.style){
                element.style[styleName] = newProps.style[styleName]
            }
        } else {
            element.setAttribute(key, newProps[key]);
        }

    }
}

// 更新节点信息
// element: 真实节点元素
// vnode: 虚拟DOM元素
export function patch(element, vnode){
    const oldVnode = element;
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
        /**
         * diff算法比较规则：
         * 1.比较两个节点是不是一样，如果不一样，直接删除老的，插入新的
         * 2.如果两个节点一样(标签名和key一样)，比较他们的属性是否有差异，更新差异的属性
         *   这里仍然是复用旧节点，只是更新属性
         *  3.节点比较完比较他们的儿子，看看儿子节点是什么情况
         */
        console.log('走到了diff算法：',oldVnode, vnode)
        patchVnode(oldVnode, vnode);
    }
}

export function patchVnode(oldVnode, vnode) {
    // 如果不是同一个节点
    if(!isSameVNode(oldVnode, vnode)) {
        // const newNode = createElement(vnode);
        // const oldNode = oldVnode.realElement;
        oldVnode.realElement.parentNode.replaceChild(createElement(vnode), oldVnode.realElement)
    } else {
        // 是相同节点
        // 复用节点
        let el = vnode.realElement = oldVnode.realElement;

        // 是文本,比较文本是否一致
        if(!oldVnode.tag) {
            if(oldVnode.text !== vnode.text) {
                el.textContent = vnode.text;
            }
        } else {
            // 是标签
            patchProps(vnode.realElement, oldVnode.data, vnode.data);

            // 比较儿子节点
            // 有两种情况： 两方都有儿子节点，只有一方有儿子节点
            let oldChildren = oldVnode.children || [];
            let newChildren = vnode.children || [];
            // 两方都有
            if(oldChildren.length > 0 && newChildren.length > 0){
                //完整diff算法
                updateChildren(el, oldChildren, newChildren);
            }else if(newChildren.length > 0){
                // 新的有，要挂载新的节点
                mountChildren(el, newChildren)
            }else if(oldChildren.length > 0) {
                // 老的有，新的没有，则需要移除旧节点
                unMountChildren(el, oldChildren);
            }
        }
        return el;
    }
}

export function unMountChildren(el, oldChildren) {
    // 注意这里从尾部进行删除，防止数组变动导致索引不对
    for (let i = oldChildren.length - 1; i >= 0; i--) {
        el.removeChild(oldChildren[i].realElement);
    }
}

export function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElement(child));
    }
}

export function updateChildren(el, oldChildren, newChildren) {
    console.log('---updateChildren---', oldChildren, newChildren);

    // 采用双指针的办法进行两两比较
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0];

    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    const map = makeIndexByKey(oldChildren);

    // 针对一些场景进行优化判断
    // 采用双指针算法实现
    // 当起始指针小于终止指针时，循环判断
    while (oldStartIndex < oldEndIndex && newStartIndex <= newEndIndex) {
        if(!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        }else if(!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
            // 头比较 如果是相同节点
        }else if(isSameVNode(oldStartVnode, newStartVnode)) {
            // 递归比较子节点
            patchVnode(oldStartVnode, newStartVnode)
            // 比较完移动到下一个节点
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVNode(oldEndVnode, newEndVnode)){
            // 尾比较 如果是相同节点
            // 递归比较子节点
            patchVnode(oldEndVnode, newEndVnode)
            // 比较完移动到下一个节点
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else if(isSameVNode(oldEndVnode, newStartVnode)) {
           // 交叉比对,如果老的最后一个节点和新的开头节点一样，那么就把老的节点插入到开头去
           patchVnode(oldEndVnode, newStartVnode);
           el.insertBefore(oldEndVnode.realElement, oldStartVnode.realElement);
           // 老的指针往前移动
           oldEndVnode = oldChildren[--oldEndIndex];
           // 新的往后移动
           newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVNode(oldStartVnode, newEndVnode)) {
            // 交叉比对
            patchVnode(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.realElement, oldEndVnode.realElement.nextSibling);
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else {
            // 乱序比对
            // 根据老的做一个映射关系表,用新的去找，找到则移动,找不到则添加
            // 最后多余的则删除
            let moveIndex = map[newStartVnode.key];
            // 找到对应的节点，则复用
            if(moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex];
                el.insertBefore(moveVnode.realElement, oldStartVnode.realElement);
                oldChildren[moveIndex] = undefined; // 表示节点移走了
                patchVnode(moveVnode, newStartVnode);
            }else {
                el.insertBefore(createElement(newStartVnode), oldStartVnode.realElement);
            }

            newStartVnode = newChildren[++newStartIndex];
        }
    }

    // 插入新节点
    if(newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex ; i++) {
            let childEl = createElement(newChildren[i]);
            // 判断是在前面追加还是后面追加
            let anchor = newChildren[newEndIndex + 1] ?
              newChildren[newEndIndex + 1].realElement : null;
            el.insertBefore(childEl, anchor);
        }
    }

    // 移除旧节点
    if(oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex ; i++) {
            let childEl = oldChildren[i].realElement;
            if(oldChildren[i]) {
                let childEl = oldChildren[i].realElement;
                el.removeChild(childEl);
            }
        }
    }

}

export function isSameVNode(vnode1, vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}

// 生成映射表
function makeIndexByKey(children) {
    const map = {};
    children.forEach((child, index) => {
        map[child.key] = index;
    })
    return map;
}
