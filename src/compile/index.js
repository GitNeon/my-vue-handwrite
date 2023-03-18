/**
 * @Author: fanx
 * @Date: 2023年03月06日 18:18
 * @Description: 编译相关
 */
import { parseHTML } from "./parse.js";

// 匹配mustache， 例如{{ name }}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)}}/g;

// 文本节点的处理
export function genTextNode(text){

    // 如果不是{{ ... }}形式的内容，直接返回原文本
    if(!defaultTagRE.test(text)){
        return `'${text}'`
    }

    // 不断的去匹配当前字符串中含有{{...}}形式的内容
    defaultTagRE.lastIndex = 0;
    // 当前匹配结果
    let match;
    // 匹配结果的最后索引位置
    let lastIndex = 0;
    // 顺序放好文本内容
    const words = [];
    while(match  = defaultTagRE.exec(text)){
        console.log('match:', match)
        const index = match.index;

        if(index > lastIndex){
            words.push(`'${text.slice(lastIndex, index)}'`)
        }
        words.push(`_s('${match[1].trim()}')`);
        lastIndex = match.index + match[0].length;
    }
    if(lastIndex < text.length){
        words.push(`'${text.slice(lastIndex)}'`)
    }
    return `_v(${words.join('+')})`
}

// 生成children
export function genChildren(children){
    if(children && children.length){
        let result = ``;
        children.forEach((item) => {
            // 判断节点类型,元素类型：1， 文本类型：3
            const nodeType = item.type.toString();
            if(nodeType === '1'){
                result += ',' + genRenderCode(item);
            }else if(nodeType === '3'){
                result += ',' + genTextNode(item.content);
            }
        })
        return result;
    }
    return ''
}

// 将attrs属性转换成对象形式的props属性
export function genProps(attrs){
    const props = {};
    if(attrs && attrs.length){
        attrs.forEach((item) => {
            // 对style样式进行处理
            if(item.name === 'style'){
                const _list = item.value.split(';');
                if(_list.length){
                    let styleObj = {};
                    _list.forEach((s) => {
                        const _sList = s.split(':');
                        let key = _sList[0].trim();
                        let value = _sList[1].trim();
                        styleObj[key] = value;
                    })
                    item.value = styleObj;
                }
            }
            props[item.name] = item.value;
        })
    }
    return Object.keys(props).length > 0 ? JSON.stringify(props) : null;
}

/**
 * 生成render函数的执行代码
 * 实现的效果最终类似于vue的h函数
 * @param ast
 *
 * vue中的h函数 => h('div', { style: { color: 'red' }, '这是div文本' })
 * 第一个参数为标签名字，第二个参数为标签属性，第三个属性为子节点，子节点可以是一段文本内容，
 * 也可以是一个html元素节点
 *
 * 这里我们定义三个函数：
 *  1、_c -> 相当于h函数，用于渲染html
 *  2、_v -> 对文本进行处理，如果文本里有{{name}}这种取值语法，需要做解析处理
 *  3、_s -> 为JSON.stringify函数，对{{name}}中的变量进行处理
 */
export function genRenderCode(ast){
    // console.log('ast', ast);

    const tag = ast.tag;
    const props = genProps(ast.attrs);
    const children = genChildren(ast.children);

    let code =  `_c('${tag}', ${props} ${children})`;

    return code
}

// 将模板编译成render函数
export function compileToFunction(template) {
    // 解析成ast语法树
    const ast = parseHTML(template);
    const code = genRenderCode(ast);
    console.log(code);
    return ''
}
