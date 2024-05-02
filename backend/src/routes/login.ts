// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import express from "express"
import url from "url"
import { verifySession } from "supertokens-node/recipe/session/framework/express"
import { oauth2Client } from "../config"
import { oidcConformityMaybeFakeAcr } from "./stub/oidc-cert"
import { SessionRequest } from "supertokens-node/framework/express"

const router = express.Router()

router.get("/", verifySession({ sessionRequired: false }), (req: SessionRequest, res, next) => {
  // Parses the URL query
  const query = url.parse(req.url, true).query

  // The challenge is used to fetch information about the login request from ORY Hydra.
  const challenge = String(query.login_challenge)
  if (!challenge) {
    next(new Error("Expected a login challenge to be set but received none."))
    return
  }

  oauth2Client
    .getOAuth2LoginRequest({ loginChallenge: challenge})
    .then(({ data: body }) => {
      // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
      // the user.
      if (body.skip) {
        // You can apply logic here, for example update the number of times the user logged in.
        // ...

        // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
        // (e.g. your arch-enemy logging in...)
        return oauth2Client
          .acceptOAuth2LoginRequest({ loginChallenge: challenge, acceptOAuth2LoginRequest: {
            // All we need to do is to confirm that we indeed want to log in the user.
            subject: String(body.subject),
          }})
          .then(({ data: body }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(body.redirect_to))
          })
      } else if (req.session) {
        // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
        // (e.g. your arch-enemy logging in...)
        return oauth2Client
          .acceptOAuth2LoginRequest({ loginChallenge: challenge, acceptOAuth2LoginRequest: {
            // All we need to do is to confirm that we indeed want to log in the user.
            subject: String(req.session.getUserId()),
          }})
          .then(({ data: body }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(body.redirect_to))
          })
      }

      // If authentication can't be skipped we MUST show the login UI.
      res.redirect(`http://localhost:3001/auth/?hint=${body.oidc_context?.login_hint ?? ""}&redirectToPath=${encodeURIComponent("continue-login?login_challenge="+challenge)}`)
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(next)
})

router.post("/", verifySession({ sessionRequired: true }), (req: SessionRequest, res, next) => {
  // The challenge is now a hidden input field, so let's take it from the request body instead
  const challenge = req.body.challenge

  // Let's see if the user decided to accept or reject the consent request..
  if (req.body.submit === "Deny access") {
    // Looks like the consent request was denied by the user
    return (
      oauth2Client
        .rejectOAuth2LoginRequest({ loginChallenge: challenge, rejectOAuth2Request: {
          error: "access_denied",
          error_description: "The resource owner denied the request",
        }})
        .then(({ data: body }) => {
          // All we need to do now is to redirect the browser back to hydra!
          res.redirect(String(body.redirect_to))
        })
        // This will handle any error that happens when making HTTP calls to hydra
        .catch(next)
    )
  }

  // Seems like the user authenticated! Let's tell hydra...

  oauth2Client
    .getOAuth2LoginRequest({loginChallenge: challenge})
    .then(({ data: loginRequest }) =>
      oauth2Client
        .acceptOAuth2LoginRequest({ loginChallenge: challenge, acceptOAuth2LoginRequest: {
          // Subject is an alias for user ID. A subject can be a random string, a UUID, an email address, ....
          subject: req.session!.getUserId(),

          // This tells hydra to remember the browser and automatically authenticate the user in future requests. This will
          // set the "skip" parameter in the other route to true on subsequent requests!
          remember: Boolean(req.body.remember),

          // When the session expires, in seconds. Set this to 0 so it will never expire.
          remember_for: 3600,

          // Sets which "level" (e.g. 2-factor authentication) of authentication the user has. The value is really arbitrary
          // and optional. In the context of OpenID Connect, a value of 0 indicates the lowest authorization level.
          // acr: '0',
          //
          // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
          // the app is built for the automated OpenID Connect Conformity Test Suite. You
          // can peak inside the code for some ideas, but be aware that all data is fake
          // and this only exists to fake a login system which works in accordance to OpenID Connect.
          //
          // If that variable is not set, the ACR value will be set to the default passed here ('0')
          acr: oidcConformityMaybeFakeAcr(loginRequest, "0"),
        }})
        .then(({ data: body }) => {
          // All we need to do now is to redirect the user back to hydra!
          res.redirect(String(body.redirect_to))
        }),
    )
    // This will handle any error that happens when making HTTP calls to hydra
    .catch((err) => { next(err)})

  // You could also deny the login request which tells hydra that no one authenticated!
  // hydra.rejectLoginRequest(challenge, {
  //   error: 'invalid_request',
  //   errorDescription: 'The user did something stupid...'
  // })
  //   .then(({body}) => {
  //     // All we need to do now is to redirect the browser back to hydra!
  //     res.redirect(String(body.redirectTo));
  //   })
  //   // This will handle any error that happens when making HTTP calls to hydra
  //   .catch(next);
})

export default router
