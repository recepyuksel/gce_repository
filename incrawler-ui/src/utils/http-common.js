import axios from 'axios';
import {getInstance} from "./KeycloakUtil";
import {api_url} from "../auth_config.json";

export const axiosInstance = axios.create({
    baseURL: api_url
});

axiosInstance.interceptors.request.use(config => {
    config.headers["Authorization"] = "Bearer " + getInstance().getBearerToken();
    return config;
});
