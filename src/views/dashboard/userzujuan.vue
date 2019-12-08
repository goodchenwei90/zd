<!--  用戶组卷 -->
<template>
    <div>
        <div style="padding-bottom:30px;background-color: #FFF;float:left;width: 100%">

            <a-row :gutter="40">
                <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
                    <a-card title="组卷信息">
                        总题量：{{questionsTotal}}
                        <br />
                        <br />
                        知识点数量：{{getBasicKnowTotal.size}}
                        <br />
                        <br />
                        <div v-for="(item,index) in basicKnowList">

                            {{item.title}} : <b>{{item.percent}}</b>
                        </div>

                    </a-card>

                </a-col>
                <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">
                    <a-card style="text-align: center;border: 0">
                        <a-input placeholder="请输入试卷名称" style="width: 50%" v-model="testinfo.zujuanName"></a-input>
                        <a-button type="primary" @click="submit">提交</a-button>
                        <a @click="clearAll">
                            <a-icon type="delete" />清空试题</a>
                    </a-card>
                    <draggable v-model="dragviewTypeListData" :options="{scroll: true,scrollSensitivity: 100}"
                        @end="setSort">
                        <div v-for="(item,index) in dragviewTypeListData" style="float: left;width: 100%;">
                            <a-tooltip placement="leftTop">
                                <template slot='title'>
                                    拖动大题排序
                                </template>
                                <div style="float: left;width: 100%;background-color: #E8E8E8;
                           height: 50px;padding-left:20px;padding-top:20px">

                                    {{num2Chinese(index)}}、<b>{{ item.title}}</b>
                                </div>
                            </a-tooltip>
                            <draggable v-model="item.list" :options="{scroll: true,scrollSensitivity: 100}"
                                @end="setSort">
                                <div v-for="(item2, index2) in item.list"
                                    style="border-bottom: solid 1px #E8E8E8;padding-top:20px;float:left;
                                    width: 100%;padding-left:20px; "  :class="Actived == index2 ? 'changeAnth':''" >
                                    <div style=" float:left;width: 40px;font-weight:bold">{{ item2.index}}.</div>
                                    <a-tooltip placement="rightBottom">
                                        <template slot='title'>
                                            拖动试题排序
                                        </template>
                                        <div style=" float:left;width:90%;cursor: pointer"   v-html="item2.topic"
                                       
                                        >
                                            {{item2.topic}}
                                        </div>
                                    </a-tooltip>
                                    <div style="float: left;width: 100%;text-align:right">
                                        <a-button icon="delete" @click="deleteQuest(item2)">删除</a-button>
                                        <a-button icon="copy" @click="changeAnother(item2,index2)">换一题</a-button>
                                    </div>
                                </div>
                            </draggable>
                        </div>

                    </draggable>


                </a-col>
            </a-row>






        </div>

        <div>
            <a-modal title="换一题" style="top: 20px;" :visible="modalVisible" :width="700" :footer="null"
                @ok="() => setModalVisible(false)" @cancel="() => setModalVisible(false)">
                <!--  换一题：同一类型，同一知识点 -->
                <questlist :queryString="queryParam" anther="true" @updateZujuan="updateZujuan"></questlist>
            </a-modal>
        </div>

    </div>
</template>

