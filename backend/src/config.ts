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
