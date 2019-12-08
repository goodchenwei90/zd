<template>
  <transition name="showHeader">
    <div v-if="visible" class="header-animat">
      <a-layout-header v-if="visible" :style="{ padding: '0',background: '#1579e5'}">
        <div :class="['top-nav-header-index']">
          <div class="header-index-wide">
            <div class="header-index-left">
              <logo class="top-nav-header" :show-title="device!=='mobile'" />
              <s-menu v-if="device !== 'mobile'" mode="horizontal" :menu="menus" :theme="theme" />
              <a-icon v-else class="trigger" :type="collapsed ? 'menu-fold' : 'menu-unfold'" @click="toggle" />
            </div>
            <user-menu class="header-index-right" :token="getToken"></user-menu>
          </div>
        </div>
      </a-layout-header>
    </div>
  </transition>
</template>

<script>
  import UserMenu from '../tools/UserMenu'
  import SMenu from '../Menu/'
  import Logo from '../tools/Logo'
  import { mixin } from '@/utils/mixin'
  import store from '../../store'

  export default {
    name: 'GlobalHeader',
    components: {
      UserMenu,
      SMenu,
      Logo
    },
    mixins: [mixin],
    props: {
      mode: {
        type: String,
        // sidemenu, topmenu
        default: 'sidemenu'
      },
      menus: {
        type: Array,
        required: true
      },
      theme: {
        type: String,
        required: false,
        default: 'dark'
      },
      collapsed: {
        type: Boolean,
        required: false,
        default: false
      },
      device: {
        type: String,
        required: false,
        default: 'desktop'
      }
    },
    data() {
      return {
        visible: true,
        oldScrollTop: 0,
        token: ''
      }
    },
    mounted() {
      document.body.addEventListener('scroll', this.handleScroll, { passive: true })
      this.token = store.getters.token
    },
    methods: {
      handleScroll() {
        if (!this.autoHideHeader) {
          return
        }

        const scrollTop = document.body.scrollTop + document.documentElement.scrollTop
        if (!this.ticking) {
          this.ticking = true
          requestAnimationFrame(() => {
            if (this.oldScrollTop > scrollTop) {
              this.visible = true
            } else if (scrollTop > 300 && this.visible) {
              this.visible = false
            } else if (scrollTop < 300 && !this.visible) {
              this.visible = true
            }
            this.oldScrollTop = scrollTop
            this.ticking = false
          })
        }
      },
      toggle() {
        this.$emit('toggle')
      }
    },
    beforeDestroy() {
      document.body.removeEventListener('scroll', this.handleScroll, true)
    },
    computed: {
      getToken() {
        if (store.getters.token) {
          return store.getters.token
        } else {
          return ''
        }
      }
    },
  }
</script>

<style lang="less">
  .header-animat {
    position: relative;
    z-index: 2;
  }

  .showHeader-enter-active {
    transition: all 0.25s ease;
  }

  .showHeader-leave-active {
    transition: all 0.5s ease;
  }

  .showHeader-enter,
  .showHeader-leave-to {
    opacity: 0;
  }

  .navmenu {
    width: 165px;
    height: 64px;
    position: relative;
    line-height: 64px;
    transition: all 0.3s;
    overflow: hidden;
    color: #ffffff;
    font-size: 17px;
  }
</style>