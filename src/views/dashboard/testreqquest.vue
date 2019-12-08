<!--  试卷关联试题列表 -->
<template>
    <page-view :title="false">
        <div>

            <a-row :gutter="40">
                <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">

                    <a-card title="试卷信息">
                        总题量：{{getTotalQuests}}
                        <br />
                        <br />
                        知识点数量：{{getBasicKnowTotal.size}}个
                        <br />
                        <br />
                        <div v-for="(item,index) in basicKnowList">

                            {{item.title}} : <b>{{item.percent}}</b>
                        </div>

                    </a-card>
                </a-col>

                <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">
                    <div
                        style="padding-top:30px;padding-bottom:30px;background-color: #FFF;text-align: center;border: 0;font-size: 16px;float:left;width: 100%">
                        <b v-if="disabled">{{testInfo.testName}} </b>
                        <div v-else style="text-align: center">
                            <a-input style="height: 50px;" v-model="testInfo.testName"></a-input>
                        </div>
                        <div style="padding-top: 30px">
                            <a-button type="primary" icon="edit" size="small" @click="addMytest">
                                {{cancelMyadd==false?'取消':'加入我的组卷'}}
                            </a-button>
                            <span style="padding-right: 20px;padding-left:20px">
                                <a-button v-if="!cancelMyadd" icon="check" size="small" type="primary" @click="submit">
                                    提交
                                </a-button>
                            </span>
                            <a-button type="primary" icon="download" size="small" @click="print">打印</a-button>

                        </div>

                    </div>

                    <div style="padding-bottom:30px;background-color: #FFF;float:left;width: 100%">
                        <draggable v-model="testInfo.qlist" :options="{scroll: true,scrollSensitivity: 100}"
                            @end="setSort" :disabled="disabled">
                            <div v-for="(item,index) in testInfo.qlist" style="float: left;width: 100%;">
                                <div v-if="disabled" style="float: left;width: 100%;background-color: #E8E8E8;
                   height: 50px;padding-top:20px">
                                    <b>{{ item.title}}</b>
                                </div>
                                <div v-else>
                                    <a-input style="height: 50px;width: 80% " v-model="item.title"></a-input>
                                    <a-button type="primary" icon="delete" size="large" @click="removeFirstNum(index)">
                                        移除大题
                                    </a-button>
                                </div>
                                <draggable v-model="item.list" :options="{scroll: true,scrollSensitivity: 100}"
                                    :disabled="disabled" @end="setSort">
                                    <div v-for="(item2, index2) in item.list"
                                        style="border-bottom: solid 1px #E8E8E8;padding-top:20px;float:left;width: 100%;padding-left:20px; ">
                                        <div style=" float:left;width: 40px;font-weight:bold">
                                            {{ item2.serialNumber}}{{item2.thirdNum?'-'+item2.thirdNum:''}}.
                                        </div>
                                        <div style=" float:left;width:90%;cursor: pointer" v-html="item2.topic">
                                            {{item2.topic}}
                                        </div>

                                        <div style="float: left;width: 100%;">
                                            <div style="float: left;width: 50%;">
                                                {{item2.basicknowMsg?'知识点:'+item2.basicknowMsg:''}}
                                            </div>
                                            <div style="float: left;width: 50%;text-align:right">
                                                <a-button icon="delete" @click="setModalVisible(true,item2)">答案
                                                </a-button>
                                                <a-button v-if="!disabled" icon="delete"
                                                    @click="removeOne(index,index2)">删除
                                                </a-button>
                                                <a-button v-if="!disabled" icon="copy" @click="changeAnotherFuc(item2)">
                                                    换一题
                                                </a-button>
                                                <a-button v-if="disabled" icon="delete" @click="addQuest(item2)">
                                                    {{zujuanIds().indexOf(item2.id) > -1?'取消':'试题篮'}}</a-button>

                                            </div>

                                        </div>

                                    </div>
                                </draggable>
                            </div>
                        </draggable>
                    </div>


                    <div>
                        <a-modal title="答案解析" style="top: 20px;" :visible="modalVisible" :width="700" :footer="null"
                            @ok="() => setModalVisible(false)" @cancel="() => setModalVisible(false)">
                            <div v-html="analysis">
                                {{analysis}}
                            </div>
                            <div v-html="answer">
                                {{answer}}
                            </div>
                        </a-modal>
                    </div>

                </a-col>
            </a-row>

        </div>

        <div style="position: fixed;top:140px;height: 100px;width:150px;right:20px">
            <zujuaninfo></zujuaninfo>
        </div>

        <testprint :info="printTestInfo" :visibleflag="printvisible"></testprint>

        <div>
            <a-modal title="换一题" style="top: 20px;" :visible="changeAnother" :width="700" :footer="null"
                @ok="() => setchangeAnotherModalVisible(false)" @cancel="() => setchangeAnotherModalVisible(false)">
                <!--  换一题：同一类型，同一知识点 -->
                <questlist :queryString="queryParam" anther="true" @updateZujuan="updateZujuan"></questlist>
            </a-modal>
        </div>


    </page-view>
