<template>
  <div>
    <a-input-search style="margin-bottom: 8px" placeholder="搜素知识点" @search="onChange" @pressEnter="onChange" />
    <a-tree showLine @select="onSelect" :treeData="generateData" @expand="onExpand" :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent">
      <template slot="title" slot-scope="{title,key}">
        <span v-if="title.indexOf(searchValue) > -1">
          {{title.substr(0, title.indexOf(searchValue))}}
          <span style="color: #f50">{{searchValue}}</span>
          {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
        </span>
        <span v-else>
          {{title}}
        </span>
      </template>
    </a-tree>
  </div>
</template>
<script>

  const dataList = []
  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const key = node.key
      dataList.push({ key, title: node.title })
      if (node.children) {
        generateList(node.children, node.key)
      }
    }
  }


  const getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }

  export default {
    props: {
      treeData: {
        type: Array
      }

    },

    data() {
      return {
        expandedKeys: [],
        searchValue: '',
        autoExpandParent: true,
        selectKey: 0
      }
    },


    mounted() {
      //treedata增加 scopedSlots: { title: 'title' }}

    },
    computed: {
      generateData() {
          generateList(this.treeData);
          return this.treeData
      }
    },

    methods: {
      onSelect(selectedKeys, info) {
        this.selectKey = selectedKeys[0]
        this.searchValue = '';
        this.$emit('showQuest', selectedKeys[0], info)
      },
      onChange(e) {
        const value = e.target.value
        const expandedKeys = dataList.map((item) => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, this.generateData)
          }
          return null
        }).filter((item, i, self) => item && self.indexOf(item) === i)

        this.expandedKeys = expandedKeys;
        this.searchValue = value;
        this.autoExpandParent = true;

      },
      onExpand(expandedKeys) {
        this.expandedKeys = expandedKeys
        this.autoExpandParent = false
      }
    }

  }
</script>