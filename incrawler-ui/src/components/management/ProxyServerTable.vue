<template>

  <v-data-table
      :headers="headers"
      :items="proxyServers"
      :loading="loading"
      :options.sync="options"
      :server-items-length="serverItemsLength"
      class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
          flat
      >
        <v-toolbar-title>Proxy Servers</v-toolbar-title>
        <v-divider
            class="mx-4"
            inset
            vertical
        ></v-divider>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            hide-details
            label="Search"
            single-line
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog
            v-model="dialog"
            max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-if="hasAdminAuthority"
                v-bind="attrs"
                v-on="on"
                class="mb-2"
                color="primary"
                dark
            >
              New Proxy Server
            </v-btn>
          </template>

          <validation-observer
              ref="observer"
              v-slot="{ invalid }"
          >

            <v-form>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Ip"
                            rules="required"
                        >
                          <v-text-field
                              v-model="editedProxyServer.ip"
                              :error-messages="errors"
                              label="Ip"
                          ></v-text-field>
                        </validation-provider>
                      </v-col>
                      <v-col
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Port"
                            rules="required|minMaxValue:1,65535"
                        >
                          <v-text-field
                              v-model="editedProxyServer.port"
                              :error-messages="errors"
                              label="Port"
                              type="number"
                          ></v-text-field>
                        </validation-provider>
                      </v-col>
                      <v-col
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Status"
                            rules="required"
                        >
                          <v-select
                              v-model="editedProxyServer.status"
                              :error-messages="errors"
                              :items="allStatus"
                              item-text="text"
                              item-value="value"
                              label="Status"
                              return-object
                          ></v-select>
                        </validation-provider>
                      </v-col>
                      <v-col
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedProxyServer.username"
                            label="Username"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedProxyServer.password"
                            label="Password"
                        ></v-text-field>
                      </v-col>

                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                      color="blue darken-1"
                      text
                      @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                      :disabled="invalid"
                      color="blue darken-1"
                      text
                      @click="save"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </validation-observer>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
              :v-if="hasAdminAuthority"
              v-bind="attrs"
              v-on="on"
              small
              @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <span>Edit</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
              :v-if="hasAdminAuthority"
              v-bind="attrs"
              v-on="on"
              small
              @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </template>
    <template v-slot:no-data>
      <v-card-text>
        No Proxy Server
      </v-card-text>
    </template>
  </v-data-table>
</template>


<script>
import Vue from "vue";
import {axiosInstance} from "@/utils/http-common";
import {uuid} from 'vue-uuid';
import {required} from 'vee-validate/dist/rules'
import {extend, setInteractionMode, ValidationObserver, ValidationProvider} from 'vee-validate'
import {getInstance} from "@/utils/KeycloakUtil";
import {EventBus} from "@/utils/event-bus";

const keycloak = getInstance();
setInteractionMode('eager')

extend('required', {
  ...required,
  message: '{_field_} can not be empty',
})

extend('minMaxValue', {
  validate: (value, {
    min,
    max
  }) => {
    return value >= Number(min) && value <= Number(max)
  },
  message: (fieldName, {
    min,
    max
  }) => {
    return `${fieldName} must be between ${min} and ${max}`
  },
  params: ['min', 'max']
})

