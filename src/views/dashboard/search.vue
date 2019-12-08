<template>
    <page-view :title="false">
        <div slot="headerContent" style="text-align: center;padding-bottom: 20px">

            <a-input-group compact>
                <a-input style="width: 50%" placeholder="请输入关键字搜索试题" v-model="searchmodel.keyword" />
                <a-select labelInValue :value="subjectMsgValue" @select="handlesubjectMsgValue" style="width: 100px">
                    <a-select-option v-for="item in getSubject" :value="item.id">{{item.message}}</a-select-option>
                </a-select>
                <a-button type="primary" icon="search" @click="search">搜索</a-button>
                <a-button>
                    <a @click="clearAll">
                        <a-icon type="delete" />清空</a>
                </a-button>
            </a-input-group>
        </div>

        <div style="float:left;width: 100%;">

            <a-row :gutter="40">
                <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
                    <a-card title="搜索条件">
                        <a-input-group compact>
                            <a-select style="width: 100%;padding-bottom: 20px"
                                @change="(value)=>{this.searchmodel.testtype = value}" placeholder="试卷类型"
                                :allowClear="true">
                                <a-select-option v-for="item in getTesttype" :value="item.id">{{item.message}}
                                </a-select-option>
                            </a-select>

                            <a-select style="width: 100%;padding-bottom: 20px"
                                @change="(value)=>{this.searchmodel.type = value}" placeholder="试题类型"
                                :allowClear="true">
                                <a-select-option v-for="item in getQUEST_TYPE" :value="item.id">{{item.message}}
                                </a-select-option>
                            </a-select>

                            <a-select style="width: 100%;padding-bottom: 20px"
                                @change=" (value)=>{this.searchmodel.diff = value}" placeholder="试题难度"
                                :allowClear="true">
                                <a-select-option v-for="item in getDIFF" :value="item.id">{{item.message}}
                                </a-select-option>
                            </a-select>
                            <a-select style="width: 100%;padding-bottom: 20px" mode="tags" @change="handletagsGrade"
                                placeholder="年级：可多选" :allowClear="true">
                                <a-select-option v-for="item in getGRADE" :value="item.id">{{item.message}}
                                </a-select-option>
                            </a-select>


                            <!-- 搜索提示  -->
                            <a-select showSearch :value="bsvalue" placeholder="请输入知识点" style="width: 100%"
                                :defaultActiveFirstOption="false" :showArrow="false" :filterOption="false"
                                :allowClear="true" @search="handleChange" @change="handleChange" @select="handleselect"
                                :notFoundContent="null" :dropdownMatchSelectWidth="false">
                                <a-select-option v-for="d in suggestBSList" :key="d.id">{{d.name}}
                                </a-select-option>
                            </a-select>

                        </a-input-group>
                    </a-card>
                </a-col>

                <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">

                    <div v-if="isview">
                        <a-card style="margin-bottom: 24px;" :bordered="false" :body-style="{padding: 0}">
                            <questlist :queryString="queryStr"></questlist>
                        </a-card>
                    </div>
                    <div v-else style="background-color: #FFF;padding-top:20px;padding-left: 20px;padding-bottom: 50px">
                        <div>
                            题库标签：
                            <a-tag color="#f50">高效</a-tag>
                            <a-tag color="#2db7f5">便捷</a-tag>
                            <a-tag color="#87d068">更新快</a-tag>
                            <a-tag color="#108ee9">质量高</a-tag>
                        </div>
                        <div>
                            支持搜索条件：
                            <br />
                            <br />
                            一.学科：搜索数学，物理，化学，英语，语文，地理，生物，政治试题
                            <br />
                            <br />
                            二.年份： 收录年份,快速找到新题
                            <br />
                            <br />
                            三.题型：支持搜索 选择题 填空题 计算题 解答题 实验与探究题 综合题 作图、实验、探究题 简答题 判断题 应用题 其他
                            <br />
                            <br />
                            四.年级：支持搜索三年级到高三试题
                            <br />
                            <br />
                            五.知识点：搜索知识点试题
                            <br />
                            <br />
                            六.试题难度：支持 易 较易 中等 较难 难 搜索试题
                            <br />
                            <br />
                            七.搜索 期末 期中 单元测试 月考 周考 中考 模拟 中考同步 试题
                            <br />
                            <br />
                            八.高级搜索：1.搜素试卷第N题，如搜索包含题量26道试卷中的第25题



                        </div>

                    </div>

                </a-col>
            </a-row>
        </div>
        <div style="position: fixed;top:195px;height: 100px;width:150px;right:20px">
            <zujuaninfo></zujuaninfo>
        </div>
    </page-view>
