<template>
    <div class="article" @click="selectArticle">
        <div class="breadcrumb">
            <span class="author">{{ article.author }} - </span><span class="publisher">{{ article.publisher }}</span>
        </div>
        <p class="title">{{ article.title }}</p>
        <p class="description">{{ article.description }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { emitter, Article } from '../store'

export default defineComponent({
    props: {
        article: {}
    },
    methods: {
        selectArticle() {
            emitter.emit('selectArticle', this.article)
        }
    },
    setup(props) {
        return { article: props.article as Article }
    }
})
</script>

<style scoped>
.article {
    text-align: left;
    padding-inline: 1rem;
    min-height: 6rem;
    cursor: pointer;
}

.article:hover {
    background-color: lightgray;
}

.article .breadcrumb {
    padding-top: 0.5rem;
    font-size: 0.6rem;
    opacity: 0.8;
}

.article .publisher {
    font-size: 0.6rem;
    text-transform: uppercase;
    margin-bottom: 0;
}

.article .title {
    font-size: 1.2rem;
    margin-top: 0.2rem;
    margin-bottom: 0;
    color: rgb(0, 90, 164);
}

.article .description {
    margin-top: 0.2rem;
    font-size: 0.8rem;
    height: 2.8rem;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 0;
}
</style>