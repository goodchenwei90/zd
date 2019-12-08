<template>
    <div>

        <b style="padding-right: 20px">您的搜索内容</b>
        <a-tag v-for="(item,index) in searchList">{{item}}</a-tag>
    </div>


</template>

<script>

    export default {
        props: {
            searchValue: {
                type: Object,
                default: null
            }
        },

        watch: {
            "searchValue": function (val) {

            }
        },
        data() {
            return {
                searchList: []
            }
        },
        methods: {
            setMsg() {
                if (this.searchValue) {
                    if (this.searchValue.sujectSelMsg) {
                        this.searchList.push(this.searchValue.sujectSelMsg);
                    }
                    if (this.searchValue.segmentationMsg) {
                        this.searchList.push(this.searchValue.segmentationMsg);
                    }
                    if (this.searchValue.diffMsg && this.searchValue.diffMsg!='全部') {
                        this.searchList.push(this.searchValue.diffMsg);
                    }
                    if (this.searchValue.typeMsg && this.searchValue.typeMsg!='全部') {
                        this.searchList.push(this.searchValue.typeMsg);
                    }
                }
            }
        },
        mounted() {
            this.setMsg();
        },
        watch: {
            searchValue(newValue, oldValue) {
                this.searchList = [];
                this.setMsg()
            }
        },
    }
</script>

<style>
    .ant-tag {
        margin-bottom: 8px;
        font-size: 16px;
        text-align: center;
    }
</style>