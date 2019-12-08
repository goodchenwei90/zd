<template>
  <div class="user-wrapper">
    <div class="content-box">
      <div v-if="!loginFlag" style="padding-right: 20px;color: #FFF;cursor: pointer">
        <div>
          <span @click="setModalVisible(true)" style="padding-right:10px">登录</span> |
          <span style="padding-left:10px" @click="setRegisterVisible(true)">注册</span>
          <checklogin></checklogin>
        </div>


      </div>
      <div v-else>
        <a-dropdown>
          <span class="action ant-dropdown-link user-dropdown-menu">
            <a-avatar v-if="userInfo().logo" class="avatar" size="small" :src="userInfo().logo" />
            <a-avatar v-else class="avatar" size="small" icon="user" />
            <span style="color:white">{{ userInfo().name}}{{viewExpr}}</span>
            <span  style="color:red" v-if="xufei" @click="() => moneycollect(true)">&nbsp;&nbsp;已到期，点击续费</span>
          </span>
          <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
            <a-menu-item key="0" @click="() => setuppwdvisible(true)">
              <a-icon type="user" />
              <span>修改密码</span>
            </a-menu-item>
            <a-menu-item key="0" @click="() => moneycollect(true)">
              <a-icon type="money-collect" />
              <span>续费充值</span>
            </a-menu-item>

            <a-menu-item key="0" @click="() => payListVisible(true)">
                <a-icon type="safety" />
                <span>支付记录</span>
              </a-menu-item>

            <a-menu-divider />
            <a-menu-item key="3">
              <a href="javascript:;" @click="handleLogout">
                <a-icon type="logout" />
                <span>退出登录</span>
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>

      </div>

    </div>

    <div>
      <a-modal centered style="top: 20px;" :visible="uppwdvisible" :width="700" :footer="null" :maskClosable="false"
        :destroyOnClose="true" @ok="() => setuppwdvisible(false)" @cancel="() => setuppwdvisible(false)">
        <changepwd @subClosepwdDialog="subClosepwdDialog"></changepwd>
      </a-modal>
    </div>

    <!--  注册 -->
    <div>
      <a-modal centered style="top: 20px;" :visible="registerVisible" :width="700" :footer="null" :maskClosable="false"
        :destroyOnClose="true" @ok="() => setRegisterVisible(false)" @cancel="() => setRegisterVisible(false)">
        <register @closeRegister="closeRegister"></register>
      </a-modal>
    </div>

    <!-- 缴费 -->
    <div>
      <a-modal centered style="top: 20px;" :visible="moneycollectmodalVisible" :width="700" :footer="null"
        :maskClosable="false" :destroyOnClose="true" @ok="() => moneycollect(false)"
        @cancel="() => moneycollect(false)">
        <pay ref="mypay"></pay>
      </a-modal>
    </div>

<!-- 支付记录 -->
    <div>
        <a-modal title="支付记录" centered style="top: 20px;" :visible="payListView" :width="800" :footer="null"
          :maskClosable="false" :destroyOnClose="true" @ok="() => payListVisible(false)"
          @cancel="() => payListVisible(false)">
          <paylist ></paylist>
        </a-modal>
      </div>

  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import checklogin from '@/views/dashboard/checklogin'
  import changepwd from '@/views/user/changepwd'
  import Register from '@/views/user/Register'
  import  pay  from '@/views/dashboard/pay'
  import  paylist  from '@/views/dashboard/paylist'

  export default {
    name: 'UserMenu',
    components: {
      checklogin,
      changepwd,
      Register,
      pay,
      paylist
    },

    props: {
      token: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        loginFlag: false,
        handleLogoutFlag: false,
        loginDialogVisible: false,
        setModalVisibleCount: 0,
        uppwdvisible: false,
        registerVisible: false,
        moneycollectmodalVisible: false,
        qrcode:'',
        payListView:false,
        xufei:false
      }
    },

    methods: {
      ...mapActions(['Logout', 'GetInfo', 'setStatus']),
      ...mapGetters(['userInfo']),
      moneycollect(modalVisible) {
        this.moneycollectmodalVisible = modalVisible
        if(this.$refs.mypay){
          this.$refs.mypay.clearInterValFun();
        }

      },

      payListVisible(modalVisible) {
        this.payListView = modalVisible
      },

      setuppwdvisible(modalVisible) {
        this.uppwdvisible = modalVisible
      },
      setRegisterVisible(modalVisible) {
        this.registerVisible = modalVisible
      },
      handleLogout() {
        const that = this
        this.$confirm({
          title: '提示',
          content: '真的要注销登录吗 ?',
          onOk() {
            return that.Logout({}).then(() => {
              that.handleLogoutFlag = true;
              that.token = ''
              //window.location.reload()
            }).catch(err => {
              that.$message.error({
                title: '错误',
                description: err.message
              })
            })
          },
          onCancel() {
          }
        })
      },
      setModalVisible(modalVisible) {
        //设置为需要弹出登录
        this.setStatus(1)
      },
      subClosepwdDialog() {
        //关闭修改密码框
        this.uppwdvisible = false
      },
      closeRegister() {
        this.registerVisible = false
        //弹出登录
        this.setStatus(1)
      },
    },
    mounted() {
      if (this.token) {
        this.loginFlag = true
        if (!this.userInfo.id) {
          //查询数据库
          this.GetInfo().then(() => {
            //已经加入userInfo
          }).catch(err => {
            this.$message.error({
              title: '错误',
              description: err.message
            })
          });

        }


      }
    },
    watch: {
      'token': function (val) {
        if (val) {
          this.loginFlag = true;
        } else {
          this.loginFlag = false;
          //弹出登录：其他地方登录
          this.setModalVisibleCount++;
          this.loginDialogVisible = true;

        }
      }
    },
    computed: {
      viewExpr() {
        var  expirytime=  this.userInfo().expirytime+" 23:59:59";
        var curtime = Date.parse(Date())
        var expTime = Date.parse(expirytime)
        if(expTime<curtime){
            this.xufei = true;
           return ""
        }else{
          return "("+this.userInfo().expirytime+"到期"+")"
        }
       
      }
    },
  }
</script>