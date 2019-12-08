<template>
  <page-view :title="false">
    <div slot="headerContent">


      <div v-for="(item1,index1) in  subjectView">
        <a-tag color>{{item1.title}}</a-tag>
        <a-tag v-for="(item,index) in item1.list" :class="activeClass == item.index ? 'active':''" :key="index"
          @click="gotosubject(item.index,index1,index)">
          {{ item.message }}</a-tag>
      </div>
    </div>
    <div slot="extra">
      <a-row>
        <a-col :span="7">
          <head-info title="小学题量" content="50万+" :center="false" :bordered="false" />
        </a-col>
        <a-col :span="7">
          <head-info title="初中题量" content="200万+" :center="false" :bordered="false" />
        </a-col>
        <a-col :span="7">
          <head-info title="高中题量" content="50万+" :center="false" />
        </a-col>
        <a-col :span="3">
            <head-info title="错题本小程序"  :center="false" />
           <img  src="@/assets/pxb.jpg" width="100px" height="100px"/> 
        </a-col>
      </a-row>
    </div>
    <div style="float:left;width: 100%;">
      <a-row :gutter="40">
        <a-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">

          <a-card title="考点列表" :bordered="false" :body-style="{padding: 0}">
            <konw-tree :treeData="treeData" @showQuest="showQuest" :defaultExpandedKeys="defaultExpandedKeys">
            </konw-tree>
          </a-card>
        </a-col>


        <a-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24">
          <a-card style="margin-bottom: 24px;" :bordered="false" :body-style="{padding: 0}">
            <quest-search-header style="padding-left:20px" @setQueryParam="setQueryParam"
              :activeClass="queryactiveClass" :diffActive="querydiffActive"></quest-search-header>
            <selected-header :searchValue="queryStrMsg"
              style="padding-left:20px;padding-bottom: 10px;padding-top: 10px">
            </selected-header>
            <questlist :queryString="queryStr"></questlist>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <div style="position: fixed;top:235px;height: 100px;width:150px;right:20px">
      <zujuaninfo></zujuaninfo>
    </div>
  </page-view>

</template>

