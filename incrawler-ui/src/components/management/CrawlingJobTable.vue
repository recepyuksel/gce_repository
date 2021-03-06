<template>

  <v-data-table
      :headers="headers"
      :items="jobs"
      :loading="loading"
      :options.sync="options"
      :server-items-length="serverItemsLength"
      class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
          flat
      >
        <v-toolbar-title>Crawling Jobs</v-toolbar-title>
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
            max-width="800px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                v-if="hasAdminAuthority"
                class="mb-2"
                color="primary"
                dark
            >
              New Job
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
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Summary"
                            rules="required"
                        >
                          <v-text-field
                              v-model="editedJob.summary"
                              :error-messages="errors"
                              :readonly="editedJob.referenceKey!=null"
                              label="Summary"
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
                            name="Profile Id"
                            rules="required"
                        >
                          <v-text-field
                              v-model="editedJob.profileId"
                              :error-messages="errors"
                              :readonly="editedJob.referenceKey!=null"
                              label="Profile Id"
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
                              v-model="editedJob.status"
                              :error-messages="errors"
                              :items="allStatus"
                              :readonly="!hasAdminAuthority"
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
                        <validation-provider
                            v-slot="{ errors }"
                            name="Mode"
                            rules="required"
                        >
                          <v-select
                              v-model="editedJob.mode"
                              :error-messages="errors"
                              :items="modes"
                              :readonly="editedJob.referenceKey!=null"
                              item-text="text"
                              item-value="value"
                              label="Mode"
                              return-object
                          ></v-select>
                        </validation-provider>
                      </v-col>
                      <!--related simdilik kullanmiyor-->
                      <v-col v-if="editedJob.mode!= null && editedJob.mode.value=='2' && false"
                             class="d-flex"
                             cols="12"
                             md="6"
                             sm="6"
                      >
                        <v-checkbox
                            v-model="editedJob.isActiveRecursive"
                            :readonly="editedJob.referenceKey!=null"
                            label="Is Active Recursive Crawling?"
                        ></v-checkbox>
                      </v-col>
                      <!--related simdilik kullanmiyor-->
                      <v-col v-if="editedJob.mode!= null && editedJob.mode.value=='2' && false"
                             class="d-flex"
                             cols="12"
                             md="6"
                             sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.crawlingDepth"
                            :readonly="editedJob.referenceKey!=null"
                            label="Crawling Depth"
                            type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col v-if="editedJob.mode!= null && editedJob.mode.value=='3'"
                             class="d-flex"
                             cols="12"
                             md="6"
                             sm="6"
                      >
                        <validation-provider
                            v-slot="{ errors }"
                            name="Foundation Type"
                            rules="required"
                        >
                          <v-select
                              v-model="editedJob.foundationType"
                              :error-messages="errors"
                              :items="foundationTypes"
                              :readonly="editedJob.referenceKey!=null"
                              item-text="text"
                              item-value="value"
                              label="Foundation Type"
                              return-object
                          ></v-select>
                        </validation-provider>
                      </v-col>
                      <v-col v-if="editedJob.mode!= null && (editedJob.mode.value=='2' || (editedJob.mode.value=='3' && editedJob.foundationType!=null) )"
                             class="d-flex"
                             cols="12"
                             md="6"
                             sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.title"
                            :readonly="editedJob.referenceKey!=null"
                            label="Title"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          v-if="editedJob.mode!= null && ( (editedJob.mode.value=='3'  && editedJob.foundationType!=null && editedJob.foundationType.value !='2'))"
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.country"
                            :readonly="editedJob.referenceKey!=null"
                            label="Country"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          v-if="editedJob.mode!= null && ( (editedJob.mode.value=='3' && editedJob.foundationType!=null && editedJob.foundationType.value =='1'))"
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.workplace"
                            :readonly="editedJob.referenceKey!=null"
                            label="Workplace"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          v-if="editedJob.mode!= null && ( (editedJob.mode.value=='3' && editedJob.foundationType!=null && editedJob.foundationType.value =='3'))"
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.school"
                            :readonly="editedJob.referenceKey!=null"
                            label="School"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          v-if="editedJob.mode!= null && ( (editedJob.mode.value=='3'  && editedJob.foundationType!=null && editedJob.foundationType.value !='1'&& editedJob.foundationType.value == '1'))"
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.educationLevel"
                            :readonly="editedJob.referenceKey!=null"
                            label="Education Level"
                        ></v-text-field>
                      </v-col>
                      <v-col
                          v-if="editedJob.mode!= null && ( (editedJob.mode.value=='3'  && editedJob.foundationType!=null && editedJob.foundationType.value == '1'))"
                          class="d-flex"
                          cols="12"
                          md="6"
                          sm="6"
                      >
                        <v-text-field
                            v-model="editedJob.filter.department"
                            :readonly="editedJob.referenceKey!=null"
                            label="Department"
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
                      :v-if="hasAdminAuthority"
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
              v-bind="attrs"
              v-on="on"
              small
              @click="editItem(item)"
          >
            {{ hasAdminAuthority ? "mdi-pencil" : "mdi-eye" }}
          </v-icon>
        </template>
        <span>{{ hasAdminAuthority ? "Edit" : "Show" }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
              v-bind="attrs"
              v-on="on"
              :v-if="hasAdminAuthority"
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
        No Jobs
      </v-card-text>
    </template>
  </v-data-table>
</template>


<script>
import Vue from "vue";
import {axiosInstance} from "@/utils/http-common";
import {uuid} from 'vue-uuid';
import {max, required} from 'vee-validate/dist/rules'
import {extend, setInteractionMode, ValidationObserver, ValidationProvider} from 'vee-validate'
import {getInstance} from "@/utils/KeycloakUtil";
import {EventBus} from "@/utils/event-bus";

const keycloak = getInstance();

setInteractionMode('eager')

extend('required', {
  ...required,
  message: '{_field_} can not be empty',
})

extend('max', {
  ...max,
  message: '{_field_} may not be greater than {length} characters',
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
    pagination: {},
    serverItemsLength: 0,
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: 'Summary',
        align: 'start',
        sortable: true,
        value: 'summary',
      },
      {text: 'Profile Id', value: 'profileId', sortable: true},
      {text: 'Status', value: 'status.text', sortable: true},
      {text: 'Mode', value: 'mode.text', sortable: true},
      {text: 'Actions', value: 'actions', sortable: false},
    ],
    modes: [
      {text: "Single Profile", value: 1},
      {text: "Related Profiles", value: 2},
      {text: "Foundation Profiles", value: 3}
    ],
    allStatus: [
      {text: "Waiting", value: 1},
      {text: "Running", value: 2},
      {text: "Finished", value: 3, disabled: true}
    ],
    foundationTypes: [
      {text: "School", value: 1},
      {text: "Group", value: 2},
      {text: "Company", value: 3}
    ],
    jobs: [],
    editedIndex: -1,
    editedJob: {
      summary: "",
      profileId: "",
      status: null,
      mode: null,
      referenceKey: null,
      isActiveRecursive: false,
      crawlingDepth: 0,
      foundationType: null,
      filter: {
        country: "",
        title: "",
        workplace: "",
        school: "",
        educationLevel: "",
        department: ""
      }
    },
    defaultItem: {
      summary: "",
      profileId: "",
      status: null,
      mode: null,
      referenceKey: null,
      isActiveRecursive: false,
      crawlingDepth: 0,
      foundationType: null,
      filter: {
        country: "",
        title: "",
        workplace: "",
        school: "",
        educationLevel: "",
        department: ""
      }
    },
    loading: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Job' : 'Edit Job'
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
      const {sortBy, sortDesc, page, itemsPerPage} = this.options;
      let sortText = "";
      if (sortBy.length > 0) {
        sortText = sortBy[0];
        if (sortText.includes(".text")) {
          sortText = sortText.replace(".text", "");
        }
      }
      axiosInstance.get(`get-all-jobs?` + "&search=" + this.search + "&page=" + page + "&size=" + itemsPerPage + "&sortBy=" + sortText + "&sortDesc=" + sortDesc)
          .then(response => {
            if (response.status == 200) {
              this.jobs = [];
              this.serverItemsLength = response.data.totalItemCount;
              this.options.page = response.data.page + 1;
              this.options.itemsPerPage = response.data.size;
              response.data.items.forEach(function (item, index) {
                const resItem = {
                  summary: item.summary,
                  profileId: item.profileId,
                  status: this.allStatus[item.status - 1],
                  mode: this.modes[item.mode - 1],
                  referenceKey: item.referenceKey,
                  isActiveRecursive: item.isActiveRecursive,
                  crawlingDepth: item.crawlingDepth,
                  foundationType: this.foundationTypes[item.foundationType - 1],
                  filter: item.filter == null ? {
                    country: "",
                    title: "",
                    workplace: "",
                    school: "",
                    educationLevel: "",
                    department: ""
                  } : {
                    country: item.filter.country,
                    title: item.filter.title,
                    workplace: item.filter.workplace,
                    school: item.filter.school,
                    educationLevel: item.filter.educationLevel,
                    department: item.filter.department
                  }
                }
                this.jobs.push(resItem)
              }, this);
            }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

    },

    editItem(item) {
      this.editedIndex = this.jobs.indexOf(item)
      this.editedJob = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.jobs.indexOf(item)
      this.editedJob = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {

      axiosInstance.delete("delete-job/" + this.editedJob.referenceKey)
          .then(response => {
            if (response.status == 200) {

              const index = this.jobs.findIndex(value => value.referenceKey == response.data);
              Vue.$log.info("ref : " + response.data + " index : " + index)
              if (index > -1) {
                this.jobs.splice(index, 1);
                this.serverItemsLength -= 1;
                Vue.$log.debug("Job deleted : " + response.data);
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
        this.editedJob = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
      this.$refs.observer.reset();
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedJob = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      this.$refs.observer.validate();
      this.loading = true;
      const data = {
        referenceKey: this.editedJob.referenceKey == null ? uuid.v1() : this.editedJob.referenceKey,
        profileId: this.editedJob.profileId,
        summary: this.editedJob.summary,
        status: this.editedJob.status != null ? this.editedJob.status.value : null,
        mode: this.editedJob.mode != null ? this.editedJob.mode.value : null,
        crawlingDepth: this.editedJob.crawlingDepth,
        isActiveRecursive: this.editedJob.isActiveRecursive,
        foundationType: this.editedJob.foundationType != null ? this.editedJob.foundationType.value : null,
        filter: this.editedJob.filter == null ? {
          country: "",
          title: "",
          workplace: "",
          school: "",
          educationLevel: "",
          department: ""
        } : {
          country: this.editedJob.filter.country,
          title: this.editedJob.filter.title,
          workplace: this.editedJob.filter.workplace,
          school: this.editedJob.filter.school,
          educationLevel: this.editedJob.filter.educationLevel,
          department: this.editedJob.filter.department
        }
      }
      axiosInstance.post("save-job", data)
          .then(response => {
            if (response.status == 200) {

              const resData = response.data;

              const item = {
                summary: resData.summary,
                profileId: resData.profileId,
                status: this.allStatus[resData.status - 1],
                mode: this.modes[resData.mode - 1],
                referenceKey: resData.referenceKey,
                isActiveRecursive: resData.isActiveRecursive,
                crawlingDepth: resData.crawlingDepth,
                foundationType: this.foundationTypes[resData.foundationType - 1],
                filter: resData.filter == null ? {
                  country: "",
                  title: "",
                  workplace: "",
                  school: "",
                  educationLevel: "",
                  department: ""
                } : {
                  country: resData.filter.country,
                  title: resData.filter.title,
                  workplace: resData.filter.workplace,
                  school: resData.filter.school,
                  educationLevel: resData.filter.educationLevel,
                  department: resData.filter.department
                }
              }

              const index = this.jobs.findIndex(value => value.referenceKey == item.referenceKey);
              Vue.$log.info("ref : " + item.referenceKey + " index : " + index)
              this.jobs.forEach(value => Vue.$log.info(value.summary + " : " + value.referenceKey))

              if (index > -1) {
                Object.assign(this.jobs[index], item)
              } else {
                this.jobs.unshift(item)
                this.serverItemsLength += 1;
                Vue.$log.debug("Job saved : " + item.summary)
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
