import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/manage', component: () => import('./pages/Manage.vue') }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})