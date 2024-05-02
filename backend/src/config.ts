// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { Configuration, OAuth2Api, OidcApi } from "@ory/hydra-client"

const baseOptions: any = {}

if (process.env.MOCK_TLS_TERMINATION) {
  baseOptions.headers = { "X-Forwarded-Proto": "https" }
}

const configuration = new Configuration({
  basePath: "http://localhost:4445",
  baseOptions,
})
const oauth2Client = new OAuth2Api(configuration)

export { oauth2Client }  

// const x = {
//   "client_id": "531db1a0-4986-4378-b2f1-fe140cd43687",
//   "client_name": "",
//   "client_secret": "Lh880HNouUc5Gosx~yMvZe5dRk",
//   "client_secret_expires_at": 0,
//   "client_uri": "",
//   "created_at": "2024-04-23T15:04:41Z",
//   "grant_types": [
//     "authorization_code",
//     "refresh_token"
//   ],
//   "jwks": {},
//   "logo_uri": "",
//   "metadata": {},
//   "owner": "",
//   "policy_uri": "",
//   "redirect_uris": [
//     "http://127.0.0.1:5555/callback"
//   ],
//   "registration_access_token": "ory_at_7iauvNA7UVsk_3VxsysguAMOEHIbycmphJ3dzu6osMc.YstdlG-4MkFURGwEzZD5X7HqeIh8Ait6hb_jehAvt30",
//   "registration_client_uri": "http://127.0.0.1:4444/oauth2/register/",
//   "request_object_signing_alg": "RS256",
//   "response_types": [
//     "code",
//     "id_token"
//   ],
//   "scope": "openid offline",
//   "skip_consent": false,
//   "skip_logout_consent": false,
//   "subject_type": "public",
//   "token_endpoint_auth_method": "client_secret_basic",
//   "tos_uri": "",
//   "updated_at": "2024-04-23T15:04:40.599263Z",
//   "userinfo_signed_response_alg": "none"
// }