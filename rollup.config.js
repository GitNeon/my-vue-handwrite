/**
 * @Author: fanx
 * @Date: 2023年03月06日 10:37
 * @Description: rollup的配置文件
 */

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.vue.js',
        name: 'Vue',
        format: 'umd',
        sourcemap: true
    },
}
