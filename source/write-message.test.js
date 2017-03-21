// @flow

import writeMessage from './write-message.js';
import { jasmine, describe, it, beforeEach, expect } from './jasmine.js';

describe('write message', () => {
  let selfWorker;

  beforeEach(() => {
    selfWorker = {
      postMessage: jasmine.createSpy('postMessage')
    };

    writeMessage(selfWorker, 1, {
      path: '/path',
      options: {
        method: 'get'
      }
    });
  });

  it('should call postMessage', () => {
    expect(selfWorker.postMessage).toHaveBeenCalledOnceWith({
      type: 'message',
      id: 1,
      payload: {
        path: '/path',
        options: {
          method: 'get'
        }
      }
    });
  });
});
