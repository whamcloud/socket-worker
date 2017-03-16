// @flow

declare var self: {
  location: {
    origin: string
  },
  postMessage(obj: Object): void,
  addEventListener(
    str: string,
    handler: (ev: { data: Object }) => void,
    bubbles: boolean
  ): void
};
