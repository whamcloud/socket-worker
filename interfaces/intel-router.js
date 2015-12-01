// @flow

type routerInstance = {
  verbs: {
    GET: string;
  };
  all(path: string, fn: Function): routerInstance;
  go (path: string | RegExp, req: Object, resp: Object): void;
}

declare module 'intel-router' {
  declare var exports: () => routerInstance;
}
