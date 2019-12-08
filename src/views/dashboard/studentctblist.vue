<template>

    <div style="float: left;width:100%">

        <a-row :gutter="40">

            <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
                <a-card title="学生列表">
                    <a-input-search placeholder="搜索学生" style="width: 200px" @search="rest" @change="onSearchStudent"
                        v-model="stuSeacherVal">
                        <a-button slot="enterButton">全部</a-button>
                    </a-input-search>

                    <a-list itemLayout="vertical" size="large" :pagination="pagination" :dataSource="listData">
                        <a-list-item slot="renderItem" slot-scope="item, index" style="height: 50px">
                            <div style="cursor: pointer" :class="activeClass == index ? 'activeCtb':'unactiveCtb'"
                                @click="getCtbQuest(item,index)">
                                {{item.name}}
                            </div>
                        </a-list-item>
                    </a-list>
                </a-card>
            </a-col>


            <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">

                <div style="padding-bottom: 20px;padding-top:20px">
                    <a v-for="(item,index) in subjectlist" style="padding-left:20px"
                        :class="activeClassd == index ? 'active':'unactive'" @click="selectSub(item,index)">
                        {{item.message}}


                    </a>

                </div>

                <div style="padding-bottom: 20px;padding-top:20px;padding-left:20px">
                    错题日期选择： <a-range-picker
                        :ranges="{'选择本月': [moment().startOf('month'), moment().endOf('month')] }"
                        :defaultValue="[moment(moment(new Date()).add(-30, 'days'), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]"
                        @change="onChangeDate"
                        >
                        <template slot="dateRender" slot-scope="current">
                            <div class="ant-calendar-date" :style="getCurrentStyle(current)">
                                {{current.date()}}
                            </div>
                        </template>
                    </a-range-picker>
                    <a-button type="primary" @click="queryctb" style="margin-left:20px">查询</a-button>
                    <a-button type="primary" @click="printctb" style="margin-left:20px">打印</a-button>
                </div>

                <a-list itemLayout="vertical" size="large" :pagination="questpagination" :dataSource="ctbListData"
                    bordered>
                    <a-list-item slot="renderItem" slot-scope="item, index">
                        <div slot="actions">考点: {{item.basicKnowMsg}}</div>
                        <div slot="actions">难度:{{setdiffmsg(item.diff)}}</div>
                        <div slot="actions" @click="findsimlar(item.basicKnowId,item.subject)" style="color:red">找相似
                        </div>
                        <template slot="actions" v-for="{type, text,theme,id} in actions">
                            <span :key="type" @click="setAction(true,{id},item)">
                                <a-icon :type="type" style="margin-right: 8px" :theme="theme" />
                                {{ id==5 ?zujuanIds().indexOf(item.id) > -1?'取消':'试题篮' : text}}
                            </span>
                        </template>

                        <div slot="actions">

                            <div v-if="item.id?true:false">
                                <router-link target="_blank"
                                    :to="{path:'/test/qlist',query:{v:entrypttestid(item. sourceId)}}">
                                    来源： {{item.source}}
                                </router-link>
                            </div>
                            <div v-else> 来源： 拍照上传</div>


                        </div>
                        <div v-html="item.topic">
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
            </a-col>
        </a-row>

        <div style="position: fixed;top:235px;height: 100px;width:150px;right:20px">
            <zujuaninfo></zujuaninfo>
        </div>

        <div>
            <a-modal title="找相似题" style="top: 20px;" :visible="smailrModalVisible" :width="700" :footer="null"
                @ok="() => setsmailrModalVisible(false)" @cancel="() => setsmailrModalVisible(false)">
                <!--  换一题：同一类型，同一知识点 -->
                <questlist :queryString="queryParam"></questlist>
            </a-modal>
        </div>

    </div>

