<template>
  <v-card height="100%" >
    <v-navigation-drawer width="100%" style="padding-bottom: 60px">
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-icon dark>
              mdi-account-circle
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ name }}</v-list-item-title>
            <v-list-item-subtitle>Logged In</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-divider></v-divider>
      <v-list>
        <v-list-item
            v-for="item in items"
            :to="item.path"
            :key="item.title"
            link>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-if="isLoggedIn" v-slot:append>
        <div class="pa-2">
          <v-btn v-on:click="handleClick" block>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
import Vue from "vue";
import { realm, url, clientId } from "../auth_config.json";
import { keycloakUtil, getInstance } from "../utils/KeycloakUtil";
import { EventBus } from "../utils/event-bus";

console.log("sidebar")

Vue.use(keycloakUtil, { url, realm, clientId });

const keycloak = getInstance();
keycloak.login();

export default {
    mounted() {
    EventBus.$on("onAuthStatusUpdate", (status) => {
      this.updateUser(status);
    });
  },
  data() {
    return {
      name: "",
      isLoggedIn: keycloak.isLoggedIn(),
      items: [
        {title: 'Crawling Job Operations' ,path:'/crawling-job-operations'},
        {title: 'Linkedin Accounts' ,path:'/linkedin-account-management'},
        {title: 'Proxy Servers' ,path:'/proxy-server-management'},
        {title: 'Crawled Profiles' ,path:'/crawled-profiles'},
        {title: 'Processed Profiles' ,path:'/processed-profiles'}
      ],
    }
  },
    methods: {
    updateUser: function(e) {
      console.log("updated auth status => " + e);
      this.name = e ? keycloak.getUserName() : "";
      this.isLoggedIn = e;
    },
    handleClick: function() {
      if (keycloak.isLoggedIn()) {
        keycloak.logout();
      }
    },
  },
}
</script>
