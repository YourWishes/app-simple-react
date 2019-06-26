import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { withLoader, withLoaderProps, LoadableFactory } from './';

type TestProps = {} & withLoaderProps;

describe('withLoader', () => {
  it('should have a default state of not loading', () => {
    let fn = jest.fn(e => <div></div>);
    let Comp = withLoader<TestProps>('hoc1', props => fn(props));
    expect(() => mount(<Comp />)).not.toThrow();
    expect(fn).toHaveBeenCalledWith({ loading: false, loaded: false, error: null });
  });

  it('should pass loading as a prop when it is loading', async () => {
    let fn = jest.fn(e => <div></div>);
    let Comp = withLoader<TestProps>('hoc2', props => fn(props));
    mount(<Comp />);

    expect(fn).nthCalledWith(1, { loading: false, loaded: false, error: null });

    let prom = () => new Promise(resolve => setTimeout(e => resolve(true),200));
    let x = LoadableFactory.load('hoc2', prom);

    expect(fn).toHaveBeenLastCalledWith({ loading: true, loaded: false, error: null });
  });

  it('should pass loaded as a prop when its finished loading', async () => {
    let fn = jest.fn(e => <div></div>);
    let Comp = withLoader<TestProps>('hoc3', props => fn(props));
    mount(<Comp />);

    let prom = () => new Promise(resolve => setTimeout(e => resolve(true),200));
    await LoadableFactory.load('hoc3', prom);
    expect(fn).toHaveBeenLastCalledWith({ loading: false, loaded: true, error: null });
  });

  it('should pass error as a prop when there is a load error', async () => {
    let fn = jest.fn(e => <div></div>);
    let Comp = withLoader<TestProps>('hoc4', props => fn(props));
    mount(<Comp />);

    let error;

    let prom = async () => {
      await new Promise(resolve => setImmediate(resolve));
      error = new Error('Error 1234');
      throw error;
    };
    await expect(LoadableFactory.load('hoc4', prom)).rejects.toThrow('Error 1234');
    expect(fn).toHaveBeenLastCalledWith({ loading: false, loaded: false, error });
  });
});
