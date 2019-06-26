import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { LoadableFactory, LoadableListener } from './';

describe('load', () => {
  it('require a valid key', () => {
    expect(() => LoadableFactory.load('', null)).toThrow();
    expect(() => LoadableFactory.load(null,null)).toThrow();
  });

  it('should trigger the load', () => {
    //Loading is handled by our compiler (webpack at the time of writing).
    //We can simulate a load by simply returning a delayed promise
    let func = jest.fn();
    let prom = async () => func();
    expect(() => LoadableFactory.load('test1', prom)).not.toThrow();
    expect(func).toHaveBeenCalled();
  });

  it('should only trigger a load once per key', () => {
    let func1 = jest.fn();
    let func2 = jest.fn();

    let prom = async () => func1();
    let prom2 = async () => func2();

    LoadableFactory.load('test2', prom);
    expect(func1).toHaveBeenCalled();
    LoadableFactory.load('test2', prom2);
    expect(func2).not.toHaveBeenCalled();
  });

  it('should handle promises', async () => {
    //Test delays
    let func = jest.fn();
    let prom = async () => {
      await new Promise((resolve, reject) => setTimeout(resolve, 50));
      func();
    }

    expect(() => LoadableFactory.load('test3', prom)).not.toThrow();
    expect(func).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(func).toHaveBeenCalled();
  });

  it('should return the promise from the load function', () => {
    let prom = new Promise(resolve => setImmediate(resolve));
    let loader = () => prom;

    expect(LoadableFactory.load('test4', loader)).toStrictEqual(prom);
  });

  it('should return a promise that rejects when the load function rejects', async () => {
    let prom = async () => {
      throw new Error('Test Error');
    };

    await expect(LoadableFactory.load('test25', prom)).rejects.toThrow();
  });
});

describe('isLoaded', () => {
  it('should return true for items that have loaded', async () => {
    let prom = async () => 'hello';

    await expect(LoadableFactory.load('test5', prom)).resolves.toEqual('hello');
    expect(LoadableFactory.isLoaded('test5')).toBe(true);
  });

  it('should return false for items that havent loaded', async () => {
    let delayed = () => new Promise(resolve => setTimeout(() => resolve('hello'), 100));
    let prom = LoadableFactory.load('test6', delayed);

    expect(LoadableFactory.isLoaded('test6')).toBe(false);
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(LoadableFactory.isLoaded('test6')).toBe(true);
  });

  it('should return false for loaders that have an error', async () => {
    //Simulate an error
    let prom = async () => { throw new Error() };
    expect(LoadableFactory.isLoaded('test7')).toBe(false);
    await expect(LoadableFactory.load('test7', prom)).rejects.toThrow();
    expect(LoadableFactory.isLoaded('test7')).toBe(false);
  });
});

describe('isLoading', () => {
  it('should return false for items not loading', () => {
    expect(LoadableFactory.isLoading('test20')).toBe(false);
  });

  it('should return true for items that are loading', async () => {
    expect(LoadableFactory.isLoading('test21')).toBe(false);
    let prom = () => new Promise(resolve => setTimeout(resolve, 500));
    LoadableFactory.load('test21', prom);
    expect(LoadableFactory.isLoading('test21')).toBe(true);
  });

  it('should return false after the item has finished loading', async () => {
    expect(LoadableFactory.isLoading('test22')).toBe(false);
    let prom = () => new Promise(resolve => setTimeout(e => resolve(true), 500));
    let x = LoadableFactory.load('test22', prom);
    expect(LoadableFactory.isLoading('test22')).toBe(true);
    await x;
    expect(LoadableFactory.isLoading('test22')).toBe(false);
  });
});

describe('getLoadedComponent', () => {
  it('should return the result of the loading promise', async () => {
    let result:object = { hello: 'world' };

    let loader = item => (
      () => new Promise(resolve => (
        setImmediate(() => resolve(item))
      ))
    );

    await LoadableFactory.load('test8', loader(result));
    expect(LoadableFactory.getLoadedComponent('test8')).toStrictEqual({ hello: 'world' });

    result = { '1': '2' };
    await LoadableFactory.load('test9', loader(result));
    expect(LoadableFactory.getLoadedComponent('test9')).toStrictEqual({ '1': '2' });
  });

  it('should return null for not loaded components', () => {
    expect(LoadableFactory.getLoadedComponent('test10')).toBeNull();
    expect(LoadableFactory.getLoadedComponent('test11')).toBeNull();
  });
});

