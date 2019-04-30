// Jest unit tests
import WebApiBridge from '../index';

// create test data
const apiResultObject = { my: 'oh', num: 32.5 };
const errorMessage = 'Whoops!';
const eventOriginTest = { origin: 'no match', nativeEvent: { data: 'dummy' } };

class TestAPI {
  constructor() {
    this.testFunc = jest.fn();
    this.resultFunc = () => (
      new Promise((resolve) => {
        resolve(apiResultObject);
      })
    );
    this.errorFunc = () => { throw new Error(errorMessage); };
    this.errorResultFunc = () => (
      new Promise((resolve, reject) => {
        reject(new Error(errorMessage));
      })
    );
  }
}

class TestIPC {
  constructor() {
    this.postMessage = jest.fn();
    this.ReactNativeWebView = {
      postMessage: jest.fn(),
    };
  }
}

describe('WebApiBridge', () => {
  let wab;
  let testAPI;
  let testIPC;

  beforeEach(() => {
    wab = new WebApiBridge();
    testAPI = new TestAPI();
    testIPC = new TestIPC();
    wab.apis = [testAPI];
    wab.ipc = testIPC;
  });

  const testFuncMsg = {
    type: 'request',
    msgId: 1,
    targetFunc: 'testFunc',
    args: [],
    wantResult: false,
    error: null,
    sourceHref: 'http://localhost/',
  };

  // validate an origin failure

  it('returns right away if the event is from a different origin', () => {
    wab.origin = ':3000';
    wab.onMessage(eventOriginTest);
    expect(testIPC.postMessage).not.toHaveBeenCalled();
  });

  // validate receiving data from the other side

  it('displays a console.warn(), given an incomming message is not JSON', () => {
    console.warn = jest.fn();
    wab.onMessage('message', 'Can you be fooled?');
    expect(console.warn).toHaveBeenCalled();
  });

  it('displays a console.warn(), given an incomming message type is not a \'request\' or \'response\'', () => {
    console.warn = jest.fn();
    const badTypeMessage = { ...testFuncMsg, type: 'invalid' };
    wab.onMessage('message', JSON.stringify(badTypeMessage));
    expect(console.warn).toHaveBeenCalled();
  });

  it('calls an api function and doesn\'t send response, given a request doesn\'t require a result', () => {
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(testAPI.testFunc).toHaveBeenCalled();
    expect(testIPC.postMessage).not.toHaveBeenCalled();
  });

  it('sends an error, given a request asking for result on api call not returning a promise', () => {
    const wantResultMsg = { ...testFuncMsg, wantResult: true };
    const expectedResultMsg = {
      ...wantResultMsg, type: 'response', args: [], error: 'Cannot read property \'then\' of undefined',
    };
    wab.onMessage('message', JSON.stringify(wantResultMsg));
    expect(testAPI.testFunc).toHaveBeenCalled();
    expect(testIPC.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
  });

  it('sends a result using ReactNativeWebView, given a response coming from a ReactNativeWebView', () => {
    const wantResultMsg = { ...testFuncMsg, wantResult: true };
    const expectedResultMsg = {
      ...wantResultMsg, type: 'response', args: [], error: 'Cannot read property \'then\' of undefined',
    };
    wab.useReactNativeWebView = true;
    wab.onMessage('message', JSON.stringify(wantResultMsg));
    expect(testAPI.testFunc).toHaveBeenCalled();
    expect(testIPC.ReactNativeWebView.postMessage)
      .toHaveBeenCalledWith(JSON.stringify(expectedResultMsg));
  });

  it('calls an api function with params, given an incoming request has params', () => {
    const args = [5, { key: 'value' }];
    const argRequestMsg = {
      ...testFuncMsg, args,
    };
    wab.onMessage('message', JSON.stringify(argRequestMsg));
    expect(testAPI.testFunc).toHaveBeenCalledWith(...args);
  });

  it('returns a result from an api call, given an incoming request with wantResult is true', (done) => {
    const argRequestMsg = { ...testFuncMsg, targetFunc: 'resultFunc', wantResult: true };
    const expectedResultMsg = { ...argRequestMsg, type: 'response', args: [apiResultObject] };
    wab.onMessage('message', JSON.stringify(argRequestMsg));

    testIPC.postMessage = (result, targetOrigin) => {
      expect(result).toBe(JSON.stringify(expectedResultMsg));
      expect(targetOrigin).toBe('*');
      done();
    };
  });

  it('responds with an error, given results required to non-existent api function', () => {
    const argRequestMsg = { ...testFuncMsg, targetFunc: 'nonexistentFunc', wantResult: true };
    const expectedResultMsg = { ...argRequestMsg, type: 'response', error: 'function does not exist' };
    wab.onMessage('message', JSON.stringify(argRequestMsg));
    expect(testIPC.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
  });

  it('responds with an error, given no results required to non-existent api function', () => {
    const argRequestMsg = { ...testFuncMsg, targetFunc: 'nonexistentFunc' };
    const expectedResultMsg = { ...argRequestMsg, type: 'response', error: 'function does not exist' };
    wab.onMessage('message', JSON.stringify(argRequestMsg));
    expect(testIPC.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
  });

  it('Does not display a warn, given remote responds with \'function does not exist\' error', () => {
    const argResponseMsg = {
      ...testFuncMsg, targetFunc: 'nonexistentFunc', type: 'response', error: 'function does not exist',
    };
    console.warn = jest.fn();
    wab.onMessage('message', JSON.stringify(argResponseMsg));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('always responds with an error, given an error is thrown when an api call is made', () => {
    // make sure error is returned if wantResult is true
    const errRequestMsg = { ...testFuncMsg, targetFunc: 'errorFunc', wantResult: true };
    const expectedResultMsg = { ...errRequestMsg, type: 'response', error: errorMessage };
    wab.onMessage('message', JSON.stringify(errRequestMsg));
    expect(testIPC.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');

    // make sure error is returned if wantResult is false
    const errDontWantResultMsg = { ...testFuncMsg, msgId: 2, targetFunc: 'errorFunc' };
    const expectedDontWantResultRespMsg = { ...errDontWantResultMsg, type: 'response', error: errorMessage };
    wab.onMessage('message', JSON.stringify(errDontWantResultMsg));
    expect(testIPC.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedDontWantResultRespMsg), '*');
  });

  it('responds with an error, given an error is thrown when an api call promise fails', (done) => {
    // make sure error is returned if wantResult is true
    const errRequestMsg = { ...testFuncMsg, targetFunc: 'errorResultFunc', wantResult: true };
    const expectedResultMsg = { ...errRequestMsg, type: 'response', error: errorMessage };
    wab.onMessage('message', JSON.stringify(errRequestMsg));
    testIPC.postMessage = (result, targetOrigin) => {
      expect(result).toBe(JSON.stringify(expectedResultMsg));
      expect(targetOrigin).toBe('*');
      done();
    };
  });

  it('calls api but displays a console.warn(), given the msgId of the request doesn\'t increment', () => {
    // make an initial good call with message #1
    console.warn = jest.fn();
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(console.warn).not.toHaveBeenCalled();

    // make sure warning isn't called again if the number is correctly imcremented to 2
    const msg2 = { ...testFuncMsg, msgId: 2 };
    const msg2String = JSON.stringify(msg2);
    wab.onMessage('message', msg2String);
    expect(console.warn).not.toHaveBeenCalled();
    expect(testAPI.testFunc).toHaveBeenCalledTimes(2);

    // keep id at 1 instead of incrementing it
    wab.onMessage('message', msg2String);
    expect(console.warn).toHaveBeenCalledWith(`expected request with { msgID: 3 } got: ${msg2String}`);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(testAPI.testFunc).toHaveBeenCalledTimes(3);

    // make sure warning isn't called again if the number is correct
    const msg3 = { ...msg2, msgId: 3 };
    wab.onMessage('message', JSON.stringify(msg3));
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(testAPI.testFunc).toHaveBeenCalledTimes(4);

    // now go backwards with the count to generate another warning
    wab.onMessage('message', msg2String);
    expect(console.warn).toHaveBeenCalledWith(`expected request with { msgID: 4 } got: ${msg2String}`);
    expect(testAPI.testFunc).toHaveBeenCalledTimes(5);
  });

  it('ignores msgId for first messages on either side so restarting doesn\'t cause warnings', () => {
    // simulate that we've restarted (expect a message id of 1)
    console.warn = jest.fn();
    const msg4 = { ...testFuncMsg, msgId: 4 };
    const msg4String = JSON.stringify(msg4);
    wab.onMessage('message', msg4String);
    expect(console.warn).not.toHaveBeenCalled();
    expect(testAPI.testFunc).toHaveBeenCalledTimes(1);

    // other side should now send 5, no warning if it does
    const msg5 = { ...testFuncMsg, msgId: 5 };
    const msg5String = JSON.stringify(msg5);
    wab.onMessage('message', msg5String);
    expect(console.warn).not.toHaveBeenCalled();
    expect(testAPI.testFunc).toHaveBeenCalledTimes(2);

    // make it some incorrect value instead of incrementing it
    const msg2 = { ...testFuncMsg, msgId: 2 };
    const msg2String = JSON.stringify(msg2);
    wab.onMessage('message', msg2String);
    expect(console.warn).toHaveBeenCalledWith(`expected request with { msgID: 6 } got: ${msg2String}`);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(testAPI.testFunc).toHaveBeenCalledTimes(3);

    // simulate the other side resetting by having it send 1
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(console.warn).toHaveBeenCalledTimes(1); // no increment
    expect(testAPI.testFunc).toHaveBeenCalledTimes(4);

    // now we expect 2 and should not get a warning if that's what we get
    wab.onMessage('message', msg2String);
    expect(console.warn).toHaveBeenCalledTimes(1); // no increment
    expect(testAPI.testFunc).toHaveBeenCalledTimes(5);
  });

  it('passes all request and response messages to a listener', (done) => {
    const callback = jest.fn();
    wab.listener = callback;
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(callback).toHaveBeenCalledWith({ ...testFuncMsg, args: [] });
    expect(callback).toHaveBeenCalledTimes(1);

    const wantResultMsg = { ...testFuncMsg, targetFunc: 'resultFunc', wantResult: true };
    wab.onMessage('message', JSON.stringify(wantResultMsg));

    testIPC.postMessage = () => {
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenLastCalledWith({ ...wantResultMsg, type: 'response', args: [apiResultObject] });
      done();
    };
  });

  it('supports calls to a second api object', () => {
    const secondAPI = {
      secondAPIFunc: jest.fn(),
    };
    wab.apis = [testAPI, secondAPI];
    const secondAPITestFuncMsg = { ...testFuncMsg, targetFunc: 'secondAPIFunc' };

    wab.onMessage('message', JSON.stringify(secondAPITestFuncMsg));
    expect(secondAPI.secondAPIFunc).toHaveBeenCalled();
  });

  it('calls into the last api object, given more than one supporting a function exists', () => {
    const secondAPI = {
      testFunc: jest.fn(),
    };
    wab.apis = [testAPI, secondAPI];
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(secondAPI.testFunc).toHaveBeenCalled();
    expect(testAPI.testFunc).not.toHaveBeenCalled();
  });

  // validate sending api calls to the other side

  it('sending an api call returns a Promise, given the send says it wants a result', () => {
    expect(wab.send('testFunc', [], true)).toBeInstanceOf(Promise);
  });

  it('sends an api request without requesting a result, given the send says not to', () => {
    expect(wab.send('testFunc', [], false)).toBeNull();
    expect(JSON.parse(testIPC.postMessage.mock.calls[0][0])).toEqual(testFuncMsg);
  });

  it('sends an api request using using ReactNativeWebView, given request from a ReactNativeWebView', () => {
    wab.useReactNativeWebView = true;
    expect(wab.send('testFunc', [], false)).toBeNull();
    expect(JSON.parse(testIPC.ReactNativeWebView.postMessage.mock.calls[0][0]))
      .toEqual(testFuncMsg);
  });

  it('sends an api request without requesting a result by default', () => {
    expect(wab.send('testFunc', [])).toBeNull();
    expect(JSON.parse(testIPC.postMessage.mock.calls[0][0])).toEqual(testFuncMsg);
  });

  it('sends an api request that is resolved without a result, given a response has none', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', args: [] };
    testIPC.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('testFunc', [], true).then(data => expect(data).toBe(undefined));
  });

  it('sends an api request that is resolved with a result, given other side returns one', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', args: [apiResultObject] };
    testIPC.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('testFunc', [], true).then(data => expect(data).toEqual(apiResultObject));
  });

  it('rejects a send Promise, given an error response was received', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', error: errorMessage };
    testIPC.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('resultFunc', [], true).catch(e => expect(e).toEqual(resultFuncMsg));
  });

  it('displays a warning, given we send an api request that caused a remote error', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', error: errorMessage };
    testIPC.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });
    console.warn = jest.fn();
    wab.send('resultFunc', [], false);
    expect(JSON.parse(console.warn.mock.calls[0])).toEqual(resultFuncMsg);
  });

  it('passes requests generated by send() to a listener', () => {
    const callback = jest.fn();
    wab.listener = callback;
    wab.send('testFunc', [], false);
    expect(callback).toHaveBeenCalledWith(testFuncMsg);
  });
});
