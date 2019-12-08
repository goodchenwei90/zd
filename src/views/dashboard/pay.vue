<template>
    <div>
        <a-steps :current="current">
            <a-step v-for="item in steps" :key="item" :title="item.title" />
        </a-steps>
        <div class="steps-content">


            <div v-if="current==0">
                <div v-for="(p,index) in  steps[current].content" :key="p"
                    style="float: left;border:#FFE3CC 1px solid;width: 100%;"
                    :class="selectClassActive==index?'selectClass':''" @click="proSelect(index,p)">

                    <div style="float: left;width:100%">
                        <div style="width: 80px;color:black;font-size: 20px;font-weight:700"
                            :class="selectClassActive==index?'selectClass':'nameclass'">{{p.name}}</div>
                        <div style="font-size: 22px;font-weight:800">{{p.price}}</div>
                        <div>{{p.descp}}</div>
                    </div>

                </div>

            </div>

            <div v-if="current==1">
                订单提交成功，请您尽快付款！应付金额：<span style="color: red;font-size: 22px">{{payPrice}}元</span> <br />


                <a-spin tip="正在获取微信支付二维码..." v-if="loading" style="padding-top:50px">
                </a-spin>

                <img :src="qrcode"> <br />
                {{tips}}<br />
            <!--     <a-spin tip="正在查询支付结果，关闭后可在支付记录中查询..." v-if="zfloading" style="padding-top:50px">
                </a-spin> -->

            </div>

            <div v-if="current==2">

               
                <div style="padding-top: 50px">
                <img src="../../assets/pay.png" /><b style="font-size: 20px;">  {{payResultContent}} </b>
            </div>
            </div>


        </div>
        <div class="steps-action">
            <a-button v-if="current ==0 " type="primary" @click="next">
                确认商品
            </a-button>
            <a-button v-if="current>0 && payResult==false" style="margin-left: 8px" @click="prev">
                返回
            </a-button>
        </div>
    </div>
</template>
<script>
    import { getPayCode, order, getProduct, getPayResult } from '@/api/manage'
    import { mapActions } from 'vuex'
    export default {
        data() {
            return {
                current: 0,
                steps: [{
                    title: '选择商品',
                    content: [],
                }, {
                    title: '微信支付',
                    content: '',
                }, {
                    title: '支付结果',
                    content: '',
                }],
                selectClassActive: -1,
                qrcode: '',
                payPrice: 0,
                tips: '',
                loading: false,
                payResult: false,
                zfloading: false,
                productId: 0,
                orderId: 0,
                timeout: 1500,
                payResultContent:'',
                interval:null

            }
        },
        methods: {
            ...mapActions(['GetInfo']),
            proSelect(index, p) {
                this.selectClassActive = index
                this.payPrice = p.payPrice
                this.productId = p.id
            },
            next() {
                this.current++

                //1.发送下单，返回订单号
                order({ productId: this.productId }).then(res => {
                    if (res.ret == 0) {

                        var order = res.datas;
                        this.orderId = order.orderId
                        //2.生成二维码
                        this.loading = true;
                        getPayCode({ orderId: order.orderId }).then(res => {
                            var blob = new Blob([res], { type: 'application/gif;charset-UTF-8' });
                            let url = window.URL.createObjectURL(blob)
                            this.qrcode = url
                            this.loading = false
                            this.tips = ' 使用微信扫描上图二维码,请在30分钟内完成支付'

                            this.zfloading = true
                            //轮询结果
                             this.interval = window.setInterval(() => {
                                this.queryPayResult()
                            }, 1000)

                        }).catch(err => {
                            this.loading = false
                            that.$message.error({
                                title: '错误',
                                description: '支付失败，请稍后再试'
                            })
                        })

                    } else {
                        this.$notification.error({
                            message: '购买提示',
                            description: '下单失败，请稍后再试'
                        })

                    }

                }).catch(err => {
                    this.loading = false
                    that.$message.error({
                        title: '错误',
                        description: '支付失败，请稍后再试'
                    })
                })






            },

            queryPayResult() {
                this.timeout--
                if (this.timeout <= 0) {
                    clearInterval( this.interval)
                    this.current++
                    this.payResultContent="支付结果查询超时，稍后在支付记录查询。"
                } else {

                    getPayResult({ orderId: this.orderId }).then(res => {

                        if (res.ret == 0) {
                            if (res.datas.status == 0) {
                                this.zfloading = false
                                this.payResult = true
                                this.current++
                                clearInterval(this.interval)
                                this.payResultContent="支付成功"
                                //更新用户到期信息
                                this.GetInfo()
                            }

                        } else {
                            this.$notification.error({
                                message: '支付结果提示',
                                description: '支付结果异常，请联系我们'
                            })
                        }

                    })

                }



            },

            prev() {
                this.current--
                if(this.interval){
                    clearInterval( this.interval)
                }
            },

            Fen2Yuan(num) {
                if (typeof num !== "number" || isNaN(num)) return null;
                return (num / 100).toFixed(2);
            },

            queryProduct() {
                getProduct({ pageSize: 10 }).then(res => {

                    if (res.ret != 0) {
                        this.$notification.error({
                            message: '获取套餐失败',
                            description: '系统异常，请稍后再试'
                        })
                    } else {

                        var list = res.datas.list;

                        if (list) {

                            list.forEach(element => {
                                var p = {
                                    id: element.id, name: element.name, price: '￥' + this.Fen2Yuan(element.price), payPrice: this.Fen2Yuan(element.price),
                                    descp: element.descr
                                }
                                this.steps[0].content.push(p)

                            });
                        }


                    }

                })

            },
            clearInterValFun(){
                console.log("调动了。。。。。")
                clearInterval( this.interval)
            }
        },
        mounted() {
            this.queryProduct()
        },
    }
</script>
<style scoped>
    .steps-content {
        margin-top: 16px;
        border: 1px dashed #e9e9e9;
        border-radius: 6px;
        background-color: #fafafa;
        min-height: 200px;
        text-align: center;
    }

    .steps-action {
        margin-top: 24px;
    }

    .selectClass {
        background-color: #ff7200
    }

    .nameclass {
        color: black
    }
</style>