<template>
  <div>
    <v-data-table
        :headers="headers"
        :items="extractedProfiles"
        :loading="loading"
        :options.sync="options"
        :server-items-length="serverItemsLength"
        class="elevation-1"
    >
      <template #item.username="{ item }">
        <router-link :to="{name:'profile-detail',params:{referenceKey:item.referenceKey}}">
          {{ item.username }}
        </router-link>
      </template>
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Processed Profiles</v-toolbar-title>
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
          <v-dialog v-model="dialogDelete" max-width="520px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this profile?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogRecrawling" max-width="640px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to trigger recrawling this profile?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeRecrawling">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="recrawlingConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogProcess" max-width="600px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to reprocess this profile?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeProcess">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="processProfileConfirm">OK</v-btn>
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
                class="mr-2"
                small
                @click="recrawlProfile(item)"
            >
              mdi-restart
            </v-icon>
          </template>
          <span>Re-Crawl</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                :v-if="hasAdminAuthority"
                v-bind="attrs"
                v-on="on"
                class="mr-2"
                small
                @click="processProfile(item)"
            >
              mdi-account-convert
            </v-icon>
          </template>
          <span>Re-Process</span>
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
          No Processed Profile
        </v-card-text>
      </template>
    </v-data-table>
    <v-snackbar
        v-model="snackbar"
        :timeout="snackbarTimeout"
    >
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
            v-bind="attrs"
            color="blue"
            text
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>


<script>
import Vue from "vue";
import {axiosInstance} from "@/utils/http-common";
import moment from 'moment'
import {getInstance} from "@/utils/KeycloakUtil";
import {EventBus} from "@/utils/event-bus";

const keycloak = getInstance();

export default {
  components: {},
  data: () => ({
    search: "",
    hasAdminAuthority: false,
    hasUserAuthority: false,
    snackbar: false,
    snackbarText: '',
    snackbarTimeout: 5000,
    options: {},
    serverItemsLength: 0,
    dialog: false,
    dialogDelete: false,
    dialogProcess: false,
    dialogRecrawling: false,
    headers: [
      {text: 'Full Name', value: 'username', sortable: true},
      {text: 'Last Crawl Date', align: 'start', value: 'lastCrawlDate', sortable: true},
      {text: 'Last Process Date', value: 'lastProcessDate', sortable: true},
      {text: 'Actions', value: 'actions', sortable: false},
    ],
    extractedProfiles: [],
    selectedExtractedProfile: {
      username: "",
      lastCrawlDate: null,
      lastProcessDate: null,
      referenceKey: ""
    },
    defaultItem: {
      username: "",
      lastCrawlDate: null,
      lastProcessDate: null,
      referenceKey: ""
    },
    loading: false,
  }),

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
    dialogRecrawling(val) {
      val || this.closeRecrawling()
    },
    dialogProcess(val) {
      val || this.closeProcess()
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
    this.updateAuthStatus()
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
      axiosInstance.get(`get-all-processed-profiles?` + "&search=" + this.search + "&page=" + page + "&size=" + itemsPerPage + "&sortBy=" + sortText + "&sortDesc=" + sortDesc)
          .then(response => {
            if (response.status == 200) {
              this.extractedProfiles = [];
              this.serverItemsLength = response.data.totalItemCount;
              this.options.page = response.data.page + 1;
              this.options.itemsPerPage = response.data.size;

              response.data.items.forEach(function (item, index) {
                const resItem = {
                  username: item.username,
                  lastCrawlDate: this.format_date(item.lastCrawlDate),
                  lastProcessDate: this.format_date(item.lastProcessDate),
                  referenceKey: item.referenceKey
                }
                this.extractedProfiles.push(resItem)
              }, this);
            }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

    },

    recrawlProfile(item) {
      this.selectedExtractedProfile = Object.assign({}, item)
      this.dialogRecrawling = true
    },

    processProfile(item) {
      this.selectedExtractedProfile = Object.assign({}, item)
      this.dialogProcess = true
    },

    deleteItem(item) {
      this.selectedExtractedProfile = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      this.showPopup("Processed profile will be deleted...");
      axiosInstance.delete("delete-processed-profile/" + this.selectedExtractedProfile.referenceKey)
          .then(response => {
            if (response.status == 200) {

              const index = this.extractedProfiles.findIndex(value => value.referenceKey == response.data);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {
                this.extractedProfiles.splice(index, 1);
                this.serverItemsLength -= 1;
                this.showPopup("Processed profile deleted");

                Vue.$log.debug("Processed profile deleted : " + response.data);
              }
            }
            this.loading = false;
          })
          .catch(e => {
            this.showPopup("Could not deleted processed profile...");
            Vue.$log.error(e);
            this.loading = false;
          })


      this.closeDelete()
    },

    recrawlingConfirm() {
      this.showPopup("Profile recrawling will be started...");

      const data = {
        referenceKey: this.selectedExtractedProfile.referenceKey
      }
      axiosInstance.post("recrawl-profile/", data)
          .then(response => {
            if (response.status == 200) {
              const index = this.extractedProfiles.findIndex(value => value.referenceKey == response.data.profileId);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {
                this.showPopup("Profile recrawling started");
                Vue.$log.debug("Profile recrawling started : " + response.data.profileId);
              }
            }
            this.loading = false;
          })
          .catch(e => {
            this.showPopup("Profile recrawling failed!")
            Vue.$log.error(e);
            this.loading = false;
          })


      this.closeRecrawling();
    },

    processProfileConfirm() {
      this.showPopup("Profile processing will be started...");
      const data = {
        referenceKey: this.selectedExtractedProfile.referenceKey
      }
      axiosInstance.post("process-crawled-profile/", data)
          .then(response => {
            if (response.status == 200) {

              const index = this.extractedProfiles.findIndex(value => value.referenceKey == response.data.referenceKey);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {

                const resData = response.data;

                const item = {
                  username: resData.username,
                  lastCrawlDate: this.format_date(resData.lastCrawlDate),
                  lastProcessDate: this.format_date(resData.lastProcessDate),
                  referenceKey: resData.referenceKey
                };

                this.showPopup("Profile processing completed");

                Object.assign(this.extractedProfiles[index], item)

                Vue.$log.debug("Processed profile deleted : " + response.data);
              }
            }
            this.loading = false;
          })
          .catch(e => {
            this.showPopup("Profile processing failed!")
            Vue.$log.error(e);
            this.loading = false;
          })


      this.closeProcess()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.selectedExtractedProfile = Object.assign({}, this.defaultItem)
      })
      this.$refs.observer.reset();
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.selectedExtractedProfile = Object.assign({}, this.defaultItem)
      })
    },

    closeRecrawling() {
      this.dialogRecrawling = false
      this.$nextTick(() => {
        this.selectedExtractedProfile = Object.assign({}, this.defaultItem)
      })
    },

    closeProcess() {
      this.dialogProcess = false
      this.$nextTick(() => {
        this.selectedExtractedProfile = Object.assign({}, this.defaultItem)
      })
    },

    showPopup(text) {
      this.snackbarText = text
      this.snackbar = true;
    },

    format_date(value) {
      if (value) {
        return moment(String(value)).format('DD.MM.YYYY hh:mm')
      }
    },
  },
}
</script>
