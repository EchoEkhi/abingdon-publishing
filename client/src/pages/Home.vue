<template>
    <div>
        <h1>Abingdon Aggregate</h1>
        <Login />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/Login.vue'

export default defineComponent({
    setup() {
        return {};
    },
    components: { Login }
})
</script>

<style scoped>
</style>