import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/users'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

const initApp = async () => {
  const userStore = useUserStore(pinia)

  // 🔥 restore user BEFORE router starts working
  await userStore.fetchCurrentUser()

  app.mount('#app')
}

initApp()