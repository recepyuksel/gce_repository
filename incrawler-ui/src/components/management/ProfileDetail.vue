<template>
  <div>
    <v-row v-if="profile!=null">
      <v-col md="4">
        <v-card
            class="mx-auto"
            align="left"
            outlined
        >
          <v-list-item three-line>
            <v-list-item-avatar
                tile
                size="80"
                color="grey"
            ><img
                v-if="profile.pictureUrl"
                alt="Avatar"
                :src=" profile.pictureUrl"
            ></v-list-item-avatar>
            <v-list-item-content>
              <div class="overline mb-4">
                {{profile.location}}
              </div>
              <v-list-item-title class="headline mb-1">
                {{ profile.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ profile.headline }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ profile.industry }}</v-list-item-subtitle>
              <v-list-item-subtitle>Connection count : {{ profile.connectionsCount }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-card-text>{{ profile.summary }}</v-card-text>
        </v-card>
        <v-expansion-panels class="mb-6" v-if="profile.educations.length>0">
          Educations
          <v-expansion-panel
              v-for="(education,i) in profile.educations"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
               {{education.schoolName}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Field of Study</td>
                  <td>{{education.fieldOfStudy}}</td>
                </tr>
                <tr>
                  <td>Degree</td>
                  <td>{{education.degreeName}}</td>
                </tr>
                <tr>
                  <td>Start Date</td>
                  <td>{{format_date(education.startDate)}}</td>
                </tr>
                <tr>
                  <td>End Date</td>
                  <td>{{format_date(education.endDate)}}</td>
                </tr>
                <tr>
                  <td>Grade</td>
                  <td>{{education.grade}}</td>
                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col md="4">
        <v-expansion-panels class="mb-6" v-if="profile.certifications.length>0">
          Certifications
          <v-expansion-panel
              v-for="(certification,i) in profile.certifications"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              {{certification.name}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Authority</td>
                  <td>{{certification.authority}}</td>
                </tr>
                <tr>
                  <td>Url</td>
                  <td><a :href="certification.url">
                    {{certification.url}}
                  </a></td>
                </tr>
                <tr>
                  <td>Start Date</td>
                  <td>{{format_date(certification.startDate)}}</td>
                </tr>
                <tr>
                  <td>End Date</td>
                  <td>{{format_date(certification.endDate)}}</td>
                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-expansion-panels class="mb-6" v-if="profile.honors.length>0">
          Honors
          <v-expansion-panel
              v-for="(honor,i) in profile.honors"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              {{honor.title}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Description</td>
                  <td>{{honor.description}}</td>
                </tr>
                <tr>
                  <td>Issue Date</td>
                  <td>{{format_date(honor.issueDate)}}</td>
                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-expansion-panels class="mb-6" v-if="profile.recommendations.length>0">
          Recommendations
          <v-expansion-panel
              v-for="(recommendation,i) in profile.recommendations"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              <tr> <td><v-list-item-avatar
                  tile
                  size="40"
                  color="grey"
              ><img
                  v-if="recommendation.pictureUrl!=null"
                  alt="Avatar"
                  :src=" recommendation.pictureUrl"
              ></v-list-item-avatar></td><td>{{recommendation.firstName}} {{recommendation.lastName}}</td></tr>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Occupation</td>
                  <td>{{recommendation.occupation}}</td>
                </tr>
                <tr>
                  <td>Profile Link</td>
                  <td><a :href="`http://www.linkedin.com/in/${recommendation.publicIdentifier}`">
                    {{ recommendation.publicIdentifier }}
                  </a></td>
                </tr>
                <tr>
                  <td>Text</td>
                  <td>{{recommendation.text}}</td>
                </tr>
                <tr>
                  <td>Relation</td>
                  <td>{{recommendation.relationShip}}</td>
                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col md="4">
        <v-expansion-panels class="mb-6" v-if="profile.projects.length>0">
          Projects
          <v-expansion-panel
              v-for="(project,i) in profile.projects"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              {{project.title}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Description</td>
                  <td>{{project.description}}</td>
                </tr>
                <tr>
                  <td>Url</td>
                  <td> <a :href="project.url">
                    {{project.url}}
                  </a></td>
                </tr>
                <tr>
                  <td>Start Date</td>
                  <td>{{format_date(project.startDate)}}</td>
                </tr>
                <tr>
                  <td>End Date</td>
                  <td>{{format_date(project.endDate)}}</td>
                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels class="mb-6" v-if="profile.employmentPositions.length>0">
          Employment Positions
          <v-expansion-panel
              v-for="(employmentPosition,i) in profile.employmentPositions"
              :key="i"
          >
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              {{employmentPosition.companyName}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <tbody>
                <tr>
                  <td>Start Date</td>
                  <td>{{format_date(employmentPosition.startDate)}}</td>
                </tr>
                <tr>
                  <td>End Date</td>
                  <td>{{format_date(employmentPosition.endDate)}}</td>
                </tr>
                <tr>

                  <v-simple-table >
                <thead>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>End Date</th>
              </thead>
                <tbody>
                <tr v-for="(position, i) in employmentPosition.positions"
                    :key="i">
                  <td>{{position.title}}</td>
                  <td>{{position.description}}</td>
                  <td>{{position.location}}</td>
                  <td>{{format_date(position.startDate)}}</td>
                  <td>{{format_date(position.endDate)}}</td>
                </tr>
                </tbody>
              </v-simple-table>


                </tr>
                </tbody>
              </v-simple-table>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-expansion-panels class="mb-6" >
          <v-expansion-panel v-if="profile.interests.length>0">
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              Interests
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table height="300px">
                <tbody>
                <tr v-for="(item, i) in profile.interests"
                    :key="i">
                  <td>{{item.name}}</td>
                </tr>
                </tbody>
              </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="profile.skills.length>0">
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              Skills
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table height="300px">
                <tbody>
                <tr v-for="(item, i) in profile.skills"
                    :key="i">
                  <td>
                    <v-badge
                        inline
                        color="green"
                        :content="item.endorsementCount"
                    >
                      {{item.name}}
                    </v-badge>
                  </td>

                </tr>
                </tbody>
              </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="profile.contacts.length>0">
            <v-expansion-panel-header expand-icon="mdi-menu-down">
              Contacts
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table height="300px">
                <tbody>
                <tr v-for="(item, i) in profile.contacts"
                    :key="i">
                  <td>
                    <a :href="item.url">
                      {{item.url}}
                    </a>
                  </td>

                </tr>
                </tbody>
              </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>



  </div>
 </template>

<script>
import Vue from "vue";
import {axiosInstance} from "@/utils/http-common";
import moment from "moment";

export default {
  components: {},
  data: () => ({
    referenceKey:'',
    profile : null,
   }),
  created() {
    this.referenceKey = this.$route.params.referenceKey;
    this.initialize();
  },
  methods: {
    format_date(value) {
      if (value) {
        return moment(String(value)).format('DD.MM.YYYY')
      }
    },
    initialize() {

      axiosInstance.get(`get-profile-detail/` + this.referenceKey)
          .then(response => {
            if (response.status == 200) {
              this.profile = response.data.payload ;
              console.log(this.profile)
             }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

    }
  }

}

</script>
