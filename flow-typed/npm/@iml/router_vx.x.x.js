// @flow


declare module '@iml/router' {
  declare type routerInstance = {
    verbs: {
      GET: string
    },
    all(path: string, fn: Function): routerInstance,
    get(path: string, fn: Function): routerInstance,
    go(path: string | RegExp, req: Object, resp: Object): void,
    addStart(Function): routerInstance
  };
  declare export default () => routerInstance;
}
