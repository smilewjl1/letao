$(function(){
    var leotao = new LeoTao();
    leotao.initScroll();
    leotao.getLeftcate();
    leotao.getBrand();
    leotao.getBrandData(1);
});

var LeoTao = function(){

};
LeoTao.prototype = {
    initScroll: function(){
        mui('.mui-scroll-wrapper').scroll({
            scrollY: true, //是否竖向滚动
            scrollX: false, //是否横向滚动
            startX: 0, //初始化时滚动至x
            startY: 0, //初始化时滚动至y
            indicators: true, //是否显示滚动条
            deceleration:0.0006, //阻尼系数,系数越小滑动越灵敏
            bounce: true //是否启用回弹
        });
    },
    //获取左侧分类列表
    getLeftcate: function(){
        $.ajax({
            url:'/category/queryTopCategory',
            success:function(data){
               // console.log(data);
               var html = template('cateLeft',data);
               //console.log(html);              
               $('.cate-left ul').html(html);
            }
        });
    },
    //事件委托左侧的列表点击事件
    getBrand: function(){
        var that = this;
        $('.cate-left ul').on('click','li a',function(){
            var id = $(this).data('id');
            //console.log(id);
            that.getBrandData(id);
            $(this).parent().addClass('active').siblings().removeClass('active');
        })
    },
    //获取品牌列表数据
    getBrandData: function(id){
        $.ajax({
            url:'/category/querySecondCategory',
            data:{ id:id},
            success:function(data){
               // console.log(data);
               var html = template('cateRight',data);
               //console.log(html);              
               $('.cate-right .mui-row').html(html);
            }
        });
    }
}