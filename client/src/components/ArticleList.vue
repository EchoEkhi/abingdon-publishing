<template>
    <div style="position: relative;">
        <div class="menu">
            <Transition>
                <span v-show="selectMode">
                    <button @click="remove" style="padding-left: 7px;" title="Remove articles">⌫</button>
                    <button @click="selectAll" title="Select all">◆</button>
                    <button @click="invert" title="Invert selection">⬗</button>
                </span>
            </Transition>
            <button @click="selectMode = !selectMode" title="Options">⁝</button>
        </div>
        <div class="container no-p" style="height: calc(100% - 4rem)">
            <ArticleItem :article="newArticle" default />
            <div v-for="article in articles" :key="article.id">
                <ArticleItem :article="article" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useArticles } from '../store'
import ArticleItem from './ArticleItem.vue'
import api from '../helpers'

export default defineComponent({
    setup() {
        let { articles, newArticle, selectMode } = storeToRefs(useArticles())
        return { articles, newArticle, selectMode };
    },
    components: { ArticleItem },
    methods: {
        invert() {
            for (let article of this.articles) {
                article.selected = !article.selected
            }
        },
        selectAll() {
            for (let article of this.articles) {
                article.selected = true
            }
        },
        async remove() {
            let ids = [] as number[]
            for (let article of this.articles) {
                if (article.selected) {
                    ids.push(article.id)
                }
            }

            await api.post('article/hide', { ids })
                .then(() => {
                    this.articles = this.articles.filter(article => !ids.includes(article.id))
                })

            this.selectMode = false
        }
    }
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

.menu {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
}

.menu button {
    font-weight: 800;
    border-radius: 1rem;
    width: 2rem;
    height: 2rem;
    padding-top: 6px;
}
</style>