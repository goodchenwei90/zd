<template>
    <div>

        <a-modal title="打印确认" :centered="true" :visible="visible" :destroyOnClose="true" :maskClosable="false"
            @ok="print" @cancel="() => closeDialog(false)">
            <a-radio-group v-model="answer" buttonStyle="solid">
                <a-radio-button :value="1">打印试卷</a-radio-button>
                <a-radio-button :value="2">打印答案</a-radio-button>
            </a-radio-group>
        </a-modal>

    </div>


</template>
<script>
    import { printTest } from '@/api/manage'
    import { entrypt } from '@/utils/util'
    import { mapActions } from 'vuex'
    export default {
        name: 'testprint',
        props: {
            info: {
                type: Object,
                default: {}
            },

            visibleflag: {
                type: String,
                default: ''
            }

        },
        data() {
            return {
                visible: false,
                test: this.info,
                answer: 1,
            }
        },

        methods: {
            ...mapActions(['setStatus']),
            closeDialog(visible) {
                this.visible = visible
            },
            print() {
                this.visible = false
                this.progressVisible = true
                const testid = this.test.id;
                var rsaData = entrypt(testid);
                var aflag = false;
                if (this.answer == 2) {
                    aflag = true
                }
                var filename = this.test.testname + '.pdf'
                printTest({ id: rsaData, answer: aflag }, (e) => {
                    //下载进度处理
                    var complete = (e.loaded / e.total * 100 | 0)
                    this.percent = complete

                }).then(res => {
                    // 文件下载

                    var blob = new Blob([res], { type: 'application/pdf;charset-UTF-8' });
                    if (!blob) {
                        this.setStatus(1)
                        return false;
                    } else {
                        if (blob.size == 0) {
                            this.setStatus(1)
                            return false;
                        }
                    }
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE version
                        window.navigator.msSaveBlob(blob, filename);

                    } else {
                        var downloadElement = document.createElement('a');
                        var href = window.URL.createObjectURL(blob); // 创建下载的链接
                        downloadElement.href = href;
                        downloadElement.download = filename; // 下载后文件名
                        document.body.appendChild(downloadElement);
                        downloadElement.click(); // 点击下载
                        window.URL.revokeObjectURL(href); // 释放掉blob对象
                    }

                })

            }
        },
        watch: {
            info(newValue, oldValue) {
                this.test = newValue
            },
            visibleflag(newValue, oldValue) {
                this.visible = true
            }

        }
    }

</script>