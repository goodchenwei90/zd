<template>
  <div>

    <div v-for="(item,index) in types" style="padding-top:20px">
      <span> <b>{{item.title}}</b> </span>
      <a style="padding-left:10px" v-for="(item2, index2) in item.list"
        @click="queryParam(item2.type,item.type,index2,item2.title)"
        :class="activeClassd == index2 ? 'active':'unactive'">
        {{item2.title}}
      </a>
    </div>


    <div v-for="(item,index) in diff" style="padding-top:10px">
      <span> <b>{{item.title}}</b> </span>
      <a style="padding-left:20px" v-for="(item2, index2) in item.list"
        @click="queryParam(item2.type,item.type,index2,item2.title)"
        :class="diffActived == index2 ? 'active':'unactive'">
        {{item2.title}}
      </a>
    </div>


  </div>
</template>


<script>

  import { mapGetters } from 'vuex'
  export default {
    props: {
      activeClass: {
        type: Number,
        default: -1
      },
      diffActive: {
        type: Number,
        default: -1
      },
    },
    data() {
      return {
        activeClassd: this.activeClass,
        diffActived: this.diffActive,
        types: [],
        diff: [
          {
            title: "难度", list: [
              { id: 0, title: "全部", type: '', index: 17 },
              { id: 1, title: "易", type: '>0.7|<=1', index: 12 },
              { id: 2, title: "较易", type: '>0.5|<=0.7', index: 13 },
              { id: 3, title: "中等", type: '>0.3|<=0.5', index: 14 },
              { id: 4, title: "较难", type: '>=0.2|<=0.3', index: 15 },
              { id: 5, title: "难", type: '<0.2', index: 16 }
            ], type: 2
          }
        ]

      }

    },
    methods: {
      ...mapGetters(['zujuanTotal', 'zujuanItem']),
      queryParam(qtype, queryType, index, title) {
        if (queryType == 2) {
          this.diffActived = index
        } else if (queryType == 1) {
          this.activeClassd = index;
        }
        this.$emit('setQueryParam', qtype, queryType, title)
      }
    },
    mounted() {

      var all = [{ title: "全部", type: '', list: [] }];

      this.zujuanItem().forEach(element => {
        all.push(element);
      });

      this.types = [
        {
          title: "题型", list: all, type: 1
        }
      ];

    },
    watch: {
      'activeClass':function(val){
         this.activeClassd =-1;
      },
      'diffActive':function(val){
         this.diffActived =-1;
      }
    },
  }
</script>
<style>
  .active {
    color: #000;
  }

  .unactive {
    color: blue;
  }
</style>