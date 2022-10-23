import { install } from 'source-map-support';
import { hostname } from 'node:os';
import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';

install();

const PORT = 8080;
const VERSION = process.env.VERSION ?? 'dev';
const SECOND = 1000; // ms

let alive = true;
let error = false;
let errorTimer: NodeJS.Timer | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debug(message?: any, ...optionalParams: any[]) {
  console.debug(`[DEBUG] ${message}`, ...optionalParams);
}

const app = new Koa();

const router = new Router();

router.get('/readyz', (ctx) => {
  if (error) {
    ctx.body = { status: 'ERROR' };
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
  };
});

app.use(logger()).use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(
    `k8s-simple-app version ${VERSION} listening on http://localhost:${PORT}/ ...`
  );
});
