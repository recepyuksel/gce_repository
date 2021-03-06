<template>

  <v-data-table
      :headers="headers"
      :items="linkedinAccounts"
      :loading="loading"
      :options.sync="options"
      :server-items-length="serverItemsLength"
      class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
          flat
      >
        <v-toolbar-title>Linkedin Accounts</v-toolbar-title>
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
              New Linkedin Account
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
                          class="d-flex"
                          cols="12"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="username"
                            rules="required"
                            style="width: 100%"
                        >
                          <v-text-field
                              v-model="editedLinkedinAccount.username"
                              :error-messages="errors"
                              label="Username"
                          ></v-text-field>
                        </validation-provider>
                      </v-col>
                      <v-col
                          class="d-flex"
                          cols="12"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="password"
                            rules="required"
                            style="width: 100%"
                        >
                          <v-text-field
                              v-model="editedLinkedinAccount.password"
                              :error-messages="errors"
                              label="Password"
                          ></v-text-field>
                        </validation-provider>
                      </v-col>
                      <v-col
                          class="d-flex"
                          cols="12"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Status"
                            rules="required"
                            style="width: 100%"
                        >
                          <v-select
                              v-model="editedLinkedinAccount.status"
                              :error-messages="errors"
                              :items="allStatus"
                              item-text="text"
                              item-value="value"
                              label="Status"
                              return-object
                          ></v-select>
                        </validation-provider>
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
        No Linkedin Account
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
import { EventBus } from "@/utils/event-bus";

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
      {
        text: 'Username',
        align: 'start',
        value: 'username',
        sortable: true
      },
      {text: 'Password', value: 'password', sortable: true},
      {text: 'Status', value: 'status.text', sortable: true},
      {text: 'Actions', value: 'actions', sortable: false},
    ],
    allStatus: [
      {text: "Active", value: 0},
      {text: "Passive", value: 1},
      {text: "Restricted", value: 2, disabled: true}
    ],
    linkedinAccounts: [],
    editedIndex: -1,
    editedLinkedinAccount: {
      status: null,
      username: "",
      password: "",
      referenceKey: null
    },
    defaultItem: {
      status: null,
      username: "",
      password: "",
      referenceKey: null
    },
    loading: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Linkedin Account' : 'Edit Linkedin Account'
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
    updateAuthStatus(){
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
      axiosInstance.get(`get-all-linkedin-accounts?` + "&search=" + this.search + "&page=" + page + "&size=" + itemsPerPage + "&sortBy=" + sortText + "&sortDesc=" + sortDesc)
          .then(response => {
            if (response.status == 200) {
              this.linkedinAccounts = [];
              this.serverItemsLength = response.data.totalItemCount;
              this.options.page = response.data.page + 1;
              this.options.itemsPerPage = response.data.size;

              response.data.items.forEach(function (item, index) {
                const resItem = {
                  username: item.username,
                  password: item.password,
                  status: this.allStatus[item.status],
                  referenceKey: item.referenceKey,
                  isActiveRecursive: item.isActiveRecursive
                }
                this.linkedinAccounts.push(resItem)
              }, this);
            }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

    },

    editItem(item) {
      this.editedIndex = this.linkedinAccounts.indexOf(item)
      this.editedLinkedinAccount = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.linkedinAccounts.indexOf(item)
      this.editedLinkedinAccount = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      axiosInstance.delete("delete-linkedin-account/" + this.editedLinkedinAccount.referenceKey)
          .then(response => {
            if (response.status == 200) {

              const index = this.linkedinAccounts.findIndex(value => value.referenceKey == response.data);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {
                this.linkedinAccounts.splice(index, 1);
                this.serverItemsLength -= 1;

                Vue.$log.debug("Linkedin Account deleted : " + response.data);
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
        this.editedLinkedinAccount = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
      this.$refs.observer.reset();
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedLinkedinAccount = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      this.$refs.observer.validate();

      this.loading = true;
      const data = {
        referenceKey: this.editedLinkedinAccount.referenceKey == null ? uuid.v1() : this.editedLinkedinAccount.referenceKey,
        password: this.editedLinkedinAccount.password,
        username: this.editedLinkedinAccount.username,
        status: this.editedLinkedinAccount.status != null ? this.editedLinkedinAccount.status.value : null,
        ip: this.editedLinkedinAccount.ip,
        port: this.editedLinkedinAccount.port
      }
      axiosInstance.post("save-linkedin-account", data)
          .then(response => {
            if (response.status == 200) {

              const resData = response.data;

              const item = {
                username: resData.username,
                password: resData.password,
                status: this.allStatus[resData.status],
                referenceKey: resData.referenceKey
              }

              const index = this.linkedinAccounts.findIndex(value => value.referenceKey == item.referenceKey);
              Vue.$log.debug("ref : " + item.referenceKey + " index : " + index)

              if (index > -1) {
                Object.assign(this.linkedinAccounts[index], item)
              } else {
                this.linkedinAccounts.unshift(item)
                this.serverItemsLength += 1;
                Vue.$log.debug("Linkedin Account saved : " + item.username)
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
