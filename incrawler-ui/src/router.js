import Vue from "vue";
import VueRouter from "vue-router";

import Home from "./components/pages/Home";
import CrawlingJobTable from "./components/management/CrawlingJobTable.vue";
import ProxyServerTable from "@/components/management/ProxyServerTable";
import LinkedinAccountTable from "@/components/management/LinkedinAccountTable";
import CrawledProfilesTable from "@/components/management/CrawledProfilesTable";
import ProcessedProfilesTable from "@/components/management/ProcessedProfilesTable";
import ProfileDetail from "@/components/management/ProfileDetail";

Vue.use(VueRouter);

const routes = [
    {path: "/", component: Home},
    {path: "/crawling-job-operations", component: CrawlingJobTable},
    {path: "/linkedin-account-management", component: LinkedinAccountTable},
    {path: "/proxy-server-management", component: ProxyServerTable},
    {path: "/processed-profiles", component: ProcessedProfilesTable},
    {path: "/crawled-profiles", component: CrawledProfilesTable},
    {name: "profile-detail", path: "/profile-detail/:referenceKey", component: ProfileDetail}
];

export const router = new VueRouter({
    mode: "history",
    routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { x: 0, y: 0 };
		}
	}
});
