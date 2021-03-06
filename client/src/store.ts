import { defineStore } from 'pinia'
import api from './helpers'

import mitt from 'mitt'
import Cookies from 'js-cookie'

export type Article = {
    id: number,
    title: string,
    author: string,
    description: string,
    description_html: string,
    publisher: string,
    file_id: number,
    page: number,
    modified: boolean | undefined,
    selected: boolean | undefined,
    featured: boolean
}

type Events = {
    selectArticle: Article
}

export const emitter = mitt<Events>();

export function getPublisher() {
    try {
        return JSON.parse(atob(Cookies.get('auth')?.split('.')[1]!)).publisher
    } catch {
        return ''
    }
}

function animateNewArticle() {
    requestAnimationFrame(() => {
        // @ts-ignore
        document.getElementById('new-article').classList.remove('new-article-during')
        // @ts-ignore
        document.getElementById('new-article').classList.replace('new-article-after', 'new-article-before')
        requestAnimationFrame(() => {
            // @ts-ignore
            document.getElementById('new-article').classList.add('new-article-during')
            // @ts-ignore
            requestAnimationFrame(() => document.getElementById('new-article').classList.replace('new-article-before', 'new-article-after'))
        })
    })
}

export const useArticles = defineStore('articles', {
    state: () => ({
        articles: [] as Article[],
        newArticle: { id: -1, title: 'Create New Article', publisher: getPublisher() } as Article,
        selectMode: false
    }),
    actions: {
        async fetchArticles() {
            await api.get('article/read').then(res => {
                this.articles = res.data
            })
        },
        async submitArticle(article: Article) {
            if (article.id === -1) return this.createArticle(article)
            else return this.updateArticle(article)
        },
        async createArticle(article: Article) {
            await api.post('article/create', article).then(res => {
                let article = res.data
                this.articles.unshift(res.data)
                this.newArticle.id = -1
                this.newArticle.publisher = getPublisher()
                this.newArticle.file_id = article.file_id
                this.newArticle.page = article.page + 1
                this.newArticle.title = 'Create New Article'
                this.newArticle.author = ''
                this.newArticle.description = ''
                animateNewArticle()
            })
            return this.newArticle
        },
        async updateArticle(article: Article) {
            await api.post('article/update/' + article.id, article)
            return article
        }
    }
})

export type File = {
    id: number,
    name: string,
    path: string
    // todo file blob
}

export const useFiles = defineStore('files', {
    state: () => ({
        files: [] as File[],
        newFile: { id: -1 } as File
    }),
    actions: {
        async fetchFiles() {
            await api.get('file/read').then(res => {
                this.files = res.data
            })
        },
        async submitFile(file: File) {
            if (file.id === -1) return this.createFile(file)
            else return this.updateFile(file)
        },
        async createFile(file: File) {
            return await api.post('file/create', file).then(res => {
                this.files?.unshift(res.data)
                this.newFile = { id: -1 } as File
                return res.data
            })
        },
        async updateFile(file: File) {
            return await api.post('file/update/' + file.id, file)
        }
    }
})