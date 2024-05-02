// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import express, { NextFunction, Response, Request } from "express"
import path from "path"
import cors from "cors";
import logger from "morgan"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

import routes from "./routes"
import login from "./routes/login"
import logout from "./routes/logout"
import consent from "./routes/consent"

import SuperTokens from "supertokens-node"
import Session from "supertokens-node/recipe/session"
import EmailPassword from "supertokens-node/recipe/emailpassword"
import EmailVerification from "supertokens-node/recipe/emailverification"
import UserMetadata from "supertokens-node/recipe/usermetadata"
import { middleware, errorHandler } from "supertokens-node/framework/express";

const app = express()

SuperTokens.init({
  // debug: true,
  supertokens: {
      // this is the location of the SuperTokens core.
      connectionURI: "https://try.supertokens.com",
      // connectionURI: "http://localhost:9000",
  },
  appInfo: {
    apiDomain: "http://localhost:3000",
    appName: "Ory OAUTH",
    websiteDomain: "http://localhost:3001",
  },
  recipeList: [
    Session.init(),
    EmailPassword.init(),
    EmailVerification.init({
      mode: "OPTIONAL",
    }),
    UserMetadata.init(),
  ],
});

// view engine setup
app.set("views", path.join(__dirname, "..", "views"))
app.set("view engine", "pug")

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors({
  allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
  credentials: true,
  origin: ["http://localhost:3001"],
}));

app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use(middleware());
app.use("/", routes)
app.use("/login", login)
app.use("/logout", logout)
app.use("/consent", consent)

app.use(errorHandler());

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(new Error("Not Found"))
})

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use((err: Error, req: Request, res: Response) => {
    res.status(500)
    res.render("error", {
      message: err.message,
      error: err,
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err: Error, req: Request, res: Response) => {
  res.status(500)
  res.render("error", {
    message: err.message,
    error: {},
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).render("error", {
    message: JSON.stringify(err, null, 2),
  })
})

const listenOn = Number(process.env.PORT || 3000)
app.listen(listenOn, () => {
  console.log(`Listening on http://0.0.0.0:${listenOn}`)
})
