<template>
    <div class="container no-p">

        <ArticleItem :article="newArticle" />
        <div v-for="article in articles" :key="article.id">
            <ArticleItem :article="article" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { emitter, useArticles } from '../store'
import ArticleItem from './ArticleItem.vue'

export default defineComponent({
    setup() {
        let { articles, newArticle } = storeToRefs(useArticles())
        return { articles, newArticle };
    },
    components: { ArticleItem }
})
</script>

<style scoped>
.container {
    overflow-y: scroll;
    scrollbar-width: none;
}

.container::-webkit-scrollbar {
    display: none;
}

.new-article {
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.new-article:hover {
    background-color: lightgray;
}
</style>