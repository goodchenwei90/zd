<template>
    <a-table :columns="columns" :rowKey="record => record.id" :dataSource="data" :pagination="pagination"
        :loading="loading" @change="handleTableChange">
        <template slot="name" slot-scope="name">
            {{name.first}} {{name.last}}
        </template>
    </a-table>
</template>
<script>

    import { getPayResultList } from '@/api/manage'
    const columns = [{
        title: '订单号',
        dataIndex: 'ordernum',
        width: '20%'
    },
    {
        title: '商品',
        dataIndex: 'productitem',
        width: '20%'
    },
    {
        title: '支付金额',
        dataIndex: 'priceMsg',
        width: '20%',
    },
    {
        title: '支付状态',
        dataIndex: 'statusMsg',
        width: '15%',
    },
    {
        title: '创建时间',
        dataIndex: 'ctime',
    }];

    export default {
        mounted() {
            this.fetch()
        },
        data() {
            return {
                data: [],
                pagination: {pageSize:5},
                loading: false,
                columns,
            }
        },
        methods: {
            handleTableChange(pagination, filters, sorter) {
              
                const pager = { ...this.pagination };
                pager.current = pagination.current;
                this.pagination = pager;
               
                this.fetch({ page: pagination.current, pageSize: pagination.pageSize });
            },
            fetch(params={}) {
                console.log('params:', params);
                this.loading = true
                getPayResultList({ pageSize: params.pageSize, curPage: params.page }).then((data) => {
                    if (data.ret == 0) {
                        const pagination = { ...this.pagination };
                        pagination.total = data.datas.total;
                        this.loading = false;
                        if(data.datas.list){
                            data.datas.list.forEach(element => {
                                element.priceMsg = this.Fen2Yuan(element.payprice)+"元";
                                if(element.status==0){
                                    element.statusMsg ='支付完成'
                                }else if(element.status==1){
                                    element.statusMsg ='待支付'
                                }else{
                                    element.statusMsg =''
                                }
                            });
                        }
                        this.data = data.datas.list;
                        this.pagination = pagination;
                    }

                });
            },
            Fen2Yuan(num) {
                if (typeof num !== "number" || isNaN(num)) return null;
                return (num / 100).toFixed(2);
            },
        },
    }
</script>