<script>


    import HeadInfo from '@/components/tools/HeadInfo'
    import { mapActions, mapGetters } from 'vuex'
    import zujuaninfo from '@/views/dashboard/zujuaninfo'
    import draggable from 'vuedraggable'
    import { numToChinese, GetPercent } from '@/utils/util'
    import questlist from '@/views/dashboard/questlist'
    import { zujuan } from '@/api/manage'
    export default {
        components: {
            HeadInfo,
            zujuaninfo,
            draggable,
            questlist
        },
        data() {
            return {
                // 显示大题
                fetched: false,
                queryParam: {},
                modalVisible: false,
                watchzujuan: [],
                currentOpquestion: null,
                changeQuest: null,
                testinfo: {},
                basicKnowList: [],
                dragviewTypeListData:[],
                Actived:-1
            }
        },
        methods: {
            ...mapActions(['updateCount', 'changeAnther', 'clearZujuanAll']),
            ...mapGetters(['zujuanIds', 'zujuanItem', 'zujuanTotal']),
            setModalVisible(modalVisible) {
                this.modalVisible = modalVisible;
            },
            // 换一题
            changeAnother(q,index2) {
                this.Actived = index2
                var nqparam = {};
                this.modalVisible = true;
                nqparam = { pageSize: 2, subject: q.subject, type: q.type, segmentation: q.segmentation }
                if (q.basicknowid) {
                    Object.assign(nqparam, { basicknowid: q.basicknowid.toString() })
                }
                this.queryParam = nqparam;
                this.currentOpquestion = q;
            },

            updateZujuan(q) {
                //确认替换后操作
                this.Actived =-1
                this.changeQuest = q;
                this.modalVisible = false;
                var oldId = this.currentOpquestion.id;
                const {
                    changeAnther
                } = this
                changeAnther({ oldId: oldId, q: q });
            },

            getquestList() {
                var qindex = 1;
                var idlist = [];
                var typeList = []

                this.zujuanItem().forEach(zjItem => {
                    //有数据取出
                    if (zjItem.list.length > 0) {
                        var r = { title: zjItem.title, type: zjItem.type, numChinese: '' }
                        r.list = zjItem.list;
                        typeList.push(r);
                    }
                });

                //排序
              //  var nsrot = this.arrsort(typeList, 'type');
                //重新写index
                var aindex = 1;
                typeList.forEach(element => {
                    element.list.forEach(item => {
                        item.index = aindex;
                        aindex++;
                    })
                })

                return typeList
            },

            submit() {
                //组装参数提交
                var zujuanName = this.testinfo.zujuanName;
                if (!zujuanName) {
                    this.$error({ title: '操作失败', content: '请输入试卷名称' })
                    return false;
                }
                var contentArr = []
                var index = 0
                var subjectArr = []
                this.dragviewTypeListData.forEach(item => {
                    const type = item.type;
                    var title = item.title;
                    var chinese = this.num2Chinese(index);
                    title = chinese + "、" + title;

                    item.list.forEach(element => {
                        if (subjectArr.indexOf(element.subject) < 0) {
                            subjectArr.push(element.subject)
                        }
                        var q = {}
                        q.type = type;
                        q.firstnum = index + 1
                        q.firstname = title;
                        q.questionId = element.id
                        q.secondnum = element.index
                        q.subject = element.subject
                        contentArr.push(q);
                    });

                    index++;
                })

                var queryParam = { zujuanName: this.testinfo.zujuanName, subject: subjectArr.toString(), content: JSON.stringify(contentArr) }

                zujuan(queryParam).then(res => {
                    const ret = res.ret;
                    if (ret == 0) {
                        this.clearAll();
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
            deleteQuest(q) {
                const {
                    updateCount
                } = this

                updateCount(q);

                //移除viewTypeListData中list数据
                var aindex = 1;
                var List = []
                var tindex = 0;
                this.viewTypeListData.forEach(element => {
                    var newList = [];
                    element.list.forEach(item => {
                        if (q.id === item.id) {
                        } else {
                            item.index = aindex;
                            newList.push(item);
                            aindex++;
                        }
                    })
                    element.list = newList;
                    if (newList.length == 0) {
                        List.push(tindex)
                    }
                    tindex++;
                })

                List.forEach(item => {
                    this.viewTypeListData.splice(item, 1)
                })
            },
            num2Chinese(index) {

                return numToChinese(index + 1)
            },

            setSort() {
                var aindex = 1;
                this.dragviewTypeListData.forEach(element => {
                    element.list.forEach(item => {
                        item.index = aindex;
                        aindex++;
                    })
                })
            },

            //按题型type排序
            arrsort(array, key) {
                return array.sort(function (a, b) {
                    var x = a[key];
                    var y = b[key];
                    return ((x < y) ? -1 : (x > y) ? 1 : 0)
                })
            },

            clearAll() {
                const {
                    clearZujuanAll
                } = this
                clearZujuanAll()

            },






        },
        mounted() {

        },

        computed: {
            viewTypeListData() {
                var d = this.getquestList()
                this.dragviewTypeListData = JSON.parse(JSON.stringify(d))
                return d
            },

            questionsTotal() {
                var total = 0;
                this.viewTypeListData.forEach(r => {
                    if (r.list) {
                        total = total + r.list.length
                    }
                })
                return total;
            },
            getBasicKnowTotal() {
                this.basicKnowList = []
                var qlist = this.viewTypeListData
                var data = new Map();
                var konwtotal = 0
                if (qlist) {
                    qlist.forEach(r => {
                        if (r.list) {
                            r.list.forEach(element => {
                                var barr = element.basicknowid
                                konwtotal  = konwtotal+barr.length
                                var barrMsg = element.basicknowMsg
                                var index = 0
                                barr.forEach(t => {
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

        }

    }
</script>
<style scoped>

.changeAnth{
     background-color:skyblue
}

</style>