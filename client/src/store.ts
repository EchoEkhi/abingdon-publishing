import { defineStore } from 'pinia'
import api from './helpers'

import mitt from 'mitt'
import Cookies from 'js-cookie'

export type Article = {
    id: number,
    title: string,
    author: string,
    description: string,
    publisher: string,
    file_id: number,
    page: number
}

type Events = {
    selectArticle: Article
}

export const emitter = mitt<Events>();

function getPublisher() {
    try {
        return JSON.parse(atob(Cookies.get('auth')?.split('.')[1]!)).publisher
    } catch {
        return ''
    }
}

export const useArticles = defineStore('articles', {
    state: () => ({
        articles: [] as Article[],
        newArticle: { id: -1, publisher: getPublisher() } as Article
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
                this.newArticle = {
                    id: -1,
                    publisher: getPublisher(),
                    file_id: article.file_id,
                    page: article.page + 1
                } as Article
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
                this.files.unshift(res.data)
                this.newFile = { id: -1 } as File
                return res.data
            })
        },
        async updateFile(file: File) {
            return await api.post('file/update/' + file.id, file)
        }
    }
})