import Vue from "vue";
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/lib/util/colors'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify);

export default new Vuetify({
    preset:{
        icons:{
            iconfont:'mdi'
        },
        theme:{
            themes:{
                dark:{
                    background: colors.purple,
                    primary: colors.purple,
                    secondary: colors.grey.darken1,
                    accent: colors.shades.black,
                    error: colors.red.accent3,
                }
            },
            dark:true
        }
    }
});