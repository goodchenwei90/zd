<template>

    <div>
        <a-modal :centered="true" :visible="visible" :footer="null" :destroyOnClose="true" :maskClosable="false"
            @ok="() => closeDialog(false)" @cancel="() => closeDialog(false)">
            <login @refreshUser="refreshUser"></login>
        </a-modal>
    </div>

</template>
<script>
    import login from '@/views/user/Login'
    import store from '@/store/'
    import { mapActions, mapGetters } from 'vuex'
    export default {
        components: {
            login
        },
        data() {
            return {
                modalVisible: this.visible
            }
        },
        methods: {
            ...mapActions(['setStatus']),
            refreshUser() {
                this.setStatus(0);
            },
            closeDialog() {
                this.setStatus(0);
            },
        },
        computed: {
            visible() {
                var status = store.getters.userStatus;
                if (status == 1) {
                    //被挤出，重新登录
                    return true;
                } else {
                    return false;
                }



            }
        },
    }
</script>