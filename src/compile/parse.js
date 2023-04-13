// 标签名

const ncname = '[a-zA-Z_][\\-\\.0-9_a-zA-Z]*';
const qnameCapture = "((?:" + ncname + ":)?" + ncname + ")";

// 匹配 头标签的 前半部分。当字符串开头是 头标签时，可以匹配 例如 <div
const startTagOpen = new RegExp(("^<" + qnameCapture));

// 匹配 头标签的 右尖括号。当字符串开头是 > 时，可以匹配 例如： >
const startTagClose = /^\s*(\/?)>/;

// 匹配结束标签名， 例如 </div>, <br/>
const endTag = new RegExp(("^</" + qnameCapture + "[^>]*>"));

// 匹配标签上的属性。key="value"
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// 解析模板
export function parseHTML(html) {

    // 元素类型
    const ELEMENT_TYPE = 1;
    // 文本类型
    const TEXT_TYPE = 3;
    // 用于存放元素的栈
    const stack = [];
    // 当前父节点
    let currentParent;
    // 根节点
    let root;

    const creatASTObject = (tag, attrs) => {
        return {
            tag,
            attrs: attrs || [],
            parent: null,
            children: [],
            type: ELEMENT_TYPE
        }
    }

    // 开始内容
    const saveStart = (content) => {
        const { tagName, attrs } = content;
        const node = creatASTObject(tagName, attrs);
        // 如果没有根节点，那么就保存根节点
        if(!root){
            root = node;
        }
        // 下一次node的parent指向已保存的父节点
        if(currentParent){
            node.parent = currentParent;
            // 父节点的children要保存当前子节点
            currentParent.children.push(node);
        }
        // 保存当前父节点
        currentParent = node;
        // 栈中存放当前节点
        stack.push(node);
    }
    // 文本内容
    const saveText = (content) => {
        content = content.replace(/\s/g, '');
        if(content){
            currentParent.children.push({
                type: TEXT_TYPE,
                content,
                parent: currentParent
            })
        }
    }
    // 结束内容
    const saveEnd = (content) => {
        // 该标签已结束，出栈
        stack.pop();
        currentParent = stack[stack.length - 1];
    }

    // 当html被解析过时，不断减小字符串
    const advance = (length) => {
        html = html.substring(length);
    }

    // 解析开始标签
    const parseStartTag = () => {
        const start = html.match(startTagOpen);
        // 如果是开始标签
        if ( start ) {
            // 保存开始标签中的信息
            const tagInfo = {
                tagName: start[1],
                attrs: []
            };

            advance(start[0].length);
            // 处理属性
            let attr, end;
            // 当匹配到的是属性并且不是结束位置
            while ( !(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                tagInfo.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })

                advance(attr[0].length)
            }

            // 把结束标签的右尖角号删除
            if(end){
                advance(end[0].length)
            }

            return tagInfo;
        }
    }

    while (html) {
        let textEnd = html.indexOf('<');
        // 如果为0，说明是开始标签的尖角号<
        if ( textEnd === 0 && (!html.match(endTag))) {
            // 解析开始标签和属性
            const startTagResult = parseStartTag(html);
            saveStart(startTagResult)
            continue;
        }


        // 大于0，说明是文本
        if ( textEnd > 0 ) {
            // 获取文本内容
            const text = html.substring(0, textEnd);
            if(text){
                saveText(text)
            }
            advance(text.length);
        }

        // 如果是结束标签
        let tagEndMatch = html.match(endTag);
        if(tagEndMatch){
            saveEnd(tagEndMatch[0]);
            advance(tagEndMatch[0].length);
        }
    }

    return root;
}