</template>
<script>
    import { PageView } from '@/layouts'
    import HeadInfo from '@/components/tools/HeadInfo'
    import { getTestRelQuest, zujuan } from '@/api/manage'
    import zujuaninfo from '@/views/dashboard/zujuaninfo'
    import testprint from '@/views/dashboard/testprint'
    import questlist from '@/views/dashboard/questlist'
    import { mapActions, mapGetters } from 'vuex'
    import draggable from 'vuedraggable'
    import { compare, GetPercent } from '@/utils/util'

    export default {
        metaInfo() {
            return {
                title: this.title,
                meta: [{
                    name: 'keyWords',
                    content: this.metaContent
                }]
            }
        },
        components: {
            PageView,
            HeadInfo,
            zujuaninfo,
            draggable,
            testprint,
            questlist
        },
        data() {
            return {
                v: this.$route.query.v,
                testInfo: {},
                testInfoBack: {},
                answer: '',
                analysis: '',
                modalVisible: false,
                disabled: true,
                printTestInfo: {},
                printvisible: "",
                cancelMyadd: true,
                changeAnother: false,
                queryParam: {},
                currentQuest: {},
                basicKnowList: [],
                title: '试卷详情',
                metaContent: ''
            }
        },
        methods: {
            ...mapActions(['updateCount']),
            ...mapGetters(['zujuanIds', 'zujuanItem']),
            queryTestRelQuest() {
                getTestRelQuest({ id: this.v }).then((result) => {
                    var info = result.datas;
                    this.testInfo = info;
                    this.testInfoBack = JSON.parse(JSON.stringify(info))
                }).catch((err) => {
                    this.$message.error('系统异常，请稍后再试');
                });

            },
            setModalVisible(modalVisible, item) {
                this.modalVisible = modalVisible;
                this.analysis = "<b> 解析： </b>" + item.analysis
                this.answer = "<b> 答案： </b>" + item.answer;
            },
            setchangeAnotherModalVisible(modalVisible) {
                this.changeAnother = modalVisible
            },
            addQuest(item) {
                this.updateCount(item);
            },
            addMytest() {
                this.disabled = !this.disabled
                this.cancelMyadd = !this.cancelMyadd
                //取消操作
                if (this.cancelMyadd == true) {
                    //拷贝数据
                    this.testInfo = JSON.parse(JSON.stringify(this.testInfoBack))
                }

            },
            print() {
                this.printTestInfo = { id: this.testInfo.testId, testname: this.testInfo.testName }
                this.printvisible = new Date().getTime() + ''
            },
            //移除大题
            removeFirstNum(index) {
                this.testInfo.qlist.splice(index, 1)
                this.setSort()
            },
            setSort() {
                var aindex = 1
                var firstnumindex = 1
                this.testInfo.qlist.forEach(element => {
                    element.firstNum = firstnumindex
                    element.list.forEach(item => {
                        item.serialNumber = aindex;
                        aindex++;
                    })
                    firstnumindex++
                })
            },

            removeOne(firstIndex, secondIndex) {
                this.testInfo.qlist[firstIndex].list.splice(secondIndex, 1)
                this.setSort()
            },

            submit() {
                if (compare(this.testInfo, this.testInfoBack)) {
                    const that = this
                    this.$confirm({
                        title: '提示',
                        content: '数据未修改，真的需要提交吗 ?',
                        onOk() {
                            return that.submitData()

                        },
                        onCancel() {
                        }
                    })
                } else {
                    this.submitData()
                }
            },
            submitData() {
                //组装参数提交
                var zujuanName = this.testInfo.testName;
                var contentArr = []
                var index = 0
                var subjectArr = []


                this.testInfo.qlist.forEach(item => {
                    var title = item.title;
                    var firstNum = item.firstNum
                    item.list.forEach(element => {
                        if (subjectArr.indexOf(element.subject) < 0) {
                            subjectArr.push(element.subject)
                        }
                        var q = {}
                        q.type = element.type;
                        q.firstnum = firstNum
                        q.firstname = title;
                        q.questionId = element.id
                        q.secondnum = element.serialNumber
                        q.subject = element.subject
                        contentArr.push(q);
                    });

                    index++;
                })


                var postParam = { zujuanName: zujuanName, subject: subjectArr.toString(), content: JSON.stringify(contentArr) }

                zujuan(postParam).then(res => {
                    const ret = res.ret;
                    if (ret == 0) {
                        //提交成功后还原数据
                        this.addMytest();
                        this.$info({ title: '操作成功', content: '组卷成功， 请在"我的组卷"中查看' })
                    } else {
                        //需要登录
                        if (ret === 3000 || ret === 3001) {

                        } else {
                            this.$error({ title: '操作失败', content: '失败，请稍后再试' })
                        }
                    }

                })
            },

            changeAnotherFuc(q) {
                this.changeAnother = true
                this.currentQuest = q
                var segmentation = '';
                if (q.segmentation > 0) {
                    segmentation = q.segmentation
                }
                var nqparam = {};
                nqparam = { pageSize: 2, subject: q.subject, type: q.type, segmentation: segmentation }
                if (q.basicknowid) {
                    Object.assign(nqparam, { basicknowid: q.basicknowid.toString() })
                }
                this.queryParam = nqparam;
            },
            updateZujuan(q) {
                //更换试题
                this.changeAnother = false;
                var oldId = this.currentQuest.id
                this.testInfo.qlist.forEach(element => {
                    var newList = [];
                    var listindex = 0;
                    element.list.forEach(item => {
                        if (oldId === item.id) {
                            q.serialNumber = item.serialNumber;
                            element.list.splice(listindex, 1, q)
                            return;
                        }
                        listindex++;
                    })
                })

            }
        },
        created() {

        },
        mounted() {
            this.queryTestRelQuest();

            setTimeout(() => {
                this.title = this.testInfo.testName
                var metaC = "";
                if (this.testInfo.qlist) {
                    this.testInfo.qlist.forEach(r => {
                        if (r.list) {
                            r.list.forEach(t =>{
                                metaC = metaC + " " + t.keyword;
                            })
                        }
                    })
                    this.metaContent = metaC
                }
            }, 1000)
        },
        watch: {
            '$route'(to, from) {
                this.v = this.$route.query.v
            }
        },
        computed: {
            getTotalQuests() {
                var total = 0;
                if (this.testInfo.qlist) {
                    this.testInfo.qlist.forEach(r => {
                        if (r.list) {
                            total = total + r.list.length
                        }
                    })

                }

                return total
            },

            getBasicKnowTotal() {
                this.basicKnowList = []
                var qlist = this.testInfo.qlist
                var data = new Map();
                //包含重复的数量
                var konwtotal = 0
                if (qlist) {
                    qlist.forEach(r => {
                        if (r.list) {
                            r.list.forEach(element => {
                                var basicKnowArr = element.basicknowid
                                konwtotal = konwtotal + basicKnowArr.length
                                var barrMsg = element.basicknowMsg
                                var index = 0
                                basicKnowArr.forEach(t => {
                                    var bmsg = data.get(t)
                                    if (bmsg) {
                                        bmsg.count = bmsg.count + 1
                                    } else {
                                        var bobj = { id: t, title: barrMsg[index], count: 1 }
                                        data.set(t, bobj)
                                    }
                                    index++
                                });

                            });
                        }
                    })
                }

                data.forEach((value, key) => {
                    var percent = GetPercent(value.count, konwtotal)
                    value.percent = percent
                    this.basicKnowList.push(value)
                });

                return data
            },



        },
    }
</script>