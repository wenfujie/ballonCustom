import Vue from 'vue'

//  两位小数过滤器
Vue.filter('Fix2', function (value) {
    value = Number(value);
    return value.toFixed(2);
});

// 金额分隔 1500 =》 1,500
Vue.filter('$goldDivide', function (value) {
    if (value) {
        return Number(value).toLocaleString();
    }
    return value;
});
