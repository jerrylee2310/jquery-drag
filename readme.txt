拖拽插件说明
    本插件经过测试，可兼容ie8下面的iframe引入，不兼容ie7以下版本浏览器，慎用！
    css: drag.css
    js: jquery-drag.js

    调用：
        调用之前必须先引入jquery源代码文件，本插件基于jquery插件开发
        $(selector).drag();

    格式：
        <ul class="drap-tree">
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目1</a></li>
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目2</a></li>
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目3</a></li>
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目4</a></li>
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目5</a></li>
            <li class="drap-item"><a href="javascript:void(0);">拖拽项目6</a></li>
        </ul>
        <div class="box">
            <div class="drop"></div>
            <div class="drop"></div>
            <div class="drop"></div>
            <div class="drop"></div>
        </div>

        $('.drap-tree').drag();

    注意：
        1. drag-item为拖拽项目，drop为拖放框
        2. 格式为例子，可以修改格式，只要selector里面含有drag-item即可拖拽该item项目
        3. 一般为可重复添加同个标签，往drop拖放框加入类drop-single，该拖放框不可重复添加同个标签
        4. 一般可以在拖放框中再次拖拽元素，如果设置dragAgain为false，则不可再次拖拽元素，如下引用：
            $(selector).drag({dragAgain:false});
        5.往drop-item增加data-title属性，可在拖拽标题后面加上（title），其中title为data-title设置的值。
        6.往drop-item增加data-btn属性，可在拖拽标题后面加上按钮，再在初始化的时候规定事件，例如：
            $('.drap-tree').drag({
                event: function () {
                    console.log(this.itemId);
                }
            });
        7.有data-btn属性的拖放框内点击拖拽元素会有callback函数，如
            $('.drap-tree').drag({
                callback: function () {
                    console.log(1);
                }
            });