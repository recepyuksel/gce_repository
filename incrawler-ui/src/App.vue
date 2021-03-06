<template>
  <v-app>
    <Header></Header>
    <v-row >
      <v-col md="2">
        <Sidebar></Sidebar>
      </v-col>
      <v-col md="10" class="main-container">
        <router-view></router-view>
      </v-col>
    </v-row>
    <Footer></Footer>
  </v-app>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default {
  name: "app",
  components: {
    Header,
    Footer,
    Sidebar
  },
  mounted: function () {
    let elHtml = document.getElementsByTagName('html')[0]
    elHtml.style.overflowY = 'hidden'
  },
  destroyed: function () {
    let elHtml = document.getElementsByTagName('html')[0]
    elHtml.style.overflowY = null
  }
};
</script>

<style>
.main-container {
  max-height: calc(100vh - 120px);
  height:auto;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
