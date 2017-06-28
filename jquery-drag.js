/*
 * Name: 拖拽插件
 * Time:2017/6/16
 * Author:JerryLee
 */

;(function($, window, document,undefined) {
    var DragAndDrop = function(ele,opt){
        this.$element = ele;
        this.defaults = {
            'dragAgain':true,      // 判断是否可以再次拖拽拖放框里面元素
            // 以下为辅助参数，不用修改
            'drop':'drop',
            'draggingTitle':'',
            'index':0,
            'dragging':false,
            'dragSelf':false,
            'itemId':'',
            'event': function () {
                return false;
            }
        };
        this.options = $.extend({}, this.defaults, opt);
    };

    DragAndDrop.prototype = {
        init: function (e) {
            this.initDrag();
            this.initHover();
        },
        // 初始化拖拽
        initDrag: function () {
            var self = this;
            $(self.$element).unbind('mousedown').bind('mousedown',function(e) {
                var e = e || window.event;
                if($(e.target).closest('.drag-item').length > 0) {
                    self.options.dragging = true;
                    self.mouseDownEvent(e);
                    $(document).bind('mousemove', function (e) {
                        if (self.options.dragging) {
                            self.mouseMoveEvent(e);
                            return false;
                        }
                    });
                    $(document).bind('mouseup', function (e) {
                        self.stopBubble(e);
                        if (self.judgeMouse(e, self.options.drop)) {
                            var drop_box = $('.'+self.options.drop).eq(self.options.index);
                            self.mouseUpEvent(e,'drop-in',drop_box);
                        }
                        self.options.dragging = false;
                        self.removeBind();
                        return false;
                    });
                }
                return false;
            });
        },
        // 初始化事件
        initEvent: function (drop_box) {
            var self = this;
            drop_box.find('.drop-item').hover(function(){
                $(this).find('.btn-remove').css('visibility','visible');
                if(drop_box.attr('data-btn')){
                    $(this).find('.btn-'+drop_box.attr('data-btn')).css('visibility','visible');
                }
            },function(){
                $(this).find('.btn-remove').css('visibility','hidden');
                if(drop_box.attr('data-btn')){
                    $(this).find('.btn-'+drop_box.attr('data-btn')).css('visibility','hidden');
                }
            });
            drop_box.find('.drop-item').unbind('mousedown').bind('mousedown',function(e) {
                var e = e || window.event;
                var target = e.target || e.srcElement;
                if($(target).hasClass('btn-remove')){
                    $(this).remove();
                    self.overDrop(drop_box);
                }else if(drop_box.attr('data-btn') && $(target).hasClass('btn-'+drop_box.attr('data-btn'))) {
                    self.options.event($(this));
                    return false;
                }else{
                    if(self.options.dragAgain){
                        $(this).remove();
                        self.overDrop(drop_box);
                        self.options.dragSelf = true;
                        self.mouseDownEvent(e);
                        $(document).bind('mousemove',function(e) {
                            if (self.options.dragSelf) {
                                self.mouseMoveEvent(e);
                                return false;
                            }
                        });
                        $(document).bind('mouseup',function(e) {
                            self.stopBubble(e);
                            if(self.judgeMouse(e,self.options.drop)){
                                var drop_box = $('.'+self.options.drop).eq(self.options.index);
                                self.mouseUpEvent(e,'drop-to',drop_box);
                            }else if($('#drop-to').length > 0){
                                var drop_box = $('#drop-to').parent();
                                self.mouseUpEvent(e,'drop-to',drop_box);
                            }
                            self.options.dragSelf = false;
                            self.removeBind();
                            return false;
                        });
                    }
                }
                return false;
            });
        },
        // 初始化hover事件
        initHover: function () {
            var self = this;
            $('.'+self.options.drop).hover(function(){
                var _this = $(this);
                if(_this.hasClass('drop-single')){
                    var item_length = _this.find('.drop-item').length;
                    if(item_length > 0){
                        var hasFlag = false;   // 判断是否已经有该item
                        for(var i=0;i<item_length;i++){
                            var text = _this.find('.drop-item').eq(i).find('.item-name').text();
                            if(text === self.options.draggingTitle){
                                hasFlag = true;
                            }
                        }
                        if(!hasFlag){
                            self.hoverEvent(_this);
                        }
                    }else{
                        self.hoverEvent(_this);
                    }
                }else{
                    self.hoverEvent(_this);
                }

            },function(){
                if($(this).hasClass('item-hover')){
                    $(this).removeClass('item-hover');
                }
                if($(this).find('#drop-in').length > 0){
                    $(this).find('#drop-in').remove();
                }
            });
        },
        // hover事件：mouseover
        hoverEvent: function (_this) {
            var self = this;
            if(self.options.dragging){
                if(!_this.hasClass('item-hover')){
                    _this.addClass('item-hover');
                }
                if ($('#drop-in').length === 0) {
                    _this.append('<div id="drop-in">' + self.options.draggingTitle + '</div>');
                }
            }else if(self.options.dragSelf){
                if(!_this.hasClass('item-hover')){
                    _this.addClass('item-hover');
                }
                if ($('#drop-to').length === 0) {
                    _this.append('<div id="drop-to">' + self.options.draggingTitle + '</div>');
                }else{
                    $('#drop-to').remove();
                    _this.append('<div id="drop-to">' + self.options.draggingTitle + '</div>');
                }
            }
        },
        // 阻止事件冒泡事件
        stopBubble: function (event) {
            if (event) {
                event.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
        },
        // mousedown之后事件
        mouseDownEvent: function (event) {
            var self = this;
            if($(event.target).hasClass('drag-item')){
                self.options.itemId = $(event.target).attr('id');
            }else{
                self.options.itemId = $(event.target).parents('.drag-item').attr('id');
            }
            self.options.draggingTitle = $(event.target).text();
            var drager = '<div id="dragging">'+self.options.draggingTitle+'</div>';
            $("body").append(drager);
            var oX = event.clientX+15;
            var oY = event.clientY;
            $("#dragging").css({"left":oX + "px", "top":oY + "px"});
        },
        // mousemove之后事件
        mouseMoveEvent: function (event) {
            var self = this;
            var e = event || window.event;
            var oX = e.clientX+15;
            var oY = e.clientY;
            $("#dragging").css({"left":oX + "px", "top":oY + "px"});

            if(self.judgeMouse(e,self.options.drop)) {
                var drop_box = $('.' + self.options.drop).eq(self.options.index);
                if (drop_box.hasClass('drop-single')) {
                    var item_length = drop_box.find('.drop-item').length;
                    if (item_length > 0) {
                        var hasFlag = false;   // 判断是否已经有该item
                        for (var i = 0; i < item_length; i++) {
                            var text = drop_box.find('.drop-item').eq(i).find('.item-name').text();
                            if (text === self.options.draggingTitle) {
                                hasFlag = true;
                            }
                        }
                        if (!hasFlag) {
                            self.itemJudge(e,drop_box);
                        }
                    } else {
                        self.itemJudge(e,drop_box);
                    }
                } else {
                    self.itemJudge(e,drop_box);
                }
            }
        },
        // mouseup之后事件
        mouseUpEvent: function (event,drop_item,drop_box) {
            var self = this;
            var e = event || window.event;
            if(drop_box.find('#'+drop_item).length > 0){
                drop_box.find('#'+drop_item).remove();
            }
            if(drop_box.hasClass('drop-single')){
                var item_length = drop_box.find('.drop-item').length;
                if(item_length > 0){
                    var hasFlag = false;   // 判断是否已经有该item
                    for(var i=0;i<item_length;i++){
                        var text = drop_box.find('.drop-item').eq(i).find('.item-name').text();
                        if(text === self.options.draggingTitle){
                            hasFlag = true;
                            if(drop_item === 'drop-to'){
                                var drop_return = $('#'+drop_item).parent();
                                $('#'+drop_item).remove();
                                self.addItem(e,drop_return);
                            }
                        }
                    }
                    if(!hasFlag){
                        self.addItem(e,drop_box);
                    }
                }else{
                    self.addItem(e,drop_box);
                }
            }else{
                self.addItem(e,drop_box);
            }
        },
        // 对hover的drop-in或者drop-to进行顺序判断并添加
        itemJudge: function (e,drop_box) {
            var self = this;
            var drop_In_Html = '<div id="drop-in">' + self.options.draggingTitle + '</div>';
            var drop_To_Html = '<div id="drop-to">' + self.options.draggingTitle + '</div>';
            var pos = self.itemPosition(e,'drop-item');
            if(pos === 0 || pos){
                if(pos === drop_box.find('.drop-item').length){
                    if(self.options.dragging) {
                        addHtml('drop-in',drop_In_Html,0);
                    }else if(self.options.dragSelf){
                        addHtml('drop-to',drop_To_Html,0);
                    }
                }else{
                    if(self.options.dragging) {
                        addHtml('drop-in',drop_In_Html,1);
                    }else if(self.options.dragSelf){
                        addHtml('drop-to',drop_To_Html,1);
                    }
                }
            }
            function addHtml(drop_style,drop_html,position){
                if(position === 0){
                    if ($('#'+drop_style).length === 0) {
                        drop_box.find('.drop-item').eq(pos - 1).after(drop_html);
                    } else {
                        $('#'+drop_style).remove();
                        drop_box.find('.drop-item').eq(pos - 1).after(drop_html);
                    }
                }else{
                    if ($('#'+drop_style).length === 0) {
                        drop_box.find('.drop-item').eq(pos).before(drop_html);
                    } else {
                        $('#'+drop_style).remove();
                        drop_box.find('.drop-item').eq(pos).before(drop_html);
                    }
                }
            }
        },
        // 添加drop-item
        addItem: function (e,drop_box) {
            var self = this;
            self.addItemJugde(e,drop_box);
            self.initEvent(drop_box);
            self.overDrop(drop_box);
        },
        // 对添加的drop-item进行顺序判断
        addItemJugde: function (e,drop_box) {
            var self = this;
            var title = '',button = '';
            if(drop_box.attr('data-title')){
                title = '(' + drop_box.attr('data-title') + ')';
            }else{
                title = '';
            }
            if(drop_box.attr('data-btn')){
                button = '<img class="btn-common btn-'+ drop_box.attr('data-btn') +'" src="button.png"/>'
            }else{
                button = '';
            }
            var drop_item = '<div class="drop-item">' +
                                '<input type="hidden" class="item-id" value="'+ self.options.itemId +'"/>' +
                                '<span class="item-name">'+self.options.draggingTitle+ title +'</span>' +
                                button + '<img class="btn-common btn-remove" src="close.png"/>' +
                            '</div>';

            var pos = self.itemPosition(e,'drop-item');
            if(pos === 0 || pos){
                if(pos === drop_box.find('.drop-item').length){
                    addItemHtml(drop_item,0);
                }else{
                    addItemHtml(drop_item,1);
                }
            }else{
                drop_box.append(drop_item);
            }
            function addItemHtml(drop_html,position){
                if(position === 0){
                    drop_box.find('.drop-item').eq(pos-1).after(drop_html);
                }else{
                    drop_box.find('.drop-item').eq(pos).before(drop_html);
                }
            }
        },
        // 判断是否超出拖放框
        overDrop: function (drop_box) {
            var drop_length = drop_box.find('.drop-item').length;
            var drop_width = 0;
            var drop_box_width = drop_box.width();
            for(var i=0;i<drop_length;i++){
                drop_width += drop_box.find('.drop-item').eq(i).outerWidth(true);
            }
            if(drop_width > drop_box_width){
                drop_box.bind('mouseover',function(){
                    $(this).addClass('overDrop');
                });
                drop_box.bind('mouseout',function(){
                    $(this).removeClass('overDrop');
                });
            }else{
                drop_box.unbind('mouseover').unbind('mouseout');
                drop_box.removeClass('overDrop');
            }
        },
        // 解除鼠标绑定
        removeBind: function () {
            $("#dragging").remove();
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
        },
        // 判断鼠标是否在所选框内
        judgeMouse: function (event,cls) {
            var coord = this.getMousePos(event);
            var target = $('.'+cls);
            for(var i=0;i<target.length;i++){
                var targetX_left = this.getLeft(target[i]),
                    targetY_top = this.getTop(target[i]),
                    targetX_right = this.getLeft(target[i]) + target[i].offsetWidth,
                    targetY_bottom = this.getTop(target[i]) + target[i].offsetHeight;
                if(coord.x>=targetX_left && coord.x<=targetX_right && coord.y>=targetY_top && coord.y<=targetY_bottom){
                    this.options.index = i;
                    return true;
                }
            }
            return false;
        },
        // 根据鼠标位置定顺序
        itemPosition: function (event,cls) {
            var coord = this.getMousePos(event);
            var target = $('.drop').eq(this.options.index).find('.'+cls);
            for(var i=0;i<target.length;i++){
                var targetX_left = this.getLeft(target[i]),
                    targetY_top = this.getTop(target[i]),
                    targetX_right = this.getLeft(target[i]) + target[i].offsetWidth,
                    targetY_bottom = this.getTop(target[i]) + target[i].offsetHeight,
                    targetX_center = this.getLeft(target[i]) + target[i].offsetWidth * 0.5;
                if(coord.x>=targetX_left+3 && coord.x<=targetX_center && coord.y>=targetY_top+4 && coord.y<=targetY_bottom+4){
                    return i;
                }else if(coord.x>=targetX_center && coord.x<=targetX_right+3 && coord.y>=targetY_top+4 && coord.y<=targetY_bottom+4){
                    return i+1;
                }
            }
            return false;
        },
        // 获取鼠标位置
        getMousePos: function (e) {
            var e = e || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return { 'x': x, 'y': y };
        },
        //获取元素的纵坐标（相对于窗口）
        getTop: function (e) {
            var offset=e.offsetTop;
            if(e.offsetParent!=null) offset+=this.getTop(e.offsetParent);
            return offset;
        },
        //获取元素的横坐标（相对于窗口）
        getLeft: function (e) {
            var offset=e.offsetLeft;
            if(e.offsetParent!=null) offset+=this.getLeft(e.offsetParent);
            return offset;
        }
    };

    $.fn.drag = function(options){
        var dragAndDrop = new DragAndDrop(this,options);
        return dragAndDrop.init();
    }
})(jQuery, window, document);
