import { install } from 'source-map-support';
import { hostname } from 'node:os';
import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import { config } from './config.js';

install();

const PORT = 8080;
const VERSION = process.env.VERSION ?? 'dev';
const SECOND = 1000; // ms

let alive = true;
let error = false;
let errorTimer: NodeJS.Timer | undefined;
let terminating = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debug(message?: any, ...optionalParams: any[]) {
  console.debug(`[DEBUG] ${message}`, ...optionalParams);
}

const app = new Koa();

const router = new Router();

router.get('/readyz', (ctx) => {
  if (error || terminating) {
    ctx.body = { status: error ? 'ERROR' : 'TERMINATING' };
    ctx.status = 500;
    return;
  }

  ctx.body = { status: 'OK' };
  ctx.status = 200;
});

router.get('/livez', (ctx) => {
  if (!alive) {
    ctx.status = 500;
    return;
  }

  ctx.status = 204;
});

router.get('/die', (ctx) => {
  debug('setting DEAD status');
  alive = false;
  ctx.status = 204;
});

router.get('/not-ready', (ctx) => {
  if (errorTimer) {
    clearTimeout(errorTimer);
  }
  error = true;
  const duration =
    typeof ctx.query.t === 'string' ? parseInt(ctx.query.t, 10) : 30;
  debug(`setting ERROR status for ${duration}s`);
  errorTimer = setTimeout(() => {
    debug('setting OK status');
    error = false;
    errorTimer = undefined;
  }, duration * SECOND);
  ctx.status = 204;
});

router.get('/id', (ctx) => {
  ctx.body = {
    id: hostname(),
    version: VERSION,
    secrets: {
      databasePassword: process.env.SECRET_DATABASE_PASSWORD ?? '[not set]',
    },
    config: config,
    foo: 'bar',
  };
});

app.use(logger()).use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(
    `k8s-simple-app version ${VERSION} listening on http://localhost:${PORT}/ ...`
  );
});

function signalHandler(signal: NodeJS.Signals) {
  if (terminating) {
    return;
  }

  terminating = true;
  debug(`got termination signal ${signal}, cleaning up...`);
  setTimeout(() => {
    debug('cleanup done, exiting...');
    process.exit(0);
  }, 10 * SECOND);
}

process.on('SIGTERM', signalHandler);
process.on('SIGINT', signalHandler);
