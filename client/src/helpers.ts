import axios from 'axios'
import Cookies from 'js-cookie'
import { router } from './routes'

const api = axios.create({
    baseURL: '/api/',
    timeout: 3000,
    timeoutErrorMessage: 'Request timed out! Check your Internet.'
})

api.interceptors.response.use(res => {
    return res
}, err => {
    if (err.response === undefined) return err
    if (err.response.status == 401) {
        Cookies.remove('auth', {
            expires: 1,
            sameSite: 'Strict'
        })
        router.push('/')
    }
})

export default api