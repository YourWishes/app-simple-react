import { ComponentPromise } from './';

describe('ComponentPromise', () => {
  it('should require a promise', () => {
    expect(() => ComponentPromise(null)).toThrow();
    expect(() => ComponentPromise(undefined)).toThrow();
  });

  it('should return a wrapped promise', async () => {
    let prom = new Promise(resolve => setImmediate(resolve));
    expect(() => ComponentPromise(prom)).not.toThrow();

    let wrapped = ComponentPromise(prom);
    await expect(wrapped).resolves.not.toThrow();
  });
});

describe('cancel', () => {
  it('should reject the promise, even if it resolves', async () => {
    let rej = new Promise((resolve,reject) => setImmediate(reject));
    let prom = ComponentPromise(rej);
    expect(() => prom.cancel()).not.toThrow();
    await expect(prom).rejects.not.toBeNull();

    let res = new Promise(resolve => setImmediate(resolve));
    prom = ComponentPromise(res);
    expect(() => prom.cancel()).not.toThrow();
    await expect(prom).rejects.not.toBeNull();
  });

  it('should resolve with the cancelled state', async () => {
    let p = ComponentPromise( (async () => 'Hello World')() );
    await expect(p).resolves.toBe('Hello World');

    p = ComponentPromise( (async () => 'How are you?')() );
    p.cancel();
    await expect(p).rejects.toStrictEqual({ isCancelled: true, value: 'How are you?' });

    let e = new Error();
    p = ComponentPromise( (async()=>{throw e;})() );
    p.cancel();
    await expect(p).rejects.toStrictEqual({ isCancelled: true, error: e });
  });
});
