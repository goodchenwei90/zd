<!-- 更改密码 -->
<template>
    <div class="main user-layout-register">
        <h3><span>修改密码</span></h3>
        <a-form ref="formRegister" :form="form" id="formRegister">



            <a-form-item>
                <a-input size="large" type="password" @click="handlePasswordInputClick" autocomplete="false"
                v-decorator="['oldpassword', {validateTrigger: ['change', 'blur']}]"   placeholder="输入旧密码">
                </a-input>
            </a-form-item>


            <a-popover placement="rightTop" trigger="click" :visible="state.passwordLevelChecked">
                <template slot="content">
                    <div :style="{ width: '240px' }">
                        <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span>
                        </div>
                        <a-progress :percent="state.percent" :showInfo="false" :strokeColor=" passwordLevelColor " />
                        <div style="margin-top: 10px;">
                            <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
                        </div>
                    </div>
                </template>
                <a-form-item>
                    <a-input size="large" type="password" @click="handlePasswordInputClick" autocomplete="false"
                        placeholder="新密码，至少6位密码，区分大小写"
                        v-decorator="['password', {rules: [{ required: true, message: '至少6位密码，区分大小写'}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}]">
                    </a-input>
                </a-form-item>
            </a-popover>

            <a-form-item>
                <a-input size="large" type="password" autocomplete="false" placeholder="确认密码"
                    v-decorator="['password2', {rules: [{ required: true, message: '至少6位密码，区分大小写' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}]">
                </a-input>
            </a-form-item>

            <a-form-item style="text-align: center">
                <a-button size="large" type="primary" htmlType="submit" class="register-button" :loading="registerBtn"
                    @click.stop.prevent="handleSubmit" :disabled="registerBtn">提交
                </a-button>
            </a-form-item>

        </a-form>

    </div>


</template>
<script>
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
    import { mixinDevice } from '@/utils/mixin.js'
    import { entrypt } from '@/utils/util'
    import { changeTeaPwd } from '@/api/manage'
    import { mapActions, mapGetters } from 'vuex'
    export default {
        mixins: [mixinDevice],
        data() {
            return {
                form: this.$form.createForm(this),
                state: {
                    passwordLevel: 0,
                    passwordLevelChecked: false
                },
                registerBtn: false
            }
        },
        methods: {
            ...mapActions(['RemoveToken','setStatus']),
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

            handlePasswordInputClick() {
                if (!this.isMobile()) {
                    this.state.passwordLevelChecked = true
                    return
                }
                this.state.passwordLevelChecked = false
            },
            handleSubmit() {
                
                const { form: { validateFields }, $router } = this
                validateFields((err, values) => {
                    if (!err) {
                      
                        //发送修改
                        // 旧密码
                        var oldpassword = entrypt(values.oldpassword)
                        var newpassword = entrypt(values.password)

                        changeTeaPwd({ password: newpassword, oldPassword: oldpassword }).then(result => {
                             var ret = result.ret
                            if (ret == 0) {
                                //清除token，重新登录
                                this.$emit('subClosepwdDialog')
                                 this.RemoveToken();
                                 this.setStatus(1)
                            }else{
                                this.$message.error(result.retInfo)
                            }

                        }).catch((err) => {
                            this.$message.error("系统繁忙，请稍后再试")
                        });

                    }
                })
            },
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
        }
    }
</script>