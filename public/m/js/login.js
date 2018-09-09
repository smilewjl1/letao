$(function(){
    var leotao = new LeoTao();
    leotao.login();
});

var LeoTao = function(){};
LeoTao.prototype = {
    //登录函数
    login: function(){
        var that = this;
        //登录按钮的点击事件
        $('.btn-login').on('tap',function(){
            //console.log(this);
            //获取用户名文本
            var username = $('.username').val();
            //获取密码输入文本
            var password = $('.password').val();
            //判断输入框内容是否为空
            var check = true;
            mui(".mui-input-group input").each(function() {
                //若当前input为空，则alert提醒 
                if(!this.value || this.value.trim() == "") {
                    var label = this.previousElementSibling;
                    mui.toast("请输入" + label.innerText,{ duration:2000, type:'div' }) 
                    check = false;
                    return false;
                }
            }); //校验通过，继续执行业务逻辑 
            if(check){
                $.ajax({
                    type: 'post',
                    url: '/user/login',
                    data: { username: username, password: password },
                    success: function(data) {
                        if (data.error) {
                            mui.toast(data.message, { duration: 2000, type: 'div' });
                        } else {
                            //  否则就表示登录成功 返回上一页 但是如果上一页是注册返回首页
                            var returnUrl = that.getQueryString('returnUrl');
                            //console.log(returnUrl);
                            // 12. 返回到returnUrl这个页面
                            window.location.href = returnUrl;
                        }
                    }
                })
            }
        });
    },
      //专门获取地址栏参数的方法
      getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }
}