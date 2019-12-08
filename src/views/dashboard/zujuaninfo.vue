<!--  组卷的数量提示(试题篮)  -->
<template>
    <div>
        <a-card title="组卷中心" :bordered="false" :body-style="{padding: 0}">
            <a slot="extra"> <router-link to="/zj/info">{{zujuanTotal()}}/{{zjtotal}}</router-link></a>
            <div style=" padding-top:20px;padding-bottom: 20px">
                <a-badge :count="item.count" v-for=" (item,index) in  zujuanItem()">
                    <a href="#" style="padding-left:20px"
                        @click="viewTypeQuest(item.type,item.title)">{{item.title}}</a>
                </a-badge>

            </div>
        </a-card>

        <div>
            <a-modal :title="modalTitle" style="top: 20px;" :visible="modalVisible" :width="700" :footer="null"
                @ok="() => setModalVisible(false)" @cancel="() => setModalVisible(false)">
                <!-- 显示组卷类型信息 -->
                <questlist  :zujuan="zujuan" ></questlist>
            </a-modal>
        </div>

    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import questlist from '@/views/dashboard/questlist'
    export default {
        metaInfo: {
            title: '组卷中心，支持用户试题篮，错题组卷，自定义试卷名，大题名，小题数量顺序', 
        },
        components: {
            questlist
        },
        data() {
            return {
                modalVisible: false,
                zjtotal: 40,
                modalTitle: '',
                zujuan: -1,
                watchFlag : 1
            }
        },
        methods: {
            ...mapGetters(['zujuanTotal', 'zujuanItem']),
            setModalVisible(modalVisible) {
                this.modalVisible = modalVisible;
            },
            // 查看类型下试题item.type(相同type点击不会刷新数据，需要增加一个变量更新)
            viewTypeQuest(type, title) {
                this.modalTitle = title;
                this.setModalVisible(true);
                this.watchFlag ++;
                this.zujuan = type+"_"+ this.watchFlag;
            }
        },
    }
</script>