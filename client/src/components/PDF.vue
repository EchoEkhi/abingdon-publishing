<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import { VuePdfPropsType } from 'vue3-pdfjs/components/vue-pdf/vue-pdf-props'; // Prop type definitions can also be imported
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';


export default defineComponent({
    name: 'Home',
    components: { VuePdf },
    setup() {
        const pdfSrc = ref<VuePdfPropsType['src']>('http://localhost:3000/api/public/file/the-martlet-issue-34.pdf')
        const numOfPages = ref(0)

        onMounted(() => {
            const loadingTask = createLoadingTask(pdfSrc.value)
            loadingTask.promise
                .then((pdf: PDFDocumentProxy) => {
                    numOfPages.value = pdf.numPages
                })
        })
        return {
            pdfSrc,
            numOfPages
        }
    }
});
</script>

<template>
    <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" />
</template>