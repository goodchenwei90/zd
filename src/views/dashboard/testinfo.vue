<template>
    <page-view :title="false">
        <div slot="headerContent">
            <a-input-search placeholder="请输入试卷名称" @search="onSearch" v-model="searchmodel.testname" size="large">                  
                <a-button slot="enterButton">搜索</a-button>
                <a slot="addonAfter" @click="clearAll">
                    <a-icon type="delete" />清空</a>
            </a-input-search>
        </div>
        <div slot="extra">
            <a-row>
                <a-col :span="8">
                    <head-info title="小学" content="5000+" :center="false" :bordered="false" />
                </a-col>
                <a-col :span="8">
                    <head-info title="初中" content="10万+" :center="false" :bordered="false" />
                </a-col>
                <a-col :span="8">
                    <head-info title="高中" content="5000+" :center="false" />
                </a-col>
            </a-row>
        </div>
        <div style="width:100%">
            <a-row :gutter="40">
                <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
                   

                    <a-card title="搜索条件" style="margin-bottom: 24px;padding-left: 10px" :bordered="false"
                        :body-style="{padding: 0}">
                        <br/>
                                    <b>学校</b>
                                    <a-select showSearch :value="bsvalue" placeholder="请输入学校名称" style="width: 100%"
                                    :defaultActiveFirstOption="false" :showArrow="false" :filterOption="false"
                                     @search="handleSearch"   @select="handleselect"
                                    :notFoundContent="null" :dropdownMatchSelectWidth="false">
                                    <a-select-option v-for="d in suggestBSList" :key="d.id">{{d.name}}
                                    </a-select-option>
                                    </a-select>
                        

                   
                      
                        <a-list itemLayout="vertical" :dataSource="searchData" size="small">
                            <a-list-item slot="renderItem" slot-scope="item, index"><b>{{item.title}}</b>
                                <div style="padding-left:30px;padding-top: 5px"
                                    v-for="(index, itemMessage) in item.list">
                                    <a @click="setQueryParam(index,item.title)"> {{index.message}}</a>
                                </div>
                            </a-list-item>

                        </a-list>
                    </a-card>
                </a-col>
                <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">
                    <div style="width: 100%;background-color: #fff;height: 60px;padding-top:10px;padding-left: 20px;font-size: 20px">
                        <b>选择条件：</b>
                        <a-tag closable @close="closeQuery(1)" v-model="selectedQueryvisible.subject">
                            {{selectedQuery.subject?selectedQuery.subject:''}}
                        </a-tag>
                        <a-tag closable @close="closeQuery(2)" v-model="selectedQueryvisible.grade">
                            {{selectedQuery.grade?selectedQuery.grade:''}}</a-tag>

                        <a-tag closable @close="closeQuery(3)" v-model="selectedQueryvisible.year">
                            {{selectedQuery.year?selectedQuery.year:''}}</a-tag>

                        <a-tag closable @close="closeQuery(4)" v-model="selectedQueryvisible.testtype">
                            {{selectedQuery.testtype?selectedQuery.testtype:''}}</a-tag>

                        <a-tag closable @close="closeQuery(5)" v-model="selectedQueryvisible.schoolName">
                                {{selectedQuery.schoolName?selectedQuery.schoolName:''}}</a-tag>

                    </div>
                    <a-card style="margin-bottom: 24px;" :bordered="false" :body-style="{padding: 0}">
                        <a-list itemLayout="vertical" size="large" :pagination="pagination" :dataSource="listData"
                            bordered>
                            <a-list-item slot="renderItem" slot-scope="item, index">
                                <div slot="actions">收录:<span
                                        style="padding-left: 5px">{{item.createtime.substring(0,10)}}</span></div>
                                <div slot="actions">学科：{{item.subjectMsg}}</div>

                                <div slot="actions" @click="openDialog(item)">
                                    <a-button icon="download" size="small">打印</a-button>
                                </div>
                                <router-link target="_blank" :to="{path:'/test/qlist',query:{v:entrypt(item.id)}}"
                                    active-class="active">
                                    <span v-if="item.testname.indexOf(searchmodel.testname) > -1">
                                        {{item.testname.substr(0, item.testname.indexOf(searchmodel.testname))}}
                                        <span style="color: #f50">{{searchmodel.testname}}</span>
                                        {{item.testname.substr(item.testname.indexOf(searchmodel.testname) + searchmodel.testname.length)}}
                                       <span style="font-weight: bold" v-if="item.schoolName.length>0"> ({{item.schoolName}}) </span>
                                    </span>
                                    <span v-else>
                                        {{item.testname  }}    <span style="font-weight: bold"> ({{item.schoolName}}) </span>
                                    </span>
                                </router-link>
                            </a-list-item>
                        </a-list>
                    </a-card>
                </a-col>
            </a-row>
            <testprint :info="printInfo" :visibleflag="printvisible"></testprint>
        </div>

    </page-view>
