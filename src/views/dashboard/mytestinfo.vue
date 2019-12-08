<template>
    <div style="background-color: #FFF">
        <a-card style="text-align: center;border: 0">
            <a-input-search placeholder="请输入试卷名称" style="width: 50%" @search="onSearch" v-model="searchmodel.testname"
                size="large">
                <a-button slot="enterButton">搜索</a-button>
            </a-input-search>
        </a-card>
        <a-card style="margin-bottom: 24px;" :bordered="false" :body-style="{padding: 0}">
            <a-list itemLayout="vertical" size="large" :pagination="pagination" :dataSource="listData" bordered>
                <a-list-item slot="renderItem" slot-scope="item, index">
                    <div slot="actions">收录:<span style="padding-left: 5px">{{item.createtime.substring(0,10)}}</span>
                    </div>
                    <div slot="actions">学科：{{item.subjectMsg}}</div>
                    <div slot="actions" @click="handleDelete(item.id)"><span style="color:red">删除</span></div>
                    <div slot="actions" @click="updateZujuan(item)"><span style="color:red">修改</span></div>
                    <router-link target="_blank" :to="{path:'/test/qlist',query:{v:entrypt(item.id)}}"
                        active-class="active">
                        <span v-if="item.testname.indexOf(searchmodel.testname) > -1">
                            {{item.testname.substr(0, item.testname.indexOf(searchmodel.testname))}}
                            <span style="color: #f50">{{searchmodel.testname}}</span>
                            {{item.testname.substr(item.testname.indexOf(searchmodel.testname) + searchmodel.testname.length)}}
                        </span>
                        <span v-else>
                            {{item.testname}}
                        </span>
                    </router-link>
                </a-list-item>
            </a-list>
        </a-card>

        <a-modal :centered="true" :visible="modalVisible" :footer="null" :destroyOnClose="true" :maskClosable="false"
            @ok="() => setModalVisible(false)" @cancel="() => setModalVisible(false)">
            <div style="text-align: center">
                试卷名称 <a-input v-model="testname"></a-input>
            </div>
            <div style="padding-top: 20px;text-align: center">
                <a-button type="primary" @click="submitUpdateZj()">提交</a-button>
            </div>
        </a-modal>

    </div>
</template>
<script>
    import { queryTeacherTestInfo, deleteTeacherTestInfo, updateZujuan } from '@/api/manage'
    import { JSEncrypt } from 'jsencrypt'
    import { PUBLIC_KEY } from '@/store/mutation-types'
    export default {
        props: {
            refresh: {
                type: String,
                default: ''
            },
        },
        mounted() {
            this.queryTestInfo()
        },
        data() {
            return {
                listData: [],
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
                searchmodel: {},
                modalVisible: false,
                testname: '',
                testId: ''
            }
        },
        methods: {

            updateZujuan(item) {
                this.modalVisible = true
                this.testname = item.testname
                this.testId = item.id
            },

            submitUpdateZj() {
                updateZujuan({id:this.entrypt(this.testId),testName:this.testname}).then(r => {
                    if(r.ret!=0){
                        this.$message.error("修改失败 ，请稍后再试")
                    }else{
                        this.modalVisible = false
                        this.queryTestInfo()
                    }
                })

            },

            setModalVisible(modalVisible) {
                this.modalVisible = modalVisible
            },
            queryTestInfo() {
                queryTeacherTestInfo(this.queryParam).then(res => {
                    var d = res.datas.list;
                    this.listData = d;
                    this.pagination.total = res.datas.total;
                })
            },
            onSearch() {

                if (this.searchmodel.testname) {
                    this.queryParam.testName = this.searchmodel.testname
                }
                this.queryTestInfo()
            },
            handleDelete(testid) {
                const that = this
                this.$confirm({
                    title: '提示',
                    content: '真的要删除该试卷吗 ?',
                    onOk() {
                        return deleteTeacherTestInfo({ testId: testid }).then(res => {
                            if (res.ret == 0) {
                                that.queryTestInfo();
                            } else {
                                that.$message.error({
                                    title: '错误',
                                    description: res.retInfo
                                })
                            }
                        }).catch(err => {
                            that.$message.error({
                                title: '错误',
                                description: err.message
                            })
                        })
                    },
                    onCancel() {
                    }
                })
            },
            entrypt(val) {
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(PUBLIC_KEY);
                var data = encrypt.encrypt(val + '');
                return data
            }
        },

        watch: {
            'refresh': function (val) {
                this.queryTestInfo();

            }
        },
    }

</script>