import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import App from './App.vue'

const vuetify = createVuetify({
  directives,
  components,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#968f8fff',
        },
      },
    },
  },
})
const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.mount('#app')
