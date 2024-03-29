let auth0Client = null;
const fetchAuthConfig = () => fetch("./auth_config.json");
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId
    });
};

window.onload = async () => {
    await configureClient();
    updateUI();

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        return;
    }
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0Client.handleRedirectCallback();

        updateUI();
        window.history.replaceState({}, document.title, "/");
    }
};

const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();

    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
    if (isAuthenticated) {
        document.getElementById("gated-content-lorem-ipsum").classList.remove("hidden")
        document.getElementById("inverse-gated").style = "display: none;"
        /*document.getElementById(
            "ipt-access-token"
        ).innerHTML = await auth0Client.getTokenSilently();*/

        document.getElementById("ipt-user-profile").textContent = JSON.stringify(
            await auth0Client.getUser()
        );
        await profilePicture();

    } else {
        document.getElementById("gated-content").classList.add("hidden");
    }

    async function profilePicture() {
        document.getElementById("profile-picture-nav").src = (await auth0Client.getUser()).picture;
        document.getElementById("profile-picture-nav").style = "width: 50px; height: 50px; border: 2px solid; border-radius: 100px; border-color: #ffffff80";
    }
};
updateUI();
const login = async () => {
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: "https://bloodrench.github.io/"
        }
    });
};

const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: "https://bloodrench.github.io/"
        }
    });
};
