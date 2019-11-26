/**
 * better滚动条使用，横向滚动计算总宽度
 *
 * @param dom 要计算的dom（用$refs选中）
 * @param extraWidth 列表子项额外宽度，default=0 如：margin-right:6px; 则传6
 * @returns {number} dom总宽度
 */
global.$getChildrenWidth = function (dom,extraWidth=0) {

    var children = dom.children;
    var childrenWidth = 0;
    for (let i = 0; i < children.length; i++) {
        childrenWidth += children[i].offsetWidth + extraWidth;
    }
    return childrenWidth;
}