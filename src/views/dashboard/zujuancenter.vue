<template>
    <page-view :title="false">

        <div style="background-color: #FFF">
            <a-tabs :activeKey="customActiveKey" size="large" @tabClick="handleTabClick">
                <a-tab-pane tab="试题篮" key="basket">
                    <userzujuan></userzujuan>
                </a-tab-pane>
                <a-tab-pane tab="学生错题" key="ctb">
                    <studentctblist :refresh="refreshStu"></studentctblist>

                </a-tab-pane>
                <a-tab-pane tab="我的组卷" key="my">
                    <!--  我的组卷，通过传入属性展示  -->
                    <mytestinfo :refresh="refreshMy"></mytestinfo>

                </a-tab-pane>
            </a-tabs>
        </div>
    </page-view>
</template>

<script>


    import { PageView } from '@/layouts'
    import HeadInfo from '@/components/tools/HeadInfo'
    // 试题篮组件
    import userzujuan from '@/views/dashboard/userzujuan'
    import mytestinfo from '@/views/dashboard/mytestinfo'
    import studentctblist from '@/views/dashboard/studentctblist'
    import { mapActions, mapGetters } from 'vuex'
    export default {
        components: {
            PageView,
            HeadInfo,
            userzujuan,
            mytestinfo,
            studentctblist
        },

        data() {
            return {
                customActiveKey: 'basket',
                refreshStu: new Date().getTime()+'',
                refreshMy: new Date().getTime()+'',
            }
        },
        methods: {

            handleTabClick(key) {
                this.customActiveKey = key
                if (key == 'my') {
                    this.refreshMy = new Date().getTime() + '';
                } else if (key === 'ctb') {
                    this.refreshStu = new Date().getTime() + '';
                }

            }
        },
        mounted() {

        },
        activated() {
            this.activeKey = 0
        }

    }
</script>