</template>
<script>

    import { getStudents, getCtbList, buildIndex, getQuestionList,printCtb } from '@/api/manage'
    import { mapActions, mapGetters } from 'vuex'
    import zujuaninfo from '@/views/dashboard/zujuaninfo'
    import questlist from '@/views/dashboard/questlist'
    import { entrypt } from '@/utils/util'
    import { SUBJECT } from '@/store/mutation-types'
    import moment from 'moment'

    export default {
        components: {
            zujuaninfo,
            questlist
        },
        props: {
            refresh: {
                type: String,
                default: ''
            },
        },
        data() {
            return {
                startDate:'',
                endDate:'',
                selectctbParam:{},
                activeClassd: -1,
                subjectlist: SUBJECT,
                smailrModalVisible: false,
                queryParam: {},
                actions: [
                    { type: 'info-circle', text: '解析', id: 1 },
                    { type: 'cloud', text: '试题篮', theme: 'twoTone', id: 5 }
                ],
                answer: '',
                analysis: '',
                modalVisible: false,
                stuSeacherVal: '',
                activeClass: -1,
                listData: [],
                ctbListData: [],
                pagination: {
                    onChange: (page) => {


                    },
                    pageSize: 10,
                    total: 0,
                    simple: true,
                    showQuickJumper: true

                },
                studentId: 0,
                questpagination: {
                    onChange: (page) => {
                        this.questpagination.current = page;
                        getCtbList({ studentId: this.studentId, curPage: page }).then(res => {
                            if (res.datas) {
                                this.ctbListData = res.datas;
                                this.questpagination.total = res.total
                            } else {
                                this.ctbListData = []
                                this.questpagination.total = 0
                            }
                        })
                    },
                    pageSize: 10,
                    total: 0,
                    showQuickJumper: true,
                    showTotal: () => {
                        return '总数：' + this.questpagination.total;
                    },
                    current: 1
                },
            }
        },
        methods: {
            moment,
            ...mapActions(['updateCount','setStatus']),
            ...mapGetters(['zujuanIds', 'zujuanItem']),
            selectSub(item,index){
                this.activeClassd = index
                this.selectctbParam={subject:item.id}
                
            },
            onChangeDate(dates, dateStrings) {
              if(dateStrings.length==2 ){
                this.selectctbParam .startDate = dateStrings[0]
                this.selectctbParam .endDate = dateStrings[1]
                this.startDate = dateStrings[0]
                this.endDate = dateStrings[1]
              }
             
            },

            queryctb(){
                if(this.studentId==0){
                    this.$message.error("请选择学生")
                    return false;
                }else{
                    this.selectctbParam.studentId= this.studentId
                }
                
                if(this.startDate){
                    this.selectctbParam.startDate = this.startDate
                }
                if(this.endDate){
                    this.selectctbParam.endDate = this.endDate
                }
                
                this.getCtbQuestByCond()
            },

            printctb(){
                if(this.studentId==0){
                    this.$message.error("请选择学生")
                    return false;
                }
                if(!this.selectctbParam.subject){
                    this.$message.error("请选择学科")
                    return false;
                }
                if(!this.startDate){
                    this.$message.error("请选择打印开始日期")
                    return false;
                }
                if(!this.endDate){
                    this.$message.error("请选择打印结束日期")
                    return false;
                }
                this.selectctbParam.studentId = this.studentId
                this.selectctbParam.startDate = this.startDate
                this.selectctbParam.endDate = this.endDate
             
                var filename =  '错题本('+this.selectctbParam.startDate+'--'+this.selectctbParam.endDate+').pdf'
                printCtb(this.selectctbParam, (e) => {
                    //下载进度处理
                    var complete = (e.loaded / e.total * 100 | 0)
                    this.percent = complete

                }).then(res => {
                    // 文件下载

                    var blob = new Blob([res], { type: 'application/pdf;charset-UTF-8' });
                    if (!blob) {
                        this.setStatus(1)
                        return false;
                    } else {
                        if (blob.size == 0) {
                            this.setStatus(1)
                            return false;
                        }
                    }
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE version
                        window.navigator.msSaveBlob(blob, filename);

                    } else {
                        var downloadElement = document.createElement('a');
                        var href = window.URL.createObjectURL(blob); // 创建下载的链接
                        downloadElement.href = href;
                        downloadElement.download = filename; // 下载后文件名
                        document.body.appendChild(downloadElement);
                        downloadElement.click(); // 点击下载
                        window.URL.revokeObjectURL(href); // 释放掉blob对象
                    }

                })

            },



            setModalVisible(modalVisible) {
                this.modalVisible = modalVisible;
            },
            setsmailrModalVisible(modalVisible) {
                this.smailrModalVisible = modalVisible;
            },
            getCtbStudentList() {
                getStudents({}).then((result) => {

                    if (result.datas) {
                        this.pagination.total = result.datas.length;
                        this.listData = result.datas;
                    } else {
                        this.pagination.total = 0
                    }

                })
            },
            getCtbQuest(item, index) {
                this.activeClass = index;
                this.activeClassd = -1
                this.studentId = item.id
                getCtbList({ studentId: item.id }).then(res => {
                    if (res.datas) {
                        this.ctbListData = res.datas;
                        this.questpagination.total = res.total
                    } else {
                        this.ctbListData = []
                        this.questpagination.total = 0
                    }

                })


            },
            getCtbQuestByCond() {                            
                getCtbList(this.selectctbParam).then(res => {
                    if (res.datas) {
                        this.ctbListData = res.datas;
                        this.questpagination.total = res.total
                    } else {
                        this.ctbListData = []
                        this.questpagination.total = 0
                    }

                })


            },
            onSearchStudent() {
                if (this.stuSeacherVal) {
                    var newData = []
                    this.listData.forEach(element => {
                        if (element.name.indexOf(this.stuSeacherVal) > -1) {
                            newData.push(element)
                        }
                    });
                    this.listData = newData;
                }
            },
            rest() {
                this.stuSeacherVal = ""
                this.getCtbStudentList();
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
            setAction(modalVisible, actionsId, item) {
                const {
                    updateCount
                } = this

                if (actionsId.id == 1) {
                    this.setModalVisible(modalVisible);
                    //获取解答
                    if (item.analysis) {
                        this.analysis = "<b> 解析： </b>" + item.analysis;
                    }
                    this.answer = "<b> 答案： </b>" + item.answer;

                } else if (actionsId.id == 5) {
                    if (item.id) {
                        //搜索引擎可能无数据，执行同步到搜索引擎
                        getQuestionList({ ids: item.id }).then(res => {
                            if (!res.datas) {
                                buildIndex({ ids: item.id, subject: item.subject }).then(res => { })
                            }
                        })

                        updateCount(item);
                    } else {
                        //图片试题点击

                        this.$message.error("请查找相似题，添加试题篮")

                    }


                }

            },

            entrypttestid(id) {
                return entrypt(id)
            },
            //找相似题
            findsimlar(basicKnowId, subject) {


                if (basicKnowId) {
                    this.smailrModalVisible = true
                    this.queryParam = { basicknowid: basicKnowId, subject: subject, pageSize: 2 };
                } else {
                    this.$message.error("请登录小程序批注该试题知识点")
                }



            },
            getCurrentStyle(current, today) {
                const style = {}
                if (current.date() === 1) {
                    style.border = '1px solid #1890ff'
                    style.borderRadius = '50%'
                }
                return style
            }

        },
        mounted() {
            this.startDate = moment(moment(new Date()).add(-30, 'days')).format('YYYY-MM-DD')
            this.endDate = moment(new Date()).format('YYYY-MM-DD')
            this.getCtbStudentList();
        },
        activated() {

        },
        watch: {
            'refresh': function (val) {
                this.getCtbStudentList();

            }
        }


    }
</script>
<style scoped>
    .activeCtb {
        color: #1C92FF;
    }

    .unactiveCtb {
        color: #595959;
    }
    .unactive {

    }
    .active{
        color:red;
        font-weight: bold;
    }
</style>