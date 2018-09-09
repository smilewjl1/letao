$(function(){
    var leotao = new LeoTao();
    //leotao.initSide();
    //从url地址栏获取传递过来的id
    leotao.id = leotao.getQueryString('id');
    //根据传过来的id,获取商品详情
    leotao.getproductDetail();
    //加入购物车事件
    leotao.addCart();
});

var LeoTao = function(){

};
LeoTao.prototype = {
    initSide : function(){
        var gallery = mui('.mui-slider');
        gallery.slider({
            interval:1000//自动轮播周期，若为0则不自动播放，默认为0；
        });
    },
    //获取url传递过来的id
     getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    },
    //通过id查询出商品信息
    getproductDetail: function(){
        //console.log(this.id);
        var that = this;
        $.ajax({
            url:'/product/queryProductDetail',
            data:{ id : that.id },
            success: function(data){
               // console.log(data);
               var slideHtml = template('slideTem',data);
               $('#slide').html(slideHtml);
               //重新调用初始化轮播图的方法
               that.initSide();
               //把尺码分割成数组
               var min = data.size.split('-')[0];
               //console.log(min);
               var max = data.size.split('-')[1];
               var sizeArr = [];
               //循环遍历生成数组
               for(var i = min; i <= max ; i++){
                    sizeArr.push(parseInt(i));
               }
               //把生成的数组替换data里面的size
               data.size = sizeArr;
               var html = template('productTem',data);
               $('.product').html(html);
               //数字输入框也无法点击,因为是动态生成,所以需要初始化
               mui('.mui-numbox').numbox();
               //让尺码支持点击
               $('.btn-size').on('tap',function(){
                    $(this).addClass('active').siblings().removeClass('active');
               });
            }
        });
        
    },
    //点击加入购物车事件
    addCart: function(){
        var that = this;
        $('.btn-add-cart').on('tap',function(){
           //console.log(this);
           //获取当前选择的尺码
            var size = $('.btn-size.active').data('size');
            //console.log(size);
            //判断用户是否选择了尺码
            if(!size){
                mui.toast('请选择尺码',{ duration:'2000', type:'div' });
                return false;
            }
            //获取当前选择的数量
            var num = mui('.mui-numbox').numbox().getValue();
            //console.log(num);
            if(!num){
                mui.toast('请选择数量',{ duration:'2000', type:'div' });
                return false;
            }
            //发送请求
            $.ajax({
                url:'/cart/addCart',
                type:'post',
                data:{productId:that.id,size:size,num:num},
                success: function(data){
                   console.log(data);
                   if(data.error){
                        window.location.href = 'login.html?returnUrl=detail.html?id='+that.id;
                   }else{
                        mui.confirm('商品添加成功,要去购物车查看吗?','温馨提示',['确认','取消'],function(e){
                            if(e.index == 0){
                                window.location.href = "cart.html";
                            }else if(e.index == 1){
                                mui.toast('你可以查看更多商品,或者去购物车购买当前已添加商品',{ duration:'2000', type:'div' });
                            }
                        });
                   }
                }
            });
        });
    }
}