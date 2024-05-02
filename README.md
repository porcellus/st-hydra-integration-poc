## How to run

### 1. Start up hydra

1. Clone `https://github.com/ory/hydra.git`
2. Edit `quickstart.yml` and remove the `consent` container (lines 52-60)
3. Edit `contrib/quickstart/5-min/hydra.yml` and replace `127.0.0.1` with `localhost`
4. Run `docker compose -f quickstart.yml up -d`

### 2. Register an OAuth2 client

You can create an OAuth2 client by running the following script from the hydra repo directory. Please save the output, as it will be required for future steps
```bash
docker compose \
    -f quickstart.yml exec hydra hydra create client \
    --endpoint http://127.0.0.1:4445 \
    --grant-type authorization_code,refresh_token \
    --response-type code,id_token \
    --format json \
    --scope openid --scope offline --scope profile \
    --redirect-uri http://localhost.com:3031/auth/callback/ory \
    --token-endpoint-auth-method client_secret_post
```

#### 3. Create and run an OAuth2 client application

1. Create an example app using our CLI: `npx create-supertokens-app --recipe=thirdparty`.
2. Update `backend/config.ts` in the generated example to match:

```ts
export const SuperTokensConfig: TypeInput = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: "https://try.supertokens.com",
    },
    appInfo: {
        appName: "SuperTokens Demo App",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        ThirdParty.init({
            signInAndUpFeature: {
                providers: [
                    // We have provided you with development keys which you can use for testing.
                    // IMPORTANT: Please replace them with your own OAuth keys for production use.
                    
                    {
                        config: {
                            name:"Ory",
                            thirdPartyId: "ory",
                            oidcDiscoveryEndpoint: "http://localhost.com:4444/",
                            authorizationEndpointQueryParams: {
                                scope: "profile"
                            },
                            userInfoMap: {
                                fromUserInfoAPI: {
                                    email: "sub",
                                    userId: "sub",
                                }
                            },
                            clients: [
                                {
                                    // Replace these with the info from step 2.
                                    clientId: "client_id",
                                    clientSecret: "client_secret",
                                },
                            ],
                        },
                    },
                ],
            },
        }),
        Session.init(),
        Dashboard.init(),
        UserRoles.init(),
    ],
};
```
3. `npm start`


### 3. Install dependencies

Install dependencies in the 3 project folders in this repo:
1. `npm i`
2. `cd backend && npm i`
3. `cd frontend && npm i`

### 4. Add the following to your hosts configs `/etc/hosts`

```
127.0.0.1   localhost.com
```

### 5. Run the OAuth provider example

Run `npm start` from the root of this repo
