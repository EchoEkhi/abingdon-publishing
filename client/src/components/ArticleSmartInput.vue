<template>
    <div v-show="onPDF" style="position: absolute;" id="article-smart-input" class="tooltip">
        <p style="margin-bottom: 0.5rem">
            Smart input is active. Right click to redo last field.
        </p>
        <p><b style="color: rgb(0, 90, 164)">{{ ['Title', 'Author', 'Description'][state] }}</b>:
            {{ text }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Article } from '../store'

export default defineComponent({
    props: {
        article: Object as PropType<Article>
    },
    data() {
        return {
            text: '',
            state: 0,
            onPDF: false
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.mousemove, false)
        document.addEventListener('selectionchange', this.select, false)
        document.addEventListener('mousedown', this.mousedown)
        document.addEventListener('mouseup', this.mouseup)
        document.addEventListener('contextmenu', event => event.preventDefault())
    },
    unmounted() {
        window.removeEventListener('mousemove', this.mousemove)
        document.removeEventListener('selectionchange', this.select)
        document.removeEventListener('mousedown', this.mousedown)
        document.addEventListener('mouseup', this.mouseup)
        document.removeEventListener('contextmenu', event => event.preventDefault())
    },
    methods: {
        loadText() {
            switch (this.state) {
                case 0:
                    // @ts-ignore
                    this.text = this.article.title
                    break
                case 1:
                    // @ts-ignore
                    this.text = this.article.author
                    break
                case 2:
                    // @ts-ignore
                    this.text = this.article.description
                    break
            }
        },
        select() {
            if (!this.onPDF) return

            let raw = window.getSelection()!.toString()
            if (raw === '') this.text = ''
            else this.text = window.getSelection()!
                .toString()
                .replace(/\s+/g, ' ')
                .replace(/-\s*\s+/g, '')
                .trim()

            if (!this.article || this.text === '') return
            switch (this.state) {
                case 0:
                    this.article.title = this.text
                    break
                case 1:
                    this.text = this.text.replace('and', '&')
                    this.article.author = this.text
                    break
                case 2:
                    this.text = this.text
                    this.article.description = this.text
                    break
            }
        },
        // @ts-ignore
        mousedown(e) {
            if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') {
                switch (e?.target?.id) {
                    case 'title':
                        this.state = 0
                        break
                    case 'author':
                        this.state = 1
                        break
                    case 'description':
                        this.state = 2
                        break
                }
                this.$emit('switchSmartInput', this.state)
            } else {
                window.getSelection()?.removeAllRanges()
            }
        },
        // @ts-ignore
        mouseup(e) {
            if (!this.onPDF) return

            if (e.button === 0 && this.text !== '') this.nextState()
            else if (e.button === 2) {
                this.state = (this.state - 1) % 3
                if (this.state < 0) this.state = 2
                this.loadText()
                this.$emit('switchSmartInput', this.state)
            }
        },
        // @ts-ignore
        mousemove(e) {
            let el = document.getElementById('article-smart-input')
            el!.style.left = e.pageX + 30 + 'px'
            el!.style.top = e.pageY - 90 + 'px'

            this.onPDF = e.target.closest('.vue-pdf-embed') !== null
        },
        nextState() {
            this.state++
            if (this.state >= 3) {
                this.state = 0
                this.$emit('submit')
            }
            this.loadText()
            this.$emit('switchSmartInput', this.state)
            window.getSelection()?.removeAllRanges()
        }
    }
})
</script>

<style scoped>
.tooltip {
    padding: 0.5rem;
    box-shadow: 1px 1px 10px 0 rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    background-color: white;
    opacity: 0.7;
    overflow: hidden;
    width: 25rem;
}

.tooltip p {
    margin: 0;
}
</style>