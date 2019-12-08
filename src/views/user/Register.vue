<template>
  <div class="main user-layout-register">
    <h3><span>注册</span></h3>
    <a-form ref="formRegister" :form="form" id="formRegister">

      <a-form-item>
        <a-input size="large" placeholder="11 位手机号"
          v-decorator="['mobile', {rules: [{ required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ }, { validator: this.handlePhoneCheck } ], validateTrigger: ['change', 'blur'] }]">
          <a-select slot="addonBefore" size="large" defaultValue="+86">
            <a-select-option value="+86">+86</a-select-option>
          </a-select>
        </a-input>
      </a-form-item>
      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item>
            <a-input size="large" type="text" placeholder="验证码"
              v-decorator="['captcha', {rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur'}]">
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button class="getCaptcha" size="large" :disabled="state.smsSendBtn" @click.stop.prevent="getCaptcha"
            v-text="!state.smsSendBtn && '获取验证码'||(state.time+' s')"></a-button>
        </a-col>
      </a-row>

      <a-popover placement="rightTop" trigger="click" :visible="state.passwordLevelChecked">
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor=" passwordLevelColor " />
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input size="large" type="password" @click="handlePasswordInputClick" autocomplete="false"
            placeholder="至少6位密码，区分大小写"
            v-decorator="['password', {rules: [{ required: true, message: '至少6位密码，区分大小写'}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}]">
          </a-input>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input size="large" type="password" autocomplete="false" placeholder="确认密码"
          v-decorator="['password2', {rules: [{ required: true, message: '至少6位密码，区分大小写' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}]">
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input size="large" type="text " placeholder="请输入姓名" v-model="name" >
          <a-icon slot="prefix" type="text" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-button size="large" type="primary" htmlType="submit" class="register-button" :loading="registerBtn"
          @click.stop.prevent="handleSubmit" :disabled="registerBtn">注册
        </a-button>
      </a-form-item>

    </a-form>
  </div>
</template>

<script>
  import { mixinDevice } from '@/utils/mixin.js'
  import { getSmsCaptcha } from '@/api/login'
  import { register } from '@/api/manage'
  import { JSEncrypt } from 'jsencrypt'
  import { PUBLIC_KEY } from '@/store/mutation-types'
  import { mapActions } from 'vuex'


  const levelNames = {
    0: '低',
    1: '低',
    2: '中',
    3: '强'
  }
  const levelClass = {
    0: 'error',
    1: 'error',
    2: 'warning',
    3: 'success'
  }
  const levelColor = {
    0: '#ff0000',
    1: '#ff0000',
    2: '#ff7e05',
    3: '#52c41a'
  }
  export default {
    name: 'Register',
    components: {
    },
    mixins: [mixinDevice],
    data() {
      return {
        form: this.$form.createForm(this),
        name:'',
        state: {
          time: 300,
          smsSendBtn: false,
          passwordLevel: 0,
          passwordLevelChecked: false,
          percent: 10,
          progressColor: '#FF0000'
        },
        registerBtn: false
      }
    },
    computed: {
      passwordLevelClass() {
        return levelClass[this.state.passwordLevel]
      },
      passwordLevelName() {
        return levelNames[this.state.passwordLevel]
      },
      passwordLevelColor() {
        return levelColor[this.state.passwordLevel]
      }
    },
    methods: {
      ...mapActions(['setStatus']),

      handlePasswordLevel(rule, value, callback) {
        let level = 0

        // 判断这个字符串中有没有数字
        if (/[0-9]/.test(value)) {
          level++
        }
        // 判断字符串中有没有字母
        if (/[a-zA-Z]/.test(value)) {
          level++
        }
        // 判断字符串中有没有特殊符号
        if (/[^0-9a-zA-Z_]/.test(value)) {
          level++
        }
        this.state.passwordLevel = level
        this.state.percent = level * 30
        if (level >= 2) {
          if (level >= 3) {
            this.state.percent = 100
          }
          callback()
        } else {
          if (level === 0) {
            this.state.percent = 10
          }
          callback(new Error('密码强度不够'))
        }
      },

      handlePasswordCheck(rule, value, callback) {
        const password = this.form.getFieldValue('password')
        if (value === undefined) {
          callback(new Error('请输入密码'))
        }
        if (value && password && value.trim() !== password.trim()) {
          callback(new Error('两次密码不一致'))
        }
        callback()
      },

      handlePhoneCheck(rule, value, callback) {
        callback()
      },

      handlePasswordInputClick() {
        if (!this.isMobile()) {
          this.state.passwordLevelChecked = true
          return
        }
        this.state.passwordLevelChecked = false
      },

      handleSubmit() {
        const { form: { validateFields }, } = this
        validateFields((err, values) => {
          if (!err) {
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(PUBLIC_KEY);
            var rsadata = encrypt.encrypt(values.password);
            register({ phone: values.mobile, smsCode: values.captcha, password: rsadata, name: this.name }).then(res => {

              console.log("register", res);
              if (res.ret != 0) {
                this.$notification['error']({
                  message: '提示',
                  description: res.retInfo,
                  duration: 8
                })
              } else {
                this.$emit('closeRegister')
              }

            })


          }
        })
      },

      getCaptcha(e) {
        e.preventDefault()
        const { form: { validateFields }, state, $message, $notification } = this

        validateFields(['mobile'], { force: true },
          (err, values) => {
            if (!err) {
              state.smsSendBtn = true

              const interval = window.setInterval(() => {
                if (state.time-- <= 0) {
                  state.time = 300
                  state.smsSendBtn = false
                  window.clearInterval(interval)
                }
              }, 1000)

              const hide = $message.loading('验证码发送中..', 0)

              getSmsCaptcha({ phone: values.mobile }).then(res => {
                setTimeout(hide, 2500)
                if (res.ret == 4000) {
                  this.$notification['error']({
                    message: '提示',
                    description: '您的验证码还未过期',
                    duration: 8
                  })
                } else if (res.ret == 4001) {
                  this.$notification['error']({
                    message: '提示',
                    description: '您的帐号已存在，请直接登录',
                    duration: 2
                  })
                  this.$emit('closeRegister')
                  //需要登录
                  this.setStatus(1);
                }

              }).catch(err => {
                setTimeout(hide, 1)
                clearInterval(interval)
                state.time = 300
                state.smsSendBtn = false
                this.requestFailed(err)
              })
            }
          }
        )
      },
      requestFailed(err) {
        this.$notification['error']({
          message: '错误',
          description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
          duration: 4
        })
        this.registerBtn = false
      }
    },
    watch: {
      'state.passwordLevel'(val) {
      }
    }
  }
</script>
<style lang="less">
  .user-register {

    &.error {
      color: #ff0000;
    }

    &.warning {
      color: #ff7e05;
    }

    &.success {
      color: #52c41a;
    }

  }

  .user-layout-register {
    .ant-input-group-addon:first-child {
      background-color: #fff;
    }
  }
</style>
<style lang="less" scoped>
  .user-layout-register {

    &>h3 {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .getCaptcha {
      display: block;
      width: 100%;
      height: 40px;
    }

    .register-button {
      width: 100%;
    }

    .login {
      float: right;
      line-height: 40px;
    }
  }
</style>