<template>
    <div class="flex" style="height: 85vh;">
        <ArticleList class="left" />
        <ArticleEdit class="right" />
    </div>
    <FileEdit />
    <PreviewFrame />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useArticles } from '../store'
import ArticleList from '../components/ArticleList.vue'
import ArticleEdit from '../components/ArticleEdit.vue';
import FileEdit from '../components/FileEdit.vue';
import PreviewFrame from '../components/PreviewFrame.vue';

export default defineComponent({
    async created() {
        useArticles().fetchArticles()
    },
    setup() {
        return {};
    },
    components: { ArticleList, ArticleEdit, FileEdit, PreviewFrame }
})
</script>

<style scoped>
.flex {
    display: flex;
    align-items: stretch;
}

.left {
    flex: 1
}

.right {
    flex: 3
}
</style>