describe('getLoadError', () => {
  it('should return the error thrown for a given loader key', async () => {
    let err = new Error('My example error');
    let prom = async () => { throw err; }
    await expect(LoadableFactory.load('test12', prom)).rejects.toThrow(err);
    expect(LoadableFactory.getLoadError('test12')).toEqual(err);

    err = new Error('Another error');
    prom = async () => { throw err; }
    await expect(LoadableFactory.load('test13', prom)).rejects.toThrow(err);
    expect(LoadableFactory.getLoadError('test13')).toEqual(err);
  });
});

describe('addLoadListener', () => {
  let dummy = { hello: 'world', how: 12, are: true, you: { doing: '?' }  };

  it('should add a listener for a given key', () => {
    let listener:LoadableListener<any> = {
      onLoad: () => {}, onLoadError: () => {}, onLoading: () => {}
    };
    expect(() => LoadableFactory.addLoadListener('test14', listener)).not.toThrow();
    expect(LoadableFactory.loadListeners['test14']).toBeDefined();
    expect(LoadableFactory.loadListeners['test14']).toContain(listener);
  });

  it('should fire the onLoading event when the load begins', async () => {
    let fn = jest.fn();
    let listener:LoadableListener<any> = {
      onLoad: () => {}, onLoadError: ()=> {}, onLoading: key => fn(key)
    };
    LoadableFactory.addLoadListener('test23', listener);
    expect(fn).not.toHaveBeenCalled();
    let prom = () => new Promise(resolve => setImmediate(resolve));
    let x = LoadableFactory.load('test23', prom);
    expect(fn).toHaveBeenCalledWith('test23');
    await x;
  });

  it('should fire the onLoad event when the load finishes', async () => {
    let fn = jest.fn();

    let listener:LoadableListener<any> = {
      onLoad: (key,val) => fn(val), onLoadError: () => {}, onLoading: () => {}
    };
    LoadableFactory.addLoadListener('test15', listener);

    let prom = () => new Promise((resolve) => setImmediate(() => resolve(dummy)));
    await LoadableFactory.load('test15', prom);

    expect(fn).toHaveBeenCalledWith(dummy);
  });

  it('should fire the onLoadError event when the load fails', async () => {
    let fn = jest.fn();
    let err = new Error('Example Error');

    let listener:LoadableListener<any> = {
      onLoad: () => {}, onLoadError: (key,ex) => { fn(ex); }, onLoading: () => {}
    };
    LoadableFactory.addLoadListener('test16', listener);

    let prom = async () => { throw err; };
    await expect(LoadableFactory.load('test16', prom)).rejects.toThrow();

    expect(fn).toHaveBeenCalledWith(err);
  });

  it('should fire the onLoading event if the item is already loading', async () => {
    let prom = () => new Promise((resolve) => setImmediate(() => resolve(dummy)));
    LoadableFactory.load('test24', prom);

    let fn = jest.fn();
    let listener:LoadableListener<any> = {
      onLoad: () => {}, onLoadError: () => {}, onLoading: key => fn(key)
    };
    LoadableFactory.addLoadListener('test24', listener);
    expect(fn).toHaveBeenCalledWith('test24');
  });

  it('should fire the onLoad event if the item is already loaded', async () => {
    let prom = () => new Promise((resolve) => setImmediate(() => resolve(dummy)));
    await LoadableFactory.load('test17', prom);

    let fn = jest.fn();
    let listener:LoadableListener<any> = {
      onLoad: (key,val) => fn(val), onLoadError: () => {}, onLoading: () => {}
    };
    LoadableFactory.addLoadListener('test17', listener);
    expect(fn).toHaveBeenCalledWith(dummy);
  });

  it('should fire the onError event if the item is already loaded', async () => {
    let err = new Error('Example Error');
    let prom = async () => { throw err; };
    await expect(LoadableFactory.load('test18', prom)).rejects.toThrow();

    let fn = jest.fn();
    let listener:LoadableListener<any> = { onLoad: () => {}, onLoadError: (key,ex) => { fn(ex); }, onLoading: () => {} };
    LoadableFactory.addLoadListener('test18', listener);
    expect(fn).toHaveBeenCalledWith(err);
  });
})

describe('removeLoadListener', () => {
  it('should remove the load listener', async () => {
    let dummy = { hello:'world' };
    let fn = jest.fn();
    let listener:LoadableListener<any> = { onLoad: (key,val) => fn(val), onLoadError: () => {}, onLoading: () => {} };
    let prom = () => new Promise((resolve) => setImmediate(() => resolve(dummy)));

    LoadableFactory.addLoadListener('test19', listener);
    LoadableFactory.removeLoadListener('test19', listener);
    await LoadableFactory.load('test19', prom);
    expect(fn).not.toHaveBeenCalledWith(dummy);
  });
});
