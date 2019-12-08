<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <a-spin :spinning="this.$store.state.loadding" tip="加载中...">
        <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
        <router-view />
      </a-spin>
    </div>
  </a-locale-provider>
</template>

<script>
  import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
  import { AppDeviceEnquire } from '@/utils/mixin'
  import { mapActions } from 'vuex'

  export default {
    mixins: [AppDeviceEnquire],
    data() {
      return {
        locale: zhCN
      }
    },
    methods: {
      ...mapActions(['lsloadtostate']),
    },
    mounted() {
      // 加载本地组卷数据到state
      this.lsloadtostate();
      document.body.onselectstart = document.body.ondrag = function () {
        return false;
      }
    }
  }
</script>
<style>
  #app {
    height: 100%;
  }
</style>