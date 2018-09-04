$(function(){
    var leotao = new LeoTao();
    leotao.addHistory();
    leotao.queryHistory();
    leotao.removeHistory();
    leotao.clearHistory();
});

var LeoTao = function(){

};
LeoTao.prototype = {
    addHistory: function(){
        var that = this;
        $('.btn-search').on('tap',function(){
            //1.获取到输入框文本
            var search = $('.input-search').val();
            //2.获取文本之后清空输入框
            $('.input-search').val('');
            //console.log(search);
            //3.判断输入内容是否为空,为空结束
            if(!search.trim()){
                alert('请输入你想搜索的商品');
                return;
            }
            //window.location.href = LeoTao.SEARCH_LIST_URL+'?'+'search='+search;
            //4.指定一个存储的id
            var id = 1;
            var searchObj = {
                id : id,
                search : search
            };
            //console.log(searchObj);
            var historyList = JSON.parse(localStorage.getItem('historyList')) || [];
            //5.判断数组长度是否大于0
            if(historyList.length > 0){
                searchObj.id = historyList[historyList.length -1].id+1;
            }
             //最多存储10条
             if(historyList.length > 9){
                historyList.splice(0,historyList.length-9);
            }
            //6.把当前的搜索记录添加到historyList
            historyList.push(searchObj);
            //7.存储到本地存储
            localStorage.setItem('historyList',JSON.stringify(historyList));
            //8.调用查询方法添加当前搜索内容
            that.queryHistory();
        });
    },
    //查询搜索历史,并将其显示出来
    queryHistory: function(){
        //1.获取本地存储的localstorage
        var historyList = JSON.parse(localStorage.getItem('historyList')) || [];
        //2.反转数组
        historyList = historyList.reverse();
        // 2. 调用模板生成html
        var html = template('historyTem',{'rows':historyList});
        $('.history .content ul').html(html);
         /*最多记录10条*/
    },
    //删除搜索历史
    removeHistory: function(){
        var that = this;
        $('.history .content ul').on('tap','.delete',function(){
            var id = $(this).data('id');
            //console.log(id);
            var historyList = JSON.parse(localStorage.getItem('historyList'));
            //循环遍历数组
            for(var i = 0 ; i < historyList.length ; i++){
                if(historyList[i].id == id){
                    historyList.splice(i,1);
                }
            }
            localStorage.setItem('historyList',JSON.stringify(historyList));
			//删除后如果需要刷新列表 调用查询方法
			that.queryHistory();
        });
    },
    clearHistory: function(){
        var that = this;
        $('.btn-clear').on('tap',function(){
            localStorage.removeItem('historyList');
			// 清空完成调用查询刷新页面
			that.queryHistory();
        })
    }
}