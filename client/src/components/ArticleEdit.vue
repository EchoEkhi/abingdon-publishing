<template>
    <div class="container">
        <input type="text" id="title" class="primary" :class="{ 'smart-input': smartInputSelection === 0 }"
            placeholder="Article Title" v-model="article.title">
        <input type="text" id="author" class="primary" :class="{ 'smart-input': smartInputSelection === 1 }"
            placeholder="Article Authors" v-model="article.author">
        <input type="text" id="publisher" class="primary" placeholder="Article Publisher" v-model="article.publisher" />
        <textarea v-if="article.description_html" type="text" id="description" class="primary"
            :class="{ 'smart-input': smartInputSelection === 2 }" placeholder="Article description HTML"
            v-model="article.description_html" />
        <textarea v-else type="text" id="description" class="primary"
            :class="{ 'smart-input': smartInputSelection === 2 }" placeholder="Article description"
            v-model="article.description" />
        <transition appear>
            <p class="message error" v-if="formValidationErrors.includes('description_min_length')">
                Description must be longer than 30 characters.
            </p>
        </transition>
        <div class="flex">
            <select v-model="file" @input="PDFLoading = true; article.page = 1">
                <option :value="{}" disabled selected hidden>Select a file to show a preview</option>
                <option v-for="file in files" :value="file">{{ file.name }}</option>
            </select>
            <input style="width: 15rem" type="number" min="1" :max="maxPage"
                placeholder="Starting page number of the article" v-model="article.page">
            <button style="width: 2rem; margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;"
                :disabled="article.page <= 1" @click="() => { article.page-- }">
                ◀
            </button>
            <button style="width: 2rem; margin-left: 0; border-top-left-radius: 0; border-bottom-left-radius: 0;"
                :disabled="article.page >= maxPage" @click="() => { article.page++ }">
                ▶
            </button>
            <input type="checkbox" name="Featured" id="featured" v-model="article.featured">
            <label for="featured">Featured</label>
            <button :disabled="article.title === '' || formValidationErrors.length !== 0" @click="submit">
                <span v-if="status === 'standby'">{{ article.id === -1 ? 'Create' : 'Save' }} Article</span>
                <span v-else-if="status === 'waiting'">{{ article.id === -1 ? 'Creating' : 'Saving' }} Article...</span>
                <span v-else-if="status === 'success'">Article {{ article.id === -1 ? 'Created' : 'Saved' }}!</span>
                <span v-else-if="status === 'error'">Failed!</span>
            </button>
        </div>
        <div style="width: 40rem; box-shadow: 1px 1px 10px 0 rgba(0, 0, 0, 0.2); margin-left: 0.5rem;">
            <div v-if="PDFLoading"
                style="background-color: white; height: 100vh; text-align: center; padding-top: 2rem;">
                <h1>Loading PDF...</h1>
            </div>
            <div v-if="showPDF && file.path && article.page" :style="{ 'opacity': PDFLoading ? '0' : '1' }">
                <VuePdfEmbed :source="`/api/public/file/${ file.path }`" :page="article.page" class="scroll" ref="pdf"
                    @rendered="rendered" />
            </div>
        </div>
        <ArticleSmartInput :article="article" @submit="submit" @switchSmartInput="switchSmartInput" />
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import { emitter, Article, useArticles, File, useFiles, getPublisher } from '../store'
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
            oldArticle: {} as Article,
            file: {} as File,
            status: "standby" as Status,
            maxPage: 1,
            smartInputSelection: 0,
            PDFLoading: false,
            showPDF: true,
            formValidationErrors: [] as string[]
        };
    },
    methods: {
        validate() {
            this.formValidationErrors = []
            // if the user is the admin, ignore all validation
            if (getPublisher() === 'Admin') return true

            // minimum character requirement for description: 30 chars
            if (this.article.description.length < 30) {
                this.formValidationErrors.push('description_min_length')
            }

            return this.formValidationErrors.length === 0
        },
        async submit() {
            // validate fields
            if (!this.validate()) return

            this.status = "waiting";
            await useArticles().submitArticle(this.article)
                .then(article => {
                    this.article = article
                    this.oldArticle = { ...article }
                    this.article.modified = false
                    this.status = "success"
                })
                .catch(() => this.status = "error")
        },
        rendered() {
            // @ts-ignore
            this.maxPage = this.$refs.pdf.pageCount || 1
            this.PDFLoading = false
        },
        switchSmartInput(n: number) {
            this.smartInputSelection = n
        }
    },
    mounted() {
        this.article = this.newArticle;
        emitter.on("selectArticle", article => {
            this.article = article
            this.oldArticle = { ...article }
            if (this.article.id === -1) {
                this.article.modified = true
            }

            // make PDF viewer work
            let newFile = this.files?.find(file => file.id === article.file_id) || {} as File
            if (this.file != newFile) {
                this.file = newFile
                this.PDFLoading = true
                this.showPDF = false
                setTimeout(() => {
                    this.showPDF = true
                    this.PDFLoading = false
                }, 250)
            }
        })
    },
    watch: {
        article: {
            handler() {
                // determine if the article is modified by checking a reference object
                if (!this.article.modified) {
                    this.article.modified = (
                        this.article.title !== this.oldArticle.title ||
                        this.article.publisher !== this.oldArticle.publisher ||
                        this.article.author !== this.oldArticle.author ||
                        this.article.description !== this.oldArticle.description ||
                        this.article.file_id !== this.oldArticle.file_id ||
                        this.article.page !== this.oldArticle.page ||
                        this.article.featured !== this.oldArticle.featured
                    )
                }

                if (this.article.modified) {
                    this.formValidationErrors = []
                    this.status = "standby"
                }
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

input.primary,
textarea {
    border: none;
    box-shadow: none;
    margin: 0;
    outline: none;
    background: inherit;
}

input#title {
    font-size: 3rem;
}

textarea#description {
    font-size: 1.2rem;
    min-height: 3em;
}

.smart-input {
    outline: 2px solid rgb(0, 90, 164) !important;
}
</style>
