<template>
    <div class="article" @click="selectArticle" :class="{ selected }">
        <div class="breadcrumb">
            <span class="author">{{ article.author }}</span>
            <span v-if="article.author && article.publisher"> - </span>
            <span class="publisher">{{ article.publisher }}</span>
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
        return { article: props.article as Article }
    },
    mounted() {
        emitter.on("selectArticle", () => {
            this.selected = false
        })
        this.selected = this.default
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

.article.selected {
    position: relative;
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