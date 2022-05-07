<template>
    <div>
        <Login />
        <PreviewFrame />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/Login.vue'
import PreviewFrame from '../components/PreviewFrame.vue';

export default defineComponent({
    setup() {
        return {};
    },
    components: { Login, PreviewFrame }
})
</script>

<style scoped>
</style>