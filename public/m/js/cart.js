$(function () {
    var leotao = new LeoTao();
    leotao.initPullRefresh();
    leotao.cartProductList();
    //商品编辑事件函数
    leotao.cartProductEdit();
    //购物车商品的删除函数
    leotao.deleteCartproduct();
    //计算总金额的函数
    leotao.getCount();
    //刷新页面
    leotao.refreshProduct();
});

var LeoTao = function () {

};

LeoTao.prototype = {
    page: 1,
    pageSize: 5,
    initPullRefresh: function () {
        var that = this;
        mui.init({
            pullRefresh: {
                container: "#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
                down: {
                    contentdown: "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                    contentover: "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                    contentrefresh: "正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                    //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
                    callback: function () {
                        setTimeout(function () {
                            that.page = 1;
                            $.ajax({
                                url: '/cart/queryCartPaging',
                                data: { page: that.page, pageSize: that.pageSize },
                                success: function (data) {
                                    //console.log(data);
                                    var html = template('productTem', data);
                                    $('#cartList .mui-table-view').html(html);
                                    // 下拉数据渲染完毕就调用结束下拉刷新的方法
                                    mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                                    //还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载 假如数据较多的话,那就不会默认触发一次自动上拉,也算不上bug
                                    mui('#refreshContainer').pullRefresh().refresh(true);
                                    $('#count .mui-pull-left span').html(0);
                                }
                            });
                        }, 1000)    
                    }
                },
                up: {
                    contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
                    contentnomore: '没有更多数据了',//可选，请求完毕若没有更多数据时显示的提醒内容；
                    //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
                    callback: function () {
                        setTimeout(function () {
                            that.page++;
                            $.ajax({
                                url: '/cart/queryCartPaging',
                                data: { page: that.page, pageSize: that.pageSize },
                                success: function (data) {
                                    //console.log(data);
                                    if (data instanceof Array == false && data.data.length > 0) {
                                        //调用模板生成html
                                        var html = template('productTem', data);
                                        $('#cartList .mui-table-view').append(html);
                                        // 上拉加载据渲染完毕就调用结束上拉加载更多的方法
                                        mui('#refreshContainer').pullRefresh().endPullupToRefresh(false);
                                    } else {
                                        // 结束上拉加载更多 并且提示没有更多数据
                                        mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                                    }
                                }
                            });
                        }, 1000)
                    }
                }
            }
        });
    },
    //页面一打开就显示购物数据 
    cartProductList: function () {
        $.ajax({
            url: '/cart/queryCartPaging',
            data: { page: this.page, pageSize: this.pageSize },
            success: function (data) {
                //console.log(data);
                var html = template('productTem', data);
                $('#cartList .mui-table-view').html(html);
            }
        });
    },
    //购物车商品 编辑 事件
    cartProductEdit: function () {
        $('#cartList .mui-table-view').on('tap', '.mui-slider-right .btn-edit', function () {
            //console.log(this);
            //获取当前事件的父元素li
            var li = this.parentNode.parentNode;
            //console.log(li);
            //  准备模需要的数据  通过自定义属性获取的
            var product = {
                //1.商品的所有尺码 
                productSize : $(this).parent().data('product-size'),
                //2.当前选择的尺码 
                size : $(this).parent().data('size'),
                //3.所有商品的数量 
                productNum: $(this).parent().data('productNum'),
                //4.当前选择的数量   
                num: $(this).parent().data('num'),
                //5.当前编辑的商品id  
                id: $(this).parent().data('id')
            };
            //console.log(product);
            var min = product.productSize.split('-')[0];
            var max = product.productSize.split('-')[1];
            var sizeArr = [];
            for(var i = min ; i <= max ; i++){
                sizeArr.push(parseInt(i));
            }
            product.productSize = sizeArr;
            //console.log(product);
             //调用编辑商品的模板 传入对应的数据
            var html = template('cartEdit',product);
            //把生成的html字符串去掉里面的回车和换行如果不去掉会变成br标签
            html = html.replace(/[\r\n]/g, "");
            mui.confirm(html, '编辑商品', ['确定', '取消'], function(e) {
                if(e.index == 0){
                    var size = $('.btn-size.active').data('size');
                    var num = mui('.mui-numbox').numbox().getValue();
                    //console.log(size);
                    $.ajax({
                        type:'post',
                        url:'/cart/updateCart',
                        data:{id:product.id,size:size,num:num},
                        success: function(data){
                            //console.log(data);
                            if(data.success){
                                mui.toast('编辑成功');
                                mui.swipeoutClose(li);
                                //把页面的尺码和数量变成编辑后的尺码和数量
                                $(li).find('.product-size span').html(size);
                                $(li).find('.product-num span').html(num);
                                //更改当前编辑按钮父元素div上的属性的值
                                $(li).find('.mui-slider-right').data('size',size);
                                $(li).find('.mui-slider-right').data('num',num);
                            }else{
                                window.location.href = "login.html?returnUrl=cart.html";
                            }                       
                        }
                    });   
                }else if( e.index == 1){
                    //在编辑取消的时候要把滑动列表收回 调用一个swipeoutClose方法实现关闭滑动效果
                    mui.swipeoutClose(li);
                }
            });
            mui('.mui-numbox').numbox();
            //让尺码支持点击 让确认框里面的尺码能点击
            $('.btn-size').on('tap', function() {
            // 给当前点击的尺码按钮添加active其他的删除
            $(this).addClass('active').siblings().removeClass('active');
            });
        });
    },
    //购物车商品删除事件 
    deleteCartproduct: function () {
        $('#cartList .mui-table-view').on('tap', '.btn-delete', function () {
            //console.log(this);
            var li = this.parentNode.parentNode;
           // console.log(li);
           var id = $(this).parent().data('id');
           //console.log(id);
           mui.confirm('你确定要删除该商品吗?','温馨提示',['确定','取消'],function(e){
                if(e.index == 0){
                    $.ajax({
                        url:"/cart/deleteCart",
                        data:{id:id},
                        success: function(data){
                            if(data.success){
                                mui.toast('删除成功');
                                //$(li).remove(); 两种写法一样的效果,前者是自杀,后者是父元素移除子元素
                                li.parentNode.removeChild(li);
                            }else{
                                window.location.href = "login.html?returnUrl=cart.html";
                            }
                        }
                    });
                }else{
                    mui.swipeoutClose(li);
                }
           });
           
            
        });
    },
    getCount: function(){
        $('#cartList .mui-table-view').on('change','input[type="checkbox"]',function(){
           //console.log(this);
           var checkboxs = $('input[type="checkbox"]:checked');
           //console.log(checkboxs);
           var sum = 0;
           checkboxs.each(function(index,ele){
               //console.log(ele);
               var price = $(ele).data('price');
               //console.log(price);
               var num = $(ele).data('num');
               var count = price * num;
               sum += count;
           })
            // 保留总金额位小数
            sum = sum.toFixed(2);
           $('#count .mui-pull-left span').html(sum);
        })
    },
    //点击刷新按钮,刷新页面
    refreshProduct: function () {
        $('.btn-refresh').on('tap', function () {
            mui('.mui-scroll-wrapper').pullRefresh().pulldownLoading();
        })
    }

}