</template>
<script>
    import { PageView } from '@/layouts'
    import HeadInfo from '@/components/tools/HeadInfo'
    import testprint from '@/views/dashboard/testprint'
    import { queryTestInfo, printTest, downPdf,getGovSchool} from '@/api/manage'
    import { JSEncrypt } from 'jsencrypt'
    import { PUBLIC_KEY, TEST_TYPE, SUBJECT, GRADE_TREM } from '@/store/mutation-types'

    let timeout;
    let currentValue;
    function fetch(value, callback) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value;

        function fake() {
            getGovSchool({ schoolName: value }).then(response => {
                var result = response.datas;
                const data = [];
                if (result) {
                    result.forEach(r => {               
                        data.push({
                            id: r.id,
                            name: r.slname,
                        })
                    })
                }

                callback(data);

            })
        }

        timeout = setTimeout(fake, 300);
    }


    export default {
        metaInfo: {
            title: '数学，物理，化学，英语，生物，语文，地理试卷', // set a title
            meta: [{                 // set meta
                name: 'keyWords',
                content: '10万+试卷，高质量点评，解析 ，答案，每周更新'
            }]
        },

        components: {
            PageView,
            HeadInfo,
            testprint
        },
        data() {
            return {
                // 已下载
                bsvalue:undefined,
                suggestBSList: [],
                printInfo: {},
                printvisible: "",
                progressVisible: false,
                percent: 0,
                answer: 1,
                listData: [],
                searchData: [
                    {
                        title: "学科", list: SUBJECT
                    },
                    {
                        title: "类型", list: TEST_TYPE
                    },
                    {
                        title: "学年", list: GRADE_TREM
                    }

                ],
                pagination: {
                    onChange: (page) => {
                        this.pagination.current = page;
                        this.queryParam.curPage = page;
                        this.queryTestInfo();

                    },
                    pageSize: 15,
                    total: 0,
                    showQuickJumper: true,
                    showTotal: () => {
                        return '总数：' + this.pagination.total;
                    }

                },
                queryParam: { pageSize: 15 },
                searchmodel: {testname:'',schoolId:0},
                selectedQuery: {
                    //学科
                    subject: '',
                    grade: '',
                    testtype: '',
                    year: '',
                    keyword: '',
                    schoolName:''
                },
                selectedQueryvisible: {
                    //学科
                    subject: false,
                    grade: false,
                    testtype: false,
                    year: false,
                    keyword: false
                }
            }
        },
        methods: {
            getYearQuery() {
                const time = new Date()
                var year = time.getFullYear();
                var yq = {}
                var yqarr = [];
                for (var i = 0; i <= 3; i++) {
                    yq = { id: year - i, message: year - i }
                    yqarr.push(yq);
                }

                return yqarr;
            },
            queryTestInfo() {
                queryTestInfo(this.queryParam).then(res => {
                    if (res.ret != 0) {
                        this.listData = []
                    } else {
                        var d = res.datas.list;
                        this.listData = d;
                        this.pagination.total = res.datas.total;
                    }


                })
            },
            onSearch() {
                this.pagination.current = 1;
                if (this.searchmodel.testname) {
                    this.queryParam.testName = this.searchmodel.testname
                } else {
                    this.$message.error('试卷名称不能为空', 1);
                    return false;
                }

                this.queryTestInfo()
            },

            onChange(){

            },
            setQueryParam(item, title) {
               
                 if (this.searchmodel.testname) {
                    this.queryParam.testName = this.searchmodel.testname
                 }
                          
                if (title == '学科') {
                    this.queryParam.subject = item.id
                    this.selectedQuery.subject = item.message;
                    this.selectedQueryvisible.subject = true;

                } else if (title == '学年') {
                    this.queryParam.grade = item.id
                    this.selectedQuery.grade = item.message;
                    this.selectedQueryvisible.grade = true;
                } else if (title == '时间') {
                    this.queryParam.testYear = item.id
                    this.selectedQuery.year = item.message;
                    this.selectedQueryvisible.year = true;
                } else if (title == '类型') {
                    this.queryParam.testType = item.id
                    this.selectedQuery.testtype = item.message;
                    this.selectedQueryvisible.testtype = true;
                }
                this.pagination.current = 1
                this.queryTestInfo()
            },
            closeQuery(type) {
                if (type == 1) {
                    this.queryParam.subject = '';
                    this.selectedQuery.subject = "";
                    this.selectedQueryvisible.subject = false;
                } else if (type == 2) {
                    this.queryParam.grade = '';
                    this.selectedQuery.grade = "";
                    this.selectedQueryvisible.grade = false;
                } else if (type == 3) {
                    this.queryParam.testYear = '';
                    this.selectedQuery.year = "";
                    this.selectedQueryvisible.year = false;
                } else if (type == 4) {
                    this.queryParam.testType = '';
                    this.selectedQuery.testtype = "";
                    this.selectedQueryvisible.testtype = false;
                }else if (type == 5) {
                    this.bsvalue =undefined;                  
                    this.queryParam.schoolId = '';
                    this.selectedQuery.schoolName = "";
                    this.selectedQueryvisible.schoolName = false;
                }
                this.queryTestInfo()

            },
            clearAll() {
                this.queryParam = { pageSize: 15 };
                this.selectedQuery = {};
                this.selectedQueryvisible = {};
                this.searchmodel.testname = ''
                this.bsvalue=''
                this.queryTestInfo();
            },
            entrypt(val) {
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(PUBLIC_KEY);
                var data = encrypt.encrypt(val + '');
                return data
            },
            openDialog(item) {
                this.printInfo = item
                this.printvisible = new Date().getTime() + ''
            },
          
            handleSearch(value) {
                fetch(value, data => {              
                    this.suggestBSList = data;                
                });
            },
            handleselect(value) {
               
                this.suggestBSList.forEach(r=>{
                     if(r.id==value){
                        this.selectedQuery.schoolName = r.name;
                        this.selectedQueryvisible.schoolName = true;
                        this.bsvalue = r.name;
                        
                     }
                });


                this.queryParam.schoolId = value
                this.queryTestInfo()
            }
          
        },

        mounted() {
            var item = {
                title: "时间", list: this.getYearQuery()
            }
            this.searchData.push(item);
        },
        activated() {
            this.pagination.current = 1
            this.queryTestInfo()
        },
    }
</script>
<style lang="less" scoped>
    .active {
        color: gray
    }

    .ant-tag {
    font-size: 20px;
    font-weight: bold;
    height: 25px;
  
  }
</style>