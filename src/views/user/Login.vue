<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs :activeKey="customActiveKey" :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
        @change="handleTabClick">
        <a-tab-pane key="tab1" tab="账号密码登录">
          <a-form-item>
            <a-input size="large" type="text" placeholder="请输入手机号码" v-decorator="[
                'username',
                {rules: [{ required: true, message: '请输入手机号码' }], validateTrigger: 'change'}
              ]">
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input size="large" type="password" autocomplete="false" placeholder="请输入密码" v-decorator="[
                'password',
                {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur'}
              ]">
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>

      <a-form-item style="margin-top:24px">
        <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="state.loginBtn"
          :disabled="state.loginBtn">确定</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
  import md5 from 'md5'
  import { mapActions } from 'vuex'
  import { timeFix } from '@/utils/util'
  import { JSEncrypt } from 'jsencrypt'
  import { PUBLIC_KEY } from '@/store/mutation-types'

  export default {
    components: {
    },
    data() {
      return {
        customActiveKey: 'tab1',
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0,
        form: this.$form.createForm(this),
        state: {
          time: 60,
          loginBtn: false,
          // login type: 0 email, 1 username, 2 telephone
          loginType: 0,
          smsSendBtn: false
        }
      }
    },
    created() {
    },
    methods: {
      ...mapActions(['Login', 'Logout']),
      handleTabClick(key) {
        this.customActiveKey = key
        // this.form.resetFields()
      },
      handleSubmit(e) {
        e.preventDefault()
        const {
          form: { validateFields },
          state,
          customActiveKey,
          Login
        } = this

        state.loginBtn = true

        const validateFieldsKey = ['username', 'password']

        validateFields(validateFieldsKey, { force: true }, (err, values) => {
          if (!err) {
            const loginParams = { ...values }
            loginParams.username = values.username
            //rsa加密
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(PUBLIC_KEY);
            var rsadata = encrypt.encrypt(values.password);

            loginParams.password = rsadata
            Login(loginParams)
              .then((res) => {
                const ret = res.ret;
                if (ret == 0) {
                  this.loginSuccess(res)
                  //调用父组件关闭弹出框和刷新登录状态
                  this.$emit("refreshUser")
                } else {
                  this.$notification['error']({
                    message: '错误',
                    description: res.retInfo,
                    duration: 4
                  })
                }

              }
              )
              .catch(err => this.requestFailed(err))
              .finally(() => {
                state.loginBtn = false
              })
          } else {
            setTimeout(() => {
              state.loginBtn = false
            }, 600)
          }
        })
      },
      loginSuccess(res) {
        // 延迟 1 秒显示欢迎信息
        setTimeout(() => {
          this.$notification.success({
            message: '登录成功',
            description: `${ timeFix() }，试试组卷吧`
          })
        }, 1000)
      },
      requestFailed(err) {
        this.$notification['error']({
          message: '错误',
          description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
          duration: 4
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .user-layout-login {
    label {
      font-size: 14px;
    }

    .getCaptcha {
      display: block;
      width: 100%;
      height: 40px;
    }

    .forge-password {
      font-size: 14px;
    }

    button.login-button {
      padding: 0 15px;
      font-size: 16px;
      height: 40px;
      width: 100%;
    }

    .user-login-other {
      text-align: left;
      margin-top: 24px;
      line-height: 22px;

      .item-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.2);
        margin-left: 16px;
        vertical-align: middle;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #1890ff;
        }
      }

      .register {
        float: right;
      }
    }
  }
</style>