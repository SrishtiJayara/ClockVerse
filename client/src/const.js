export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
// Generate login URL at runtime so redirect URI reflects the current origin.
export var getLoginUrl = function () {
    var oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    var appId = import.meta.env.VITE_APP_ID;
    var redirectUri = "".concat(window.location.origin, "/api/oauth/callback");
    var state = btoa(redirectUri);
    var url = new URL("".concat(oauthPortalUrl, "/app-auth"));
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
};
