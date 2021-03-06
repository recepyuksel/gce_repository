import Vue from "vue";
import Keycloak from "keycloak-js";
import {EventBus} from "./event-bus";

let instance;

export const getInstance = () => instance;

export const authKeycloak = ({...options}) => {
    if (instance) return instance;

    instance = new Vue({
        created() {
            this.keycloak = Keycloak(this.config);
            this.keycloak.onReady = function (authenticated) {
                onReady(authenticated);
            };
            this.keycloak.onAuthSuccess = function () {
                onAuthSuccess();
            };
            this.keycloak.onAuthError = function () {
                onAuthError();
            };
            this.keycloak.onAuthRefreshSuccess = function () {
                onAuthRefreshSuccess();
            };
            this.keycloak.onAuthRefreshError = function () {
                onAuthRefreshError();
            };
            this.keycloak.onAuthLogout = function () {
                onAuthLogout();
            };
            this.keycloak.onTokenExpired = function () {
                onTokenExpired();
            };
        },
        data() {
            return {
                config: {
                    url: options.url,
                    realm: options.realm,
                    clientId: options.clientId,
                },
                isAuthenticated: false,
                user: {},
            };
        },
        methods: {
            login() {
                login();
            },
            logout() {
                logout();
            },
            getUserName() {
                return this.keycloak.tokenParsed.given_name;
            },
            isLoggedIn() {
                return this.isAuthenticated;
            },
            getBearerToken() {
                return localStorage.getItem(KEYCLOAK_TOKEN_CONSTANT);
            },
            hasRole(role){
                return this.keycloak.hasResourceRole(role);
            }
        },
    });
};

function logout() {
    Vue.$log.debug("Signing out...");
    instance.keycloak.logout({redirectUri: window.location.origin});
    Vue.$log.debug("Signed out.");
}

const KEYCLOAK_TOKEN_CONSTANT = "KEYCLOAK_TOKEN";

function onAuthSuccess() {
    console.log("onAuthSuccess");
    localStorage.setItem(KEYCLOAK_TOKEN_CONSTANT, instance.keycloak.token)
    EventBus.$emit("onAuthStatusUpdate", true);
}

function onReady(authenticated) {
    setInterval(() => {
        instance.keycloak
            .updateToken(3600)
            .then((refreshed) => {
                if (refreshed) {
                    Vue.$log.debug("Token refreshed");
                } else {
                    Vue.$log.warn(
                        "Token not refreshed, valid for " +
                        Math.round(
                            instance.keycloak.tokenParsed.exp +
                            instance.keycloak.timeSkew -
                            new Date().getTime() / 1000
                        ) +
                        " seconds"
                    );
                }
            })
            .catch(() => {
                Vue.$log.error("Failed to refresh token");
            });
    }, 60000);
    EventBus.$emit("onAuthStatusUpdate", authenticated);
    console.log("onReady => authenticated : " + authenticated);
}

function onAuthError() {
    console.log("onAuthError");
    EventBus.$emit("onAuthStatusUpdate", false);
}

function onAuthRefreshSuccess() {
    localStorage.setItem(KEYCLOAK_TOKEN_CONSTANT, instance.keycloak.token)
    console.log("onAuthRefreshSuccess");
}

function onAuthRefreshError() {
    console.log("onAuthRefreshError");
}

function onAuthLogout() {
    console.log("onAuthLogout");
    localStorage.setItem(KEYCLOAK_TOKEN_CONSTANT, null)
    EventBus.$emit("onAuthStatusUpdate", false);
}

function onTokenExpired() {
    console.log("onTokenExpired");
    localStorage.setItem(KEYCLOAK_TOKEN_CONSTANT, null)
    EventBus.$emit("onAuthStatusUpdate", false);
}

function login() {
    instance.keycloak
        .init({onLoad: "login-required"})
        .then((auth) => {
            instance.isAuthenticated = auth;

            if (auth) {
                console.log("authenticated");
            } else {
                console.log("no authentication");
            }
        })
        .catch((e) => {
            console.log("login hata : " + e);
            Vue.$log.error("Authenticated Failed");
        });
}


export const keycloakUtil = {
    install(Vue, options) {
        Vue.prototype.$keycloak = authKeycloak(options);
    },
};
