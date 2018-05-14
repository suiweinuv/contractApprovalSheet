//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    title:"请审核！",
    contract_id:"",
    isNew:true,
    date:'',
    contract_name:'',
    contract_num :"",
    contract_a: "",
    contract_b: "",
    contract_b_qualification: "",
    contract_amount: "",
    department: "",
    zuqi: "",
    unit_price: "",
    payment_method: "",
    rent_free_period: "",
    decoration_period :"",
    contract_remark :"",
    nidingren  :"",
    button_url:"",
    submit_url:"",
    notice:"暂无审批单！",
    
    reason:false,
    reason_value:"",

    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    var that =this;

    wx.login({
      success:function(res){
        wx.getUserInfo({
          success:function(userInfo){
            console.log(res);
            console.log(userInfo);
            wx.request({
              url: 'https://louqibang.com/wx/getOpenId',
              method:"get",
              data: {
                code:res.code
              },
              success:function(result){
                console.log(result.data);
                that.setData({
                  reason:false
                })
                if (result.data.msg == "oPyfW5aqS27TCzhLhZU02Vb9FGyU") {
                 // 金花,总经理
                  that.setData({
                    button_url: "https://louqibang.com/wx/generalManagerConfirm",
                    submit_url: "https://louqibang.com/wx/generalSubmitConfirm"
                  })
                  that.getRecently('https://louqibang.com/wx/getGeneralManagerContractApprovalSheetDetailRecently');

                } else if (result.data.msg == "oPyfW5e97zGm7YV7z92UtHHxSTQ4") {
                  //隋伟，部门经理
                  that.setData({
                    button_url:"https://louqibang.com/wx/departmentManagerConfirm",
                    submit_url:"https://louqibang.com/wx/departmentSubmitConfirm",
                  })
                  that.getRecently('https://louqibang.com/wx/getDepartmentManagerContractApprovalSheetDetailRecently');
                 

                }else{
                  that.setData({
                    button_url: "https://louqibang.com/wx/departmentManagerConfirm",
                    submit_url: "https://louqibang.com/wx/departmentSubmitConfirm"
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  agree:function(e){
    var that = this;
    wx.showModal({
      title: '同意确认',
      content: '提交后不可修改',
      success: function (res) {
        if (res.confirm) {
          this.buttonClick(this.data.button_url, "1")
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
    
  },
  disagree:function(){
    this.setData({
      reason:true
    })
  },

  bindFormSubmit:function(e){
    var that =this
    this.setData({
      reason_value: e.detail.value.reason
    })
    console.log(e.detail.value.reason) 
    wx.request({  
      url: this.data.submit_url + '?contract_id=' + this.data.contract_id + "&&code=-1&&reason="+this.data.reason_value,
      data: {},
      method: "get",
      success: function (result) {
        wx.showToast({
          title: '审核成功',
          icon: 'success',
          duration: 2000

        })
        that.onLoad();


      }
    })
  },
  buttonClick:function(url,code){
   
    var that =this;
      wx.request({
        url: url+'?contract_id='+that.data.contract_id+"&&code="+code,
        data:{},
        method:"get",
        success:function(result){
          wx.showToast({
            title: '审核成功',
            icon: 'success',
            duration: 2000

          })
          that.onLoad();
         

        }
      })
  },
  getRecently:function(url){
    var that = this;
    wx.request({
    url:url,
    data: {},
    success: function (res) {


      if (res.data.data) {

        that.setData({
          isNew: true,

          contract_id: res.data.data.approvalSheet.contract_id,
          date: res.data.data.approvalSheet.create_time,
          contract_name: res.data.data.approvalSheet.contract_name,
          contract_num: res.data.data.contract_num,
          contract_a: res.data.data.letter.name,
          contract_b: res.data.data.tenantry.name,
          contract_b_qualification: res.data.data.approvalSheet.contract_b_qualification,
          contract_amount: res.data.data.rent_all_Chinese + "元整(￥" + res.data.data.rent_all + ")",
          department: res.data.data.approvalSheet.department,
          zuqi: res.data.data.approvalSheet.zuqi,
          unit_price: res.data.data.price + "元/天·㎡",
          payment_method: "押" + res.data.data.payType1 + "付" + res.data.data.payType2,
          rent_free_period: res.data.data.approvalSheet.rent_free_period,
          decoration_period: res.data.data.approvalSheet.decoration_period,
          contract_remark: res.data.data.approvalSheet.contract_remark,
          nidingren: res.data.data.approvalSheet.nidingren,

        })
      } else {
        that.setData({
          isNew: false
        })
      }
    }

  })
  },
  onPullDownRefresh:function(){
    
    this.onLoad();
    wx.stopPullDownRefresh();
  }
 
})