<script>
  import { timeFix } from '@/utils/util'
  import { mapGetters } from 'vuex'

  import { PageView } from '@/layouts'
  import HeadInfo from '@/components/tools/HeadInfo'
  import konwTree from '@/views/dashboard/KnowTree'
  import questSearchHeader from '@/views/dashboard/questSearchHeader'
  import selectedHeader from '@/views/dashboard/selectedHeader'
  import questlist from '@/views/dashboard/questlist';
  import zujuaninfo from '@/views/dashboard/zujuaninfo';
  import { getBasicKnowTreeList } from '@/api/manage'
  import { getSubjectMsg } from '@/utils/util'


  export default {
    components: {
      PageView,
      HeadInfo,
      konwTree,
      questSearchHeader,
      questlist,
      zujuaninfo,
      selectedHeader

    },
    data() {
      return {
        activeClass: 3,
        queryactiveClass: -1,
        querydiffActive: -1,
        top: 10,
        bottom: 300,
        zjtotal: 40,
        subjectView: [
          {
            title: "小学", segmentation: 1, list: [
              { message: '数学', id: 1, index: 1 }, { message: '英语', id: 4, index: 2 }
            ]
          },
          {
            title: "初中", segmentation: 2, list: [
              { message: '数学', id: 1, index: 3 },
              { message: '物理', id: 2, index: 4 },
              { message: '化学', id: 3, index: 5 },
              { message: '英语', id: 4, index: 6 }
            ]
          },
          {
            title: "高中", segmentation: 3, list: [
              { message: '数学', id: 1, index: 7 },
              { message: '物理', id: 2, index: 8 },
              { message: '化学', id: 3, index: 9 },
              { message: '英语', id: 4, index: 10 },
              { message: '生物', id: 5, index: 11 },
              { message: '地理', id: 6, index: 12 }
            ]
          }

        ],

        timeFix: timeFix(),
        avatar: '',
        user: {},
        projects: [],
        loading: true,
        radarLoading: true,
        activities: [],
        teams: [],
        radarData: [],
        kid: '',
        treeData: [],
        defaultExpandedKeys: [],
        //默认初中数学，知识点搜索条件
        queryparameter: {
          segmentation: 2,
          subject: 1
        },
        //搜索试题(默认)
        queryStr: { subject: 1, pageSize: 10, segmentation: 2 },
        //搜索后的条件显示(默认)
        queryStrMsg: {
          sujectSelMsg: '数学',
          segmentationMsg: '初中',
          diffMsg: '',
          typeMsg: ''
        }
      }
    },
    computed: {
      userInfo() {
        return this.$store.getters.userInfo
      }
    },
    created() {
      this.user = this.userInfo
      this.avatar = this.userInfo.avatar

      /***********************
* 函数：判断滚轮滚动方向
* 返回：滚轮方向 1：向上 -1：向下
*************************/
      /*   var scrollFunc = function (e) {
          var direct = 0;
          e = e || window.event;
          console.log("Screen coordinates " + event.screenX + ' , ' + event.screenY);
          if (e.wheelDelta) {//IE/Opera/Chrome
            console.log(e.wheelDelta)
          } else if (e.detail) {//Firefox
            console.log(e.detail)
          }
        }
        if (document.addEventListener) {
          document.addEventListener('DOMMouseScroll', scrollFunc, false);
        }//W3C
        window.onmousewheel = document.onmousewheel = scrollFunc;//IE/Opera/Chrome/Safari */

    },
    mounted() {
      this.getTreeBasicKnow();
    },
    activated() {

    },
    methods: {
      ...mapGetters(['zujuanTotal', 'zujuanItem']),
      gotosubject(colorIndex, index1, index2) {
        this.activeClass = colorIndex;
        //获取知识点树
        this.queryparameter.segmentation = this.subjectView[index1].segmentation;
        this.queryparameter.subject = this.subjectView[index1].list[index2].id;
        this.getTreeBasicKnow();
        this.queryStr = { subject: this.queryparameter.subject, pageSize: 10, segmentation: this.queryparameter.segmentation }
        this.queryStrMsg = { sujectSelMsg: getSubjectMsg(this.queryparameter.subject) }
        switch (this.queryparameter.segmentation) {
          case 1:
            this.queryStrMsg.segmentationMsg = '小学'
            break;
          case 2:
            this.queryStrMsg.segmentationMsg = '初中'
            break;
          case 3:
            this.queryStrMsg.segmentationMsg = '高中'
            break;
          default:
            break;
        }

      },
      showQuest(kid, title) {
        //点击树查询试题
        this.queryStr = { subject: this.queryparameter.subject, basicknowid: kid, pageSize: 10 }
        this.queryStrMsg = { sujectSelMsg: getSubjectMsg(this.queryparameter.subject) }
        //变化，更新searchhear
        this.queryactiveClass = parseInt(kid);
        this.querydiffActive = parseInt(kid);
      },

      genSoltsTitle(tree) {
        tree.scopedSlots = { title: 'title' }
        if (tree.children) {
          tree.children.forEach(element => {
            this.genSoltsTitle(element);
          });
        }
      },

      getTreeBasicKnow() {
        getBasicKnowTreeList(this.queryparameter).then(res => {
          this.treeData = res.datas;

          this.treeData.forEach(item => {
            this.genSoltsTitle(item);
          })
        }).catch(error => {
          if (error.message.indexOf('Network Error') > -1) {
            this.$message.error('无法连接到服务器，请稍后再试', 2);
          }
        })
      },
      setQueryParam(qtype, queryType, title) {
        var queryParam = {};
        var qpmsg = {}
        Object.assign(queryParam, this.queryStr);
        Object.assign(qpmsg, this.queryStrMsg);
        if (queryType == 1) {
          //题型
          queryParam.curPage = 1
          Object.assign(queryParam, { type: qtype });
          Object.assign(qpmsg, { typeMsg: title });

        } else if (queryType == 2) {
          //难度
          queryParam.curPage = 1
          Object.assign(queryParam, { diff: qtype });
          Object.assign(qpmsg, { diffMsg: title });
        }

        this.queryStr = queryParam;
        this.queryStrMsg = qpmsg
      }

    }
  }
</script>

<style lang="less" scoped>
  .subjecttag {
    height: 24px;
    padding-top: 10px;
  }

  .ant-tag {
    margin-bottom: 8px;
    font-size: 16px;
    width: 50px;
    text-align: center;
  }

  .active {
    color: red;
  }

  .unactive {
    color: #000;
  }
</style>