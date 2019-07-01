import * as React from 'react';
import { LoadableComponent, LoadableFactory } from './';
import { shallow, mount } from 'enzyme';

describe('LoadableComponent', () => {
  it('should should initiate the loading component to load', async () => {
    let load = jest.fn();
    let done = jest.fn();
    let prom = async () => {
      load();
      await new Promise(resolve => setTimeout(resolve, 50));
      done();
      return () => "Loaded";
    }
    expect(load).not.toHaveBeenCalled();

    let l = shallow(<LoadableComponent load={prom} loadKey="lc1" />);
    expect(load).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(done).toHaveBeenCalled();
  });
});

describe('onLoad', () => {
  it('should mount the loaded component', async () => {
    let prom = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      //Keep in mind, we're not returning a mounted component!!!!
      return { default: () => <div>Loaded</div> };
    }

    let l = mount(<LoadableComponent load={prom} loadKey="lc2" />);
    expect(l.text()).not.toBe('Loaded');
    await new Promise(resolve => setTimeout(resolve, 12));
    l.update();
    expect(l.text()).toBe('Loaded');
  });

  it('should mount an externally loaded component automatically', async () => {
    let component = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return () => <div>Loaded 4</div>
    }

    //Wait a bit, we're not fully loading but hoping it will mount in a loading state
    LoadableFactory.load('lc4', component);
    await new Promise(resolve => setTimeout(resolve, 20));

    let l = mount(<LoadableComponent load={component} loadKey="lc4" />);
    expect(l.text()).not.toBe('Loaded 4');

    //Now we're waiting less time than a full load, but enough time that the half load will finish
    await new Promise(resolve => setTimeout(resolve, 35));
    l.update();
    expect(l.text()).toBe('Loaded 4');

    //Now test a full load
    await LoadableFactory.load('lc5', component);
    l = mount(<LoadableComponent load={component} loadKey="lc5" />);
    expect(l.text()).toBe('Loaded 4');
  });

  it('should pass the LoadableComponent props down to the loaded component', async () => {
    let fn = jest.fn(props => <div>Loaded</div>);
    let load = async () => props => fn(props);

    let l = mount(<LoadableComponent load={load} loadKey="lc-props-loaded" />);
    await LoadableFactory.load("lc-pros-loaded", load);//Async will still take a tick to resolve
    expect(fn).toHaveBeenCalledWith({
      loadKey: "lc-props-loaded", loading: false, loaded: true, error: null
    });
  });
});


describe('onLoading', () => {
  it('should render a loading placeholder while the component is loading', async () => {
    let load = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return {default:() => <div>Loaded 3</div>};
    };
    let placeholder = () => <div>Loading 12</div>;

    let l = mount(<LoadableComponent load={load} loadKey="lc3" loading={placeholder} />);
    expect(l.text()).toBe('Loading 12');
    await new Promise(resolve => setTimeout(resolve, 12));
    l.update();
    expect(l.text()).toBe('Loaded 3');
  });

  it('should pass the loading state to the placeholder', async () => {
    let load = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return () => <div>Loaded</div>
    };

    let fn = jest.fn(props => <div>Loading</div>);
    let placeholder = props => fn(props);
    let l = mount(<LoadableComponent load={load} loadKey="lc-props-placeholder" loading={placeholder} />);

    //Before the component mounts you may get a state where it hasn't started loading yet
    expect(fn).toHaveBeenNthCalledWith(1, {
      loadKey: "lc-props-placeholder", loading: false, loaded: false, error: null
    });

    //Now the component will start loading
    expect(fn).toHaveBeenNthCalledWith(2, {
      loadKey: "lc-props-placeholder", loading: true, loaded: false, error: null
    });

    //Await a bit more for setState
    await new Promise(resolve => setTimeout(resolve, 15));//Await the load

    //Placeholder shouldn't receive the "Loaded" state ever.
    l.update();
    expect(l.text()).toBe("Loaded");
  });
});

describe('onLoadError', () => {
  it('should pass the error to the loading placeholder for handling', async () => {
    let load = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw "My Cool Error";
    };

    let fn = jest.fn(props => <div>Loading</div>);
    let placeholder = props => fn(props);
    let l = mount(<LoadableComponent load={load} loadKey="lc-props-error" loading={placeholder} />);

    await new Promise(resolve => setTimeout(resolve, 15));

    expect(fn).toHaveBeenLastCalledWith({
      loadKey: "lc-props-error", loading: false, loaded: false, error: "My Cool Error"
    });
  });
});
