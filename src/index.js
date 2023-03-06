/**
 * @Author: fanx
 * @Date: 2023年03月06日 11:28
 * @Description: vue
 */
import { initMixin } from "./init";

function Vue(options) {
    this._init(options)
}

initMixin(Vue);

export default Vue;
