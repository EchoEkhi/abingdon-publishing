<template>
    <div style="position: absolute;" id="article-smart-input" class="tooltip">
        <p style="margin-bottom: 0.5rem">
            Smart input is active. Right click to switch input field.
        </p>
        <p>{{ ['Title', 'Author', 'Description'][state] }}: {{ text }}</p>
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
            state: 0
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.mousemove, false)
        document.addEventListener('selectionchange', this.select, false)
        document.addEventListener('mouseup', this.mouseup, false)
        document.addEventListener('contextmenu', event => event.preventDefault())
    },
    unmounted() {
        window.removeEventListener('mousemove', this.mousemove)
        document.removeEventListener('selectionchange', this.select)
        document.removeEventListener('mouseup', this.mouseup)
        document.removeEventListener('contextmenu', event => event.preventDefault())
    },
    methods: {
        select() {
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
                    this.text = this.text.replace(/[^\.]([^.]*)$/, '')
                    this.article.description = this.text
                    break
            }
        },
        // @ts-ignore
        mousemove(e) {
            let el = document.getElementById('article-smart-input')
            el!.style.left = e.pageX + 30 + 'px'
            el!.style.top = e.pageY - 90 + 'px'
        },
        // @ts-ignore
        mouseup(e) {
            if (e.button === 2) {
                this.state = (this.state - 1) % 3
                if (this.state < 0) this.state = 2
            }
            if (this.text !== '') this.nextState()
            if (e?.target?.tagName !== 'INPUT' && e?.target?.tagName !== 'TEXTAREA') {
                window.getSelection()?.removeAllRanges()
            }
        },
        nextState() {
            this.state++
            if (this.state >= 3) {
                this.state = 0
                this.$emit('submit')
            }
        }
    }
})
</script>

<style scoped>
.tooltip {
    padding: 0.5rem;
    box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    background-color: white;
    opacity: 0.9;
    overflow: hidden;
    width: 25rem;
}

.tooltip p {
    margin: 0;
}
</style>