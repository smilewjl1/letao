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
        //1.建立搜索点击事件
        $('.btn-search').on('tap',function(){
            //2.获取输入框的文本
            var search = $('.input-search').val();
            //console.log(search);
            //判断输入端内容是否为空,如果为空,结束函数.
            if(!search.trim()){
                alert('您输入的搜索内容为空');
                return;
            }
            //3.获取文本之后,清空输入框
            $('.input-search').val('');
            window.location.href = 'searchList.html?search='+search; 
            //4.将获取到的文本加上id并存入到searchObj中
            var searchObj = {
                id:1,
                search: search
            };
            //console.log(searchObj);
            //5.查询本地存储的historyList,因为id不能相同,否则会被覆盖
            var historyList = JSON.parse(localStorage.getItem('historyList')) || [];
            //6.判断historyList是否为空,若不为空,取其最后一个id,并让id+1;
            if(historyList.length > 0){
                searchObj.id = historyList[historyList.length - 1].id+1;
            }
            //7.将新增的searchObj添加到historyList中
            historyList.push(searchObj);
            //8.存储到本地的localstorage
            localStorage.setItem('historyList',JSON.stringify(historyList));
            //9.调用查询函数将其显示出来
            that.queryHistory();
        });
    },
    queryHistory: function(){
        //1.查询出本地存储的数据
        var historyList = JSON.parse(localStorage.getItem('historyList')) || [];
        //console.log(historyList);
        //2.反转数组,将最新的显示在最前面
        historyList = historyList.reverse();
        //调用模板将其显示出来
        var html = template('historyTem',{rows:historyList});
        $('.history .content ul').html(html);
    },
    removeHistory: function(){
        var that = this;
        //1.li里面的数据都是之后生成的,只能用事件委托到父元素身上
        $('.history .content ul').on('tap','.delete',function(){
            //console.log(this);
            //2.取出事件中的id
            var id = $(this).data('id');
            //console.log(id);
            //3.取出本地存储的数据,找到这一id对应的
            var historyList = JSON.parse(localStorage.getItem('historyList'));
            //4.遍历historyList找出对应的id
            for(var i = 0 ;i < historyList.length; i++){
                if(historyList[i].id == id){
                    historyList.splice(i,1);
                    //console.log(historyList);                 
                }
            }
            //5.将删除后的historyList修改到本地存储中
            localStorage.setItem('historyList',JSON.stringify(historyList));
            //console.log(JSON.parse(localStorage.getItem('historyList')));      
            //6.调用查询将其显示出来
            //console.log(this);此时对应的this是点击的触发事件元素
            that.queryHistory();          
        });
    },
    clearHistory: function(){
        var that = this;
        $('.title .btn-clear').on('tap',function(){
            //删除本地存储的localstorage的键
            localStorage.removeItem('historyList');
            that.queryHistory();
        });
    }
}