</template>

<script>
    import { PageView } from '@/layouts'
    import HeadInfo from '@/components/tools/HeadInfo'
    import { mapGetters } from 'vuex'
    import questlist from '@/views/dashboard/questlist'
    import zujuaninfo from '@/views/dashboard/zujuaninfo'
    import { TEST_TYPE, SUBJECT, GRADE, DIFF, QUEST_TYPE } from '@/store/mutation-types'
    import { suggestBS } from '@/api/manage'

    let timeout;
    let currentValue;
    function fetch(value, callback) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value;

        function fake() {
            suggestBS({ keyWord: value }).then(response => {
                var result = response.datas;
                const data = [];
                if (result) {
                    result.forEach(r => {
                        data.push({
                            id: r.id,
                            segmentation: r.segmentation,
                            subject: r.subject,
                            name: r.name
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
            title: '题库搜索', // set a title
            meta: [{                 // set meta
                name: 'keyWords',
                content: '300万+试题搜索，支持搜索期末 期中 单元测试 月考 周考 中考 模拟 中考同步 试题，数学，物理，化学，英语，语文，地理，生物，政治，支持搜索 选择题 填空题 计算题 解答题 实验与探究题 综合题 作图、实验、探究题 简答题 判断题 应用题，支持 易 较易 中等 较难 难 搜索试题'
            }]
        },
        components: {
            PageView,
            HeadInfo,
            questlist,
            zujuaninfo
        },


        data() {
            return {
                searchmodel: {},
                queryStr: { pageSize: 10 },
                isview: false,
                suggestBSList: [],
                bsvalue: undefined,
                subjectMsgValue: { key: 1 }

            }
        },
        activated() {
            this.queryStr = {}
        },

        methods: {
            ...mapGetters(['zujuanTotal', 'zujuanItem']),
            handlesubjectMsgValue(value) {
                this.searchmodel.subject = value.key
                this.subjectMsgValue = { key: value.key }
            },
            handletagsGrade(value) {
                this.searchmodel.grade = value.toString()
            },
            clearAll() {
                this.isview = false
                this.queryStr = {}
                this.searchmodel = {}
                this.bsvalue = undefined
                this.subjectMsgValue = { key: '' }
            },
            search() {
                this.isview = true
                var queryParam = { pageSize: 10 };
                Object.assign(queryParam, this.queryStr);
                var year = this.searchmodel.year;
                var subject = this.searchmodel.subject;
                if (!subject) {
                    subject = 1
                }
                if (year) {
                    Object.assign(queryParam, { testyear: year })
                } else {
                    Object.assign(queryParam, { testyear: '' })
                }
                if (subject) {
                    Object.assign(queryParam, { subject: subject })
                } else {
                    Object.assign(queryParam, { subject: '' })
                }
                var keyword = this.searchmodel.keyword;
                if (keyword) {
                    Object.assign(queryParam, { keyword: keyword })
                } else {
                    Object.assign(queryParam, { keyword: '' })
                }
                if (this.searchmodel.diff) {
                    Object.assign(queryParam, { diff: this.searchmodel.diff })
                }
                if (this.searchmodel.grade) {
                    Object.assign(queryParam, { grade: this.searchmodel.grade })
                }
                if (this.searchmodel.basicknowid) {
                    Object.assign(queryParam, { basicknowid: this.searchmodel.basicknowid })
                }
                this.queryStr = queryParam;
            },

            handleSearch(value) {
                fetch(value, data => {
                    data.forEach(r => {
                        if (r.segmentation == 1) {
                            r.name = "(小学)" + r.name
                        } else if (r.segmentation == 2) {
                            r.name = "(初中)" + r.name
                        } else if (r.segmentation == 3) {
                            r.name = "(高中)" + r.name
                        }
                    })

                    this.suggestBSList = data;
                });
            },
            handleChange(value) {
                this.bsvalue = value
                this.handleSearch(value)
            },

            handleselect(value) {
                this.searchmodel.basicknowid = value
            }


        },
        computed: {
            getSubject() {
                return SUBJECT
            },
            getTesttype() {
                return TEST_TYPE
            },
            getDIFF() {
                return DIFF
            },
            getGRADE() {
                return GRADE
            },
            getQUEST_TYPE() {
                return QUEST_TYPE
            }

        },

    }
</script>
<style>

</style>