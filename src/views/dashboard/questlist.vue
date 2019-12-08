<template>
    <div>
        <a-list itemLayout="vertical" size="large" :pagination="pagination" :dataSource="listData" bordered>
            <a-list-item slot="renderItem" slot-scope="item, index" :class="anther?'':zujuan?'':zujuanIds().indexOf(item.id) > -1?'selected':''">
                <div slot="actions" style="color:#1890FF">考点: {{item.basicknowMsg?item.basicknowMsg.toString():''}}
                </div>
                <div slot="actions" style="color: #1890FF">难度:{{setdiffmsg(item.diff)}}</div>
                <div slot="actions" style="color: #1890FF">
                    <div @click="showTests(index,!item.hide)">{{item.tests!=null?item.tests.length>0?'出处':'':''}}</div>
                    <div style="width: 100%" v-if="item.hide">
                        <div v-for="(item,index) in item.tests"  :key="item" style="float:left;padding-left:10px;display: block">
                            <router-link target="_blank" :to="{path:'/test/qlist',query:{v:entryptTestId(item.id)}}">
                                {{index+1}}.{{item.name}} {{item.num}}/ {{item.total}}
                            </router-link>
                        </div>
                    </div>
                </div>

                <template slot="actions" v-for="{type, text,theme,id} in actions">
                    <span :key="type" @click="setAction(true,{id},item)" style="color: #1890FF">
                        <a-icon :type="type" style="margin-right: 8px" :theme="theme" />
                        <span v-if="id==5" style="font-weight: 700;color:orange">
                            {{anther?'确认换题':zujuanIds().indexOf(item.id) > -1?'取消':'试题篮'}}
                        </span>
                        <span v-else>{{text}}</span>
                    </span>
                </template>

                <div  v-html="item.topic">
                    {{item.topic}}
                </div>
            </a-list-item>
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
        </a-list>


        <!-- 没登录只能查看第一页 -->
        <a-modal :centered="true" :visible="loginmodalVisible" :footer="null" :destroyOnClose="true"
            :maskClosable="false" @ok="() => setloginModalVisible(false)" @cancel="() => setloginModalVisible(false)">
            <login @refreshUser="refreshUser"></login>
        </a-modal>

    </div>
</template>


<script>
    import { mapActions, mapGetters } from 'vuex'
    import { search, getQuestionInfo, getQuestionList } from '@/api/manage'
    import store from '@/store'
    import login from '@/views/user/Login'
    import { entrypt } from '@/utils/util'
    export default {
        components: {
            login
        },
        props: {
            queryString: {
                type: Object,
                default: null
            },
            //组卷中心传入id列表
            zujuan: {
                type: String,
                default: null
            },
            //换一题确认
            anther: {
                type: Boolean,
                default: false
            }
        },
        //监听
        watch: {
            queryString(val) {
                this.listData = [];
                this.pagination.current = 1;
                this.queryString = val;
                this.queryQuestions();
            },

            'zujuan': function (val) {
                this.zujuan = val;
                this.listData = [];
                this.queryQuestions();
            },

            'countChangeType': function (val) {//监听props中的属性
                //组卷type信息
                this.queryQuestions();

            }
        },
        mounted() {
            this.listData = [];
            this.queryQuestions();
        },
        data() {
            return {
                spinning: false,
                modalVisible: false,
                loginmodalVisible: false,
                listData: [],
                pagination: {
                    onChange: (page) => {
                        if (page > 2) {
                            if (store.getters.token) {

                                //点击页面更换数据
                                this.pagination.current = page;
                                this.queryString.curPage = page;
                                this.queryQuestions();

                            } else {
                                this.setloginModalVisible(true)
                            }
                        } else {
                            this.pagination.current = page;
                            this.queryString.curPage = page;
                            this.queryQuestions();
                        }




                    },
                    pageSize: 10,
                    total: 0,
                    showQuickJumper: true,
                    showTotal: () => {
                        return '总数：' + this.pagination.total;
                    },

                    current: 1

                },
                actions: [
                    { type: 'info-circle', text: '解析', id: 1 },
                    { type: 'cloud', text: '试题篮', theme: 'twoTone', id: 5 }
                ],
                answer: '',
                analysis: '',
                zjFlag: false,
                countChange: 0,
                countChangeType: null
            }
        },
        methods: {
            ...mapActions(['updateCount']),
            ...mapGetters(['zujuanIds', 'zujuanItem']),
            setModalVisible(modalVisible) {
                this.modalVisible = modalVisible;
            },
            setloginModalVisible(modalVisible) {
                this.loginmodalVisible = modalVisible;
            },
            refreshUser() {
                this.loginmodalVisible = false
            },
            setAction(modalVisible, actionsId, item) {
                const {
                    updateCount, isExist
                } = this

                if (actionsId.id == 1) {
                    this.setModalVisible(modalVisible);
                    //获取解答
                    getQuestionInfo(item.id, item.subject).then(res => {
                        var d = res.datas;
                        if (d) {
                            this.analysis = "<b> 解析： </b>" + d.analysis;
                            this.answer = "<b> 答案： </b>" + d.answer;
                        }
                    })

                } else if (actionsId.id == 5) {
                    //试题篮

                    if (this.anther) {
                        //换一题
                        this.$emit('updateZujuan', item)
                    } else {
                        updateCount(item);
                    }

                    //组卷中心取消
                    if (this.zjFlag == true) {
                        this.countChange++;
                        this.countChangeType = this.zujuan + "_" + this.countChange;
                        // 更新listdata
                        var dindex = 0;
                        var newListData = [];
                        this.listData.forEach(itemlist => {
                            if (itemlist.id != item.id) {
                                newListData.push(itemlist);
                            }
                        })

                        this.listData = newListData;
                        this.pagination.total = newListData.length

                    }

                }

            },
            queryQuestions() {
                if (this.zujuan != null) {
                    var type = this.zujuan.split("_")[0];
                    this.zjFlag = true;
                    var idsSplit = null;
                    this.zujuanItem().forEach(zjItem => {
                        if (type == zjItem.type) {
                            this.listData = zjItem.list;
                            this.pagination.total = this.listData.length
                        }
                    })

                } else {
                    search(this.queryString).then(res => {
                        this.listData = res.datas;
                        this.pagination.total = res.total
                        this.pagination.pageSize = this.queryString.pageSize
                    })

                }
            },
            setdiffmsg(diff) {

                if (diff > 0.7 && diff <= 1) {
                    return "易"
                } else if (diff > 0.5 && diff <= 0.7) {
                    return "较易"
                } else if (diff > 0.3 && diff <= 0.5) {
                    return "中等"
                } else if (diff >= 0.2 && diff <= 0.3) {
                    return "较难"
                } else if (diff < 0.2) {
                    return "难"
                } else {
                    return ""
                }
            },
            showTests(index, hide) {
                var item = this.listData[index];
                Object.assign(item, { hide: hide })
                this.listData.splice(index, item)
            },
            entryptTestId(id) {
                return entrypt(id)
            }

        }
    }

</script>

<style scoped>
    .selected {
        background-color: #FEF7D7
    }
</style>