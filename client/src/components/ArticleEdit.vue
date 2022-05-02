<template>
    <div class="container">
        <input type="text" id="title" placeholder="Article Title" v-model="article.title">
        <input type="text" id="author" placeholder="Article Authors (Alan Bennings & Charles Doyle)"
            v-model="article.author">
        <input type="text" id="publisher" placeholder="Article Publisher" v-model="article.publisher" />
        <textarea type="text" id="description" placeholder="Article description" v-model="article.description" />
        <div class="flex">
            <select v-model="file">
                <option :value="{}" disabled selected hidden>Select File</option>
                <option v-for="file in files" :value="file">{{ file.name }}</option>
            </select>
            <input type="number" min="1" placeholder="Page number" v-model="article.page">
            <button style="width: 2rem; margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;"
                @click="() => { if (article.page > 1) article.page-- }">
                ◀
            </button>
            <button style="width: 2rem; margin-left: 0; border-top-left-radius: 0; border-bottom-left-radius: 0;"
                @click="() => { article.page++ }">
                ▶
            </button>
            <button :disabled="article.title === ''" @click="submit">
                <span v-if="status === 'standby'">{{ article.id === -1 ? 'Create' : 'Save' }} Article</span>
                <span v-else-if="status === 'waiting'">{{ article.id === -1 ? 'Creating' : 'Saving' }} Article...</span>
                <span v-else-if="status === 'success'">Article {{ article.id === -1 ? 'Created' : 'Saved' }}!</span>
                <span v-else-if="status === 'error'">Failed!</span>
            </button>
        </div>
        <VuePdfEmbed v-if="file.path && article.page" :key="file.path" :source="`/api/public/file/${file.path}`"
            :page="article.page"
            style="width: 40rem; box-shadow: 1px 1px 10px 0 rgba(0, 0, 0, 0.2); margin-left: 0.5rem;" class="scroll" />
        <ArticleSmartInput :article="article" @submit="submit" />
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import { emitter, Article, useArticles, File, useFiles } from '../store'
import ArticleSmartInput from './ArticleSmartInput.vue'
import VuePdfEmbed from 'vue-pdf-embed'

type Status = 'standby' | 'waiting' | 'success' | 'error'

export default defineComponent({
    setup() {
        let { newArticle } = storeToRefs(useArticles())
        let { files } = storeToRefs(useFiles())
        return { newArticle, files }
    },
    data() {
        return {
            article: {} as Article,
            file: {} as File,
            status: "standby" as Status
        };
    },
    methods: {
        async submit() {
            this.status = "waiting";
            await useArticles().submitArticle(this.article)
                .then(article => {
                    this.status = "success"
                    this.article = article
                })
                .catch(() => this.status = "error")
        }
    },
    mounted() {
        this.article = this.newArticle;
        emitter.on("selectArticle", article => {
            this.article = article
            this.file = this.files.find(file => file.id === article.file_id) || {} as File
        })
    },
    watch: {
        article: {
            handler() {
                this.status = "standby"
            },
            deep: true
        },
        file() {
            this.article.file_id = this.file.id
            if (this.article.page === undefined) this.article.page = 1
        }
    },
    components: { ArticleSmartInput, VuePdfEmbed }
})
</script>

<style scoped>
.container {
    text-align: left;
    overflow-y: scroll;
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
}

.container::-webkit-scrollbar {
    display: none;
}

button {
    width: 8rem;
}

input,
textarea {
    border: none;
    box-shadow: none;
    margin: 0;
    outline: none;
}

input#title {
    font-size: 3rem;
}

textarea#description {
    font-size: 1.5rem;
    min-height: 3em;
}
</style>
