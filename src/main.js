import {createApp} from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import {loadFonts} from './plugins/webfontloader'

loadFonts()

import VueGoogleMaps from '@fawmi/vue-google-maps'

createApp(App)
    .use(vuetify)
    .use(VueGoogleMaps, {
        load: {
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            libraries: 'places',
        }
    })
    .mount('#app')
