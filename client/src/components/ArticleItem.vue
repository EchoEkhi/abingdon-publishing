<template>
    <div class="article" :class="{ selected }">
        <div @click="selectArticle">
            <div class="breadcrumb">
                <span v-if="article.featured" class="featured">FEATURED</span>
                <span v-if="article.featured && (article.author || article.publisher)"> - </span>
                <span class="author">{{ article.author }}</span>
                <span v-if="article.author && article.publisher"> - </span>
                <span class="publisher">{{ article.publisher }}</span>
                <span v-if="article.modified" class="modified"> - Not Saved</span>
            </div>
            <p class="title">{{ article.title }}</p>
            <div v-if="article.description_html" v-html="article.description_html"></div>
            <p v-else class="description">{{ article.description }}</p>
        </div>
        <transition>
            <div v-show="showCheckbox" class="tickbox" :class="{ selected: article.selected }"
                @click="article.selected = !article.selected">
                <input type="checkbox" v-model="article.selected">
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import { emitter, Article, useArticles } from '../store'

export default defineComponent({
    props: {
        article: {},
        default: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selected: false
        }
    },
    methods: {
        selectArticle() {
            emitter.emit('selectArticle', this.article)
            this.selected = true
        }
    },
    setup(props) {
        let { selectMode } = storeToRefs(useArticles())
        return { article: props.article as Article, selectMode, default: props.default }
    },
    mounted() {
        emitter.on("selectArticle", () => {
            this.selected = false
        })
        this.selected = this.default
    },
    computed: {
        showCheckbox() {
            return this.selectMode && !this.default
        }
    }
})
</script>

<style scoped>
.article {
    text-align: left;
    padding-inline: 1rem;
    height: 5.5rem;
    margin-bottom: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    position: relative;
}

.article:hover {
    background-color: lightgray;
}

.article.selected {
    position: relative;
    outline-offset: -2px;
    outline: 2px solid rgb(0, 90, 164);
    border-radius: 1rem;
}

.article.selected::before {
    content: "\A";
    border-style: solid;
    border-width: 10px 15px 10px 0;
    border-color: transparent rgb(0, 90, 164) transparent transparent;
    position: absolute;
    left: 0;
    top: 1.5rem;
    transform: rotate(180deg) scale(0.5);
}

.article .breadcrumb {
    padding-top: 0.5rem;
    font-size: 0.6rem;
    color: #888;
}

.article .featured {
    color: #d64385;
    font-weight: bold;
}

.article .publisher {
    font-size: 0.6rem;
    text-transform: uppercase;
    margin-bottom: 0;
}

.article .modified {
    color: red
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

.tickbox {
    position: absolute;
    height: 100%;
    width: 6rem;
    top: 0;
    right: 0;
    z-index: 5;
    display: flex;
    background: linear-gradient(90deg, #11111100 0%, rgb(0, 90, 164) 100%);
}

.tickbox.selected {
    background: linear-gradient(90deg, #11111100 0%, rgb(150, 0, 0) 100%);
}

.tickbox input {
    width: 1.5rem;
    height: 1.5rem;
    align-self: center;
    margin: auto;
}
</style>