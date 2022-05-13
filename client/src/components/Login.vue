<template>
    <div class="container small" :class="{ error }">
        <h1>Publisher Login</h1>
        <input type="text" placeholder="Username" v-model="name" @input="error = false">
        <input type="password" placeholder="Access token" v-model="token" @input="error = false">
        <button :disabled="!(name && token) || error" @click="login">Log in</button>
        <transition appear>
            <p class="message error" v-if="error">Incorrect username or token.</p>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '../helpers'
import Cookies from 'js-cookie'

export default defineComponent({
    setup() {
        return {}
    },
    data() {
        return {
            name: "",
            token: "",
            error: false
        }
    },
    methods: {
        async login() {
            await api.post('login', {
                name: this.name,
                token: this.token
            }).then(res => {
                Cookies.set('auth', res.data, {
                    expires: 1,
                    sameSite: 'Strict'
                })

                // @ts-ignore
                window.location = '/manage'
            }).catch(() => {
                this.error = true
            })
        }
    },
    created() {
        if (Cookies.get('auth') !== undefined) this.$router.push('/manage')
    }
})
</script>

<style scoped>
</style>