export default {
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  data: () => ({
    search: "",
    hasAdminAuthority: false,
    hasUserAuthority: false,
    options: {},
    serverItemsLength: 0,
    dialog: false,
    dialogDelete: false,
    headers: [
      {text: 'Ip', value: 'ip', sortable: true},
      {text: 'Port', value: 'port', sortable: true},
      {text: 'Status', value: 'status.text', sortable: true},
      {
        text: 'Username',
        align: 'start',
        value: 'username',
        sortable: true
      },
      {text: 'Password', value: 'password', sortable: true},
      {text: 'Actions', value: 'actions', sortable: true},
    ],
    allStatus: [
      {text: "Active", value: 0},
      {text: "Passive", value: 1},
      {text: "Restricted", value: 2, disabled: true}
    ],
    proxyServers: [],
    editedIndex: -1,
    editedProxyServer: {
      ip: "",
      port: 0,
      status: null,
      username: "",
      password: "",
      referenceKey: null
    },
    defaultItem: {
      ip: "",
      port: 0,
      status: null,
      username: "",
      password: "",
      referenceKey: null
    },
    loading: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Proxy Server' : 'Edit Proxy Server'
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
    options: {
      handler() {
        this.initialize()
      },
      deep: true,
    },
    search: {
      handler() {
        this.initialize()
      },
    },
  },

  mounted() {
    EventBus.$on("onAuthStatusUpdate", (status) => {
      this.updateAuthStatus();
    });
    this.updateAuthStatus();
  },

  methods: {
    updateAuthStatus() {
      this.hasAdminAuthority = keycloak.hasRole("ADMIN");
      this.hasUserAuthority = keycloak.hasRole("USER");
    },
    initialize() {
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      let sortText = "";
      if (sortBy.length > 0) {
        sortText = sortBy[0];
        if (sortText.includes(".text")) {
          sortText = sortText.replace(".text", "");
        }
      }
      axiosInstance.get(`get-all-proxy-servers?` + "&search=" + this.search + "&page=" + page + "&size=" + itemsPerPage + "&sortBy=" + sortText + "&sortDesc=" + sortDesc)
          .then(response => {
            if (response.status == 200) {
              this.proxyServers = [];
              this.serverItemsLength = response.data.totalItemCount;
              this.options.page = response.data.page + 1;
              this.options.itemsPerPage = response.data.size;

              response.data.items.forEach(function (item, index) {
                const resItem = {
                  username: item.username,
                  password: item.password,
                  status: this.allStatus[item.status],
                  ip: item.ip,
                  referenceKey: item.referenceKey,
                  isActiveRecursive: item.isActiveRecursive,
                  port: item.port
                }
                this.proxyServers.push(resItem)
              }, this);
            }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

    },

    editItem(item) {
      this.editedIndex = this.proxyServers.indexOf(item)
      this.editedProxyServer = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.proxyServers.indexOf(item)
      this.editedProxyServer = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      axiosInstance.delete("delete-proxy-server/" + this.editedProxyServer.referenceKey)
          .then(response => {
            if (response.status == 200) {

              const index = this.proxyServers.findIndex(value => value.referenceKey == response.data);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {
                this.proxyServers.splice(index, 1);
                this.serverItemsLength -= 1;

                Vue.$log.debug("Proxy Server deleted : " + response.data);
              }

            }
            this.loading = false;
          })
          .catch(e => {
            Vue.$log.error(e);
            this.loading = false;
          })


      this.closeDelete()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedProxyServer = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
      this.$refs.observer.reset();
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedProxyServer = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      this.$refs.observer.validate();

      this.loading = true;
      const data = {
        referenceKey: this.editedProxyServer.referenceKey == null ? uuid.v1() : this.editedProxyServer.referenceKey,
        password: this.editedProxyServer.password,
        username: this.editedProxyServer.username,
        status: this.editedProxyServer.status != null ? this.editedProxyServer.status.value : null,
        ip: this.editedProxyServer.ip,
        port: this.editedProxyServer.port
      }
      axiosInstance.post("save-proxy-server", data)
          .then(response => {
            if (response.status == 200) {

              const resData = response.data;

              const item = {
                username: resData.username,
                password: resData.password,
                status: this.allStatus[resData.status],
                ip: resData.ip,
                referenceKey: resData.referenceKey,
                port: resData.port
              }

              const index = this.proxyServers.findIndex(value => value.referenceKey == item.referenceKey);
              Vue.$log.debug("ref : " + item.referenceKey + " index : " + index)

              if (index > -1) {
                Object.assign(this.proxyServers[index], item)
              } else {
                this.proxyServers.unshift(item)
                this.serverItemsLength += 1;
                Vue.$log.debug("Proxy Server saved : " + item.username)
              }
            }
            this.loading = false;
          })
          .catch(e => {
            Vue.$log.error(e);
            this.loading = false;
          })
      this.close()
    }
  },
}
</script>
