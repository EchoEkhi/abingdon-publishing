<template>
    <div style="position: relative;">
        <div class="menu">
            <Transition>
                <span v-show="selectMode">
                    <button @click="remove" title="Remove articles">
                        <svg width="18px" height="18px" viewBox="2 0 48 48" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g fill="#212121" fill-rule="nonzero">
                                    <path
                                        d="M24,7.25 C27.1017853,7.25 29.629937,9.70601719 29.7458479,12.7794443 L29.75,13 L37,13 C37.6903559,13 38.25,13.5596441 38.25,14.25 C38.25,14.8972087 37.7581253,15.4295339 37.1278052,15.4935464 L37,15.5 L35.909,15.5 L34.2058308,38.0698451 C34.0385226,40.2866784 32.1910211,42 29.9678833,42 L18.0321167,42 C15.8089789,42 13.9614774,40.2866784 13.7941692,38.0698451 L12.09,15.5 L11,15.5 C10.3527913,15.5 9.8204661,15.0081253 9.75645361,14.3778052 L9.75,14.25 C9.75,13.6027913 10.2418747,13.0704661 10.8721948,13.0064536 L11,13 L18.25,13 C18.25,9.82436269 20.8243627,7.25 24,7.25 Z M33.4021054,15.5 L14.5978946,15.5 L16.2870795,37.8817009 C16.3559711,38.7945146 17.116707,39.5 18.0321167,39.5 L29.9678833,39.5 C30.883293,39.5 31.6440289,38.7945146 31.7129205,37.8817009 L33.4021054,15.5 Z M27.25,20.75 C27.8972087,20.75 28.4295339,21.2418747 28.4935464,21.8721948 L28.5,22 L28.5,33 C28.5,33.6903559 27.9403559,34.25 27.25,34.25 C26.6027913,34.25 26.0704661,33.7581253 26.0064536,33.1278052 L26,33 L26,22 C26,21.3096441 26.5596441,20.75 27.25,20.75 Z M20.75,20.75 C21.3972087,20.75 21.9295339,21.2418747 21.9935464,21.8721948 L22,22 L22,33 C22,33.6903559 21.4403559,34.25 20.75,34.25 C20.1027913,34.25 19.5704661,33.7581253 19.5064536,33.1278052 L19.5,33 L19.5,22 C19.5,21.3096441 20.0596441,20.75 20.75,20.75 Z M24,9.75 C22.2669685,9.75 20.8507541,11.1064548 20.7551448,12.8155761 L20.75,13 L27.25,13 C27.25,11.2050746 25.7949254,9.75 24,9.75 Z">
                                    </path>
                                </g>
                            </g>
                        </svg>
                    </button>
                </span>
            </Transition>
            <button @click="selectMode = !selectMode" title="Options">
                <svg v-if="selectMode" width="22px" height="22px" viewBox="-4 -7 48 48" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g fill="#212121" fill-rule="nonzero">
                            <path
                                d="M3.52499419,3.71761187 L3.61611652,3.61611652 C4.0717282,3.16050485 4.79154862,3.13013074 5.28238813,3.52499419 L5.38388348,3.61611652 L14,12.233 L22.6161165,3.61611652 C23.1042719,3.12796116 23.8957281,3.12796116 24.3838835,3.61611652 C24.8720388,4.10427189 24.8720388,4.89572811 24.3838835,5.38388348 L15.767,14 L24.3838835,22.6161165 C24.8394952,23.0717282 24.8698693,23.7915486 24.4750058,24.2823881 L24.3838835,24.3838835 C23.9282718,24.8394952 23.2084514,24.8698693 22.7176119,24.4750058 L22.6161165,24.3838835 L14,15.767 L5.38388348,24.3838835 C4.89572811,24.8720388 4.10427189,24.8720388 3.61611652,24.3838835 C3.12796116,23.8957281 3.12796116,23.1042719 3.61611652,22.6161165 L12.233,14 L3.61611652,5.38388348 C3.16050485,4.9282718 3.13013074,4.20845138 3.52499419,3.71761187 L3.61611652,3.61611652 L3.52499419,3.71761187 Z">
                            </path>
                        </g>
                    </g>
                </svg>
                <span v-else>⁝</span>
            </button>
        </div>
        <div class="container no-p" style="height: calc(100% - 4rem)">
            <ArticleItem id="new-article" class="new-article-after" :article="newArticle" default />
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

.new-article-before {
    min-height: 0;
    top: -6rem;
    margin-bottom: -6rem;
}

.new-article-during {
    transition: top 0.5s ease, margin-bottom 0.5s ease;
}

.new-article-after {
    min-height: 0;
    top: 0rem;
}

.menu {
    position: absolute;
    display: flex;
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