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

class TestTarget {
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
  let testTarget;

  beforeEach(() => {
    wab = new WebApiBridge();
    testAPI = new TestAPI();
    testTarget = new TestTarget();
    wab.apis = [testAPI];
    wab.target = testTarget;
  });

  const testFuncMsg = {
    type: 'request',
    msgId: 1,
    targetFunc: 'testFunc',
    args: [],
    wantResult: false,
    error: null,
  };

  // validate an origin failure

  it('returns right away if the event is from a different origin', () => {
    wab.origin = ':3000';
    wab.onMessage(eventOriginTest);
    expect(testTarget.postMessage).not.toHaveBeenCalled();
  });

  // validate receiving data from the other side

  it('returns right away if an incomming message is not a string', () => {
    console.warn = jest.fn();
    wab.onMessage('message', { A: 1, B: 2 });
    expect(testTarget.postMessage).not.toHaveBeenCalled();
  });

  it('returns right away if an incomming message does not have a targetFunc property', () => {
    console.warn = jest.fn();
    wab.onMessage('message', JSON.stringify({ A: 1, B: 2 }));
    expect(testTarget.postMessage).not.toHaveBeenCalled();
  });

  it('displays a console.warn(), given an incomming message is not valid JSON', () => {
    console.warn = jest.fn();
    wab.onMessage('message', '"targetFunc": { fred }');
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
    expect(testTarget.postMessage).not.toHaveBeenCalled();
  });

  it('sends an error, given a request asking for result on api call not returning a promise', () => {
    const wantResultMsg = { ...testFuncMsg, wantResult: true };
    const expectedResultMsg = {
      ...wantResultMsg, type: 'response', args: [], error: 'Cannot read property \'then\' of undefined',
    };
    wab.onMessage('message', JSON.stringify(wantResultMsg));
    expect(testAPI.testFunc).toHaveBeenCalled();
    expect(testTarget.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
  });

  it('sends a result using ReactNativeWebView, given a response coming from a ReactNativeWebView', () => {
    const wantResultMsg = { ...testFuncMsg, wantResult: true };
    const expectedResultMsg = {
      ...wantResultMsg, type: 'response', args: [], error: 'Cannot read property \'then\' of undefined',
    };
    wab.useReactNativeWebView = true;
    wab.onMessage('message', JSON.stringify(wantResultMsg));
    expect(testAPI.testFunc).toHaveBeenCalled();
    expect(testTarget.ReactNativeWebView.postMessage)
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

    testTarget.postMessage = (result, targetOrigin) => {
      expect(result).toBe(JSON.stringify(expectedResultMsg));
      expect(targetOrigin).toBe('*');
      done();
    };
  });

  it('responds with an error, given results required to non-existent api function', () => {
    const argRequestMsg = { ...testFuncMsg, targetFunc: 'nonexistentFunc', wantResult: true };
    const expectedResultMsg = { ...argRequestMsg, type: 'response', error: 'function does not exist' };
    wab.onMessage('message', JSON.stringify(argRequestMsg));
    expect(testTarget.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
  });

  it('responds with an error, given no results required to non-existent api function', () => {
    const argRequestMsg = { ...testFuncMsg, targetFunc: 'nonexistentFunc' };
    const expectedResultMsg = { ...argRequestMsg, type: 'response', error: 'function does not exist' };
    wab.onMessage('message', JSON.stringify(argRequestMsg));
    expect(testTarget.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');
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
    expect(testTarget.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedResultMsg), '*');

    // make sure error is returned if wantResult is false
    const errDontWantResultMsg = { ...testFuncMsg, msgId: 2, targetFunc: 'errorFunc' };
    const expectedDontWantResultRespMsg = { ...errDontWantResultMsg, type: 'response', error: errorMessage };
    wab.onMessage('message', JSON.stringify(errDontWantResultMsg));
    expect(testTarget.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedDontWantResultRespMsg), '*');
  });

  it('responds with an error, given an error is thrown when an api call promise fails', (done) => {
    // make sure error is returned if wantResult is true
    const errRequestMsg = { ...testFuncMsg, targetFunc: 'errorResultFunc', wantResult: true };
    const expectedResultMsg = { ...errRequestMsg, type: 'response', error: errorMessage };
    wab.onMessage('message', JSON.stringify(errRequestMsg));
    testTarget.postMessage = (result, targetOrigin) => {
      expect(result).toBe(JSON.stringify(expectedResultMsg));
      expect(targetOrigin).toBe('*');
      done();
    };
  });

  it('passes all request and response messages to a listener', (done) => {
    const callback = jest.fn();
    wab.listener = callback;
    wab.onMessage('message', JSON.stringify(testFuncMsg));
    expect(callback).toHaveBeenCalledWith({ ...testFuncMsg, args: [] });
    expect(callback).toHaveBeenCalledTimes(1);

    const wantResultMsg = { ...testFuncMsg, targetFunc: 'resultFunc', wantResult: true };
    wab.onMessage('message', JSON.stringify(wantResultMsg));

    testTarget.postMessage = () => {
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
    expect(JSON.parse(testTarget.postMessage.mock.calls[0][0])).toEqual(testFuncMsg);
  });

  it('sends an api request using using ReactNativeWebView, given request from a ReactNativeWebView', () => {
    wab.useReactNativeWebView = true;
    expect(wab.send('testFunc', [], false)).toBeNull();
    expect(JSON.parse(testTarget.ReactNativeWebView.postMessage.mock.calls[0][0]))
      .toEqual(testFuncMsg);
  });

  it('sends an api request without requesting a result by default', () => {
    expect(wab.send('testFunc', [])).toBeNull();
    expect(JSON.parse(testTarget.postMessage.mock.calls[0][0])).toEqual(testFuncMsg);
  });

  it('sends an api request that is resolved without a result, given a response has none', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', args: [] };
    testTarget.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('testFunc', [], true).then(data => expect(data).toBe(undefined));
  });

  it('sends an api request that is resolved with a result, given other side returns one', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', args: [apiResultObject] };
    testTarget.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('testFunc', [], true).then(data => expect(data).toEqual(apiResultObject));
  });

  it('rejects a send Promise, given an error response was received', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', error: errorMessage };
    testTarget.postMessage.mockImplementation(() => {
      wab.onMessage('message', JSON.stringify(resultFuncMsg));
    });

    return wab.send('resultFunc', [], true).catch(e => expect(e).toEqual(resultFuncMsg));
  });

  it('displays a warning, given we send an api request that caused a remote error', () => {
    const resultFuncMsg = { ...testFuncMsg, type: 'response', error: errorMessage };
    testTarget.postMessage.mockImplementation(() => {
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
