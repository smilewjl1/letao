$(function () {
    var leotao = new LeoTao();
    leotao.search = leotao.getQueryString('search');
    leotao.searchListLoop();
    leotao.searchProductList();
    leotao.initPulldownupRefresh();
    //根据URL来获取数据
    leotao.getProductList();
    //商品排序的功能函数
    leotao.productListSort();
    leotao.productBuy();
});

var LeoTao = function () {

};

LeoTao.prototype = {
    //全局保存这个搜索的内容
    search: '',
    //定义全局的页数变量
    page: 1,
    //定义全局的没页大小的变量
    pageSize: 2,
    searchListLoop: function () {
        mui('.mui-scroll-wrapper').scroll({
            scrollY: true, //是否竖向滚动
            scrollX: false, //是否横向滚动
            startX: 0, //初始化时滚动至x
            startY: 0, //初始化时滚动至y
            indicators: true, //是否显示滚动条
            deceleration: 0.0006, //阻尼系数,系数越小滑动越灵敏
            bounce: true //是否启用回弹
        });
    },
    searchProductList: function () {
        var that = this;
        $('.btn-search').on('tap', function () {
            //1.获取输入框的文本
            //console.log(this);
            that.search = $('.input-search').val();
            //console.log(search);  
            //2.判断输入框内容是否为空,为空就return
            if (!that.search.trim()) {
                alert('输入内容不能为空');
                //return false 不仅可以结束当前事件,带上false还能阻止当前事件
                return false;
            }
            //3.不为空,发送请求获取数据
            //4. 搜索前要重置page,不然如果当前已经没有更多数据了,会造成搜索不到商品
            that.page = 1;
            $.ajax({
                url: '/product/queryProduct',
                data: { page: that.page, pageSize: that.pageSize, proName: that.search },
                success: function (data) {
                    //console.log(data);
                    var html = template('productListTem', data);
                    $('.product .mui-row').html(html);
                    //还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载,不重置会造成,当上拉到底后,在搜索会一直显示当前没有更多商品
                    mui('#refreshContainer').pullRefresh().refresh(true);
                }
            });

        });
    },
    initPulldownupRefresh: function () {
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
                                url: '/product/queryProduct',
                                data: { page: that.page, pageSize: that.pageSize, proName: that.search },
                                success: function (data) {
                                    var html = template('productListTem', data);
                                    $('.product .mui-row').html(html);
                                    // 下拉数据渲染完毕就调用结束下拉刷新的方法
                                    mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                                    //还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载
                                    mui('#refreshContainer').pullRefresh().refresh(true);
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
                                url: '/product/queryProduct',
                                data: { page: that.page, pageSize: that.pageSize, proName: that.search },
                                success: function (data) {
                                    // 判断当前data.data是否有数据 如果有数据就渲染模板 如果没有数据提示没有更多数据了
                                    if (data.data.length > 0) {
                                        //调用模板生成html
                                        var html = template('productListTem', data);
                                        $('.product .mui-row').append(html);
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
    //根据url搜索的内容调用api刷新页面
    getProductList: function () {
        var that = this;
        //将通过URL传递过来的数据显示在输入框
        $('.input-search').val(that.search);
        // 搜索前要重置page=1
        that.page = 1;
        // 1. 发送请求请求商品列表数据
        $.ajax({
            url: '/product/queryProduct',
            //注意由于API必须传入page和pageSize 如果不传黑窗会挂掉 重新开启
            data: { page: that.page, pageSize: that.pageSize, proName: that.search },
            success: function (data) {
                var html = template('productListTem', data);
                $('.product .mui-row').html(html);
                // 还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载
                mui('#refreshContainer').pullRefresh().refresh(true);
            }
        });
    },
    //专门获取地址栏参数的方法
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    },
    productListSort: function () {
        var that = this;
        //价格和销量的点击事件
        $('.mui-scroll .title a').on('tap', function () {
            //console.log(this);
            //获取当前点击的a的数据类型,价格还是销量
            var sortType = $(this).data('sort-type');
            //获取当前a的排序顺序类型,升序还是倒序
            var sort = $(this).data('sort');
            //根据sort数据,将升序变为倒序,将倒序变为升序
            if (sort == 1) {
                sort = 2;
            } else {
                sort = 1;
            }
            that.page = 1;
            //  更新当前a排序的顺序
            $(this).data('sort', sort);
            // 判断当前的排序的方式 如果是价格 就调用api传入价格排序  如果是数量调用api传入数量的排序
            if (sortType == 'price') {
                // 发送请求请求商品列表数据
                $.ajax({
                    url: '/product/queryProduct',
                    //传入当前的价格排序 并且排序的顺序为当前sort
                    data: { page: that.page, pageSize: that.pageSize, proName: that.search, price: sort },
                    success: function (data) {
                        var html = template('productListTem', data);
                        $('.product .mui-row').html(html);
                        // 还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载
                        mui('#refreshContainer').pullRefresh().refresh(true);
                    }
                });
            } else {
                $.ajax({
                    url: '/product/queryProduct',
                    //传入当前的数量排序 并且排序的顺序为当前sort
                    data: { page: that.page, pageSize: that.pageSize, proName: that.search, num: sort },
                    success: function (data) {
                        var html = template('productListTem', data);
                        $('.product .mui-row').html(html);
                        // 还要重置上拉加载更多 重置的时候会默认自动触发一次上拉加载
                        mui('#refreshContainer').pullRefresh().refresh(true);
                    }
                });
            }

        })
    },
    //点击立即购买事件
    productBuy: function () {
        $('.product .mui-row').on('tap', '.btn-buy', function () {
            //console.log(this);  
            var id = $(this).data('id');
            //console.log(id);
            //跳转到商品详情页面,并将id传过去
            window.location.href = "detail.html?id=" + id;
        })
    }
}