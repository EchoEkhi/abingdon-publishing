<template>
    <div class="flex">
        <div class="container">
            <h1>Read the usage instructions!</h1>
            <div style="max-width: 60rem; margin: auto;">
                <p>Scroll down to the file section to upload your PDF file.</p>
                <p>In the article section, select the file the article is in.</p>
                <p>Highlight the text you want to input when Smart Input is active. If you make a mistake, just
                    right-click
                    and redo the selection.</p>
                <p>Note that this should only be used to recommend recent articles to Firefly users, so maybe don't
                    upload
                    very
                    old PDFs!</p>

                <p>If you have old articles left from the previous issue of the newspaper/magazine/etc., they should be
                    removed.
                    Just press the button on the top-right of the article list and select whatever you want to remove!
                    This
                    action is reversible upon request.
                </p>
                <p>If you are unsure about anything, please do not hesitate to contact me at <a
                        href="/api/support-email">my
                        email
                        address</a>!</p>
            </div>
        </div>
        <FileEdit style="min-width: 25%" />
    </div>
    <div class="flex" style="height: 100vh;">
        <ArticleList class="left" />
        <ArticleEdit class="right" />
    </div>
    <PreviewFrame />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useArticles } from '../store'
import ArticleList from '../components/ArticleList.vue'
import ArticleEdit from '../components/ArticleEdit.vue';
import FileEdit from '../components/FileEdit.vue';
import PreviewFrame from '../components/PreviewFrame.vue';

export default defineComponent({
    async created() {
        useArticles().fetchArticles()
    },
    setup() {
        return {};
    },
    components: { ArticleList, ArticleEdit, FileEdit, PreviewFrame }
})
</script>

<style scoped>
.flex {
    display: flex;
    align-items: stretch;
}

.left {
    flex: 2
}

.right {
    flex: 5
}
</style>