<template>
    <div style="position: absolute;" id="article-smart-input" class="tooltip">

    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Article } from '../store'

export default defineComponent({
    props: {
        article: Object as PropType<Article>
    },
    setup() {
        return {}
    },
    mounted() {
        let el = document.getElementById('article-smart-input')

        window.addEventListener('mousemove', fn, false)

        // @ts-ignore
        function fn(e) {
            el!.style.left = e.pageX + 30 + 'px'
            el!.style.top = e.pageY - 60 + 'px'
        }
    }
})
</script>

<style scoped>
.tooltip {
    height: 2rem;
    width: 10rem;
    box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    background-color: white;
    opacity: 0.9;
    overflow: hidden;
}
</style>