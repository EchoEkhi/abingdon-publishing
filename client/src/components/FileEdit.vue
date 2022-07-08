<template>
    <div class="container flex">
        <h1 style="margin-top: 0.5rem; margin-bottom: 1rem; margin-left: 0.5rem">Upload Your PDF</h1>
        <select v-model="file">
            <option :value="newFile">Upload new file</option>
            <option v-for="file in files" :value="file">{{ file.name }}</option>
        </select>
        <input type="file" ref="file">
        <input type="text" placeholder="File name e.g. The Martlet Issue 29" v-model="file.name">
        <input type="text" placeholder="File link" disabled
            :value="file.name ? 'Link: ' + file.name.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '.pdf' : ''">
        <button :disabled="file.name === '' || file.name === undefined" @click="submit">
            <span v-if="status === 'standby'">{{ file.id === -1 ? 'Upload' : 'Save' }} File</span>
            <span v-else-if="status === 'waiting'">Saving File...</span>
            <span v-else-if="status === 'success'">File Saved!</span>
            <span v-else-if="status === 'error'">Failed!</span>
        </button>
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import api from '../helpers'
import { useFiles, File } from '../store'

type Status = 'standby' | 'waiting' | 'success' | 'error'

export default defineComponent({
    setup() {
        let { files, newFile } = storeToRefs(useFiles())
        return { files, newFile }
    },
    data() {
        return {
            file: {} as File,
            status: "standby" as Status
        }
    },
    methods: {
        async submit() {
            this.status = 'waiting'
            // @ts-ignore
            let { id } = await useFiles().submitFile(this.file)

            if (id === undefined) id = this.file.id
            else this.file = this.files.find((file) => file.id === id) || this.file
            // @ts-ignore There does not seem to be a way to safely read files...
            const file = this.$refs.file.files[0]

            if (file === undefined) {
                this.status = 'success'
                return
            }

            let formData = new FormData()
            formData.append('file', file)
            await api.post('file/upload/' + id, formData)

            this.status = 'success'

        }
    },
    created() {
        useFiles().fetchFiles().then(() => this.file = this.newFile)
    }
})
</script>

<style scoped>
.flex {
    flex-direction: column;
}

.container {
    text-align: left;
    overflow-y: scroll;
    scrollbar-width: none;
}

.container::-webkit-scrollbar {
    display: none;
}

button {
    width: 8rem;
}
</style>