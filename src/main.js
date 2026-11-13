import {createApp} from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import {createStore} from "vuex";

const store = createStore({
    state: {
        homeLocation: null,
    },
    mutations: {
        homeLocation(state, payload) {
            state.homeLocation = payload
        }
    }
});

createApp(App)
    .use(vuetify)
    .use(store)
    .mount('#app')
