// Copyright (c) 2019 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as React from 'react';
import { LoadableRoute, Router, RouteSwitch } from './';
import { mount } from 'enzyme';
import * as History from 'history';

const createLoader = (text='Loaded') => async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  return () => <div>{text}</div>
}

describe('LoadableRoute', () => {
  it('should load a component', async () => {
    let history = History.createMemoryHistory();
    let load = createLoader();
    let loading = () => <div>Loading</div>

    let l = mount(<Router history={history}>
      <RouteSwitch>
        <LoadableRoute loadKey="test-loadable-route" load={load} loading={loading} />
      </RouteSwitch>
    </Router>);

    expect(l.text()).toBe('Loading');
    await new Promise(resolve => setTimeout(resolve, 15));
    l.update();
    expect(l.text()).toBe('Loaded');
  });

  it('should load a route when mounted', async () => {
    let history = History.createMemoryHistory();
    let load1 = createLoader('Loaded 1');
    let loading1 = () => <div>Loading 1</div>
    let load2 = createLoader('Loaded 2');
    let loading2 = () => <div>Loading 2</div>

    let l = mount(<Router history={history}><RouteSwitch>
      <LoadableRoute path="/test1" loadKey="lr-switch-1" load={load1} loading={loading1} />
      <LoadableRoute path="/test2" loadKey="lr-switch-2" load={load2} loading={loading2} />
    </RouteSwitch></Router>);

    history.push('/test1');
    l.update();
    expect(l.text()).toBe('Loading 1');
    await new Promise(resolve => setTimeout(resolve, 15));
    l.update();
    expect(l.text()).toBe('Loaded 1');

    history.push('/test2');
    l.update();
    expect(l.text()).toBe('Loading 2');
    await new Promise(resolve => setTimeout(resolve, 15));
    l.update();
    expect(l.text()).toBe('Loaded 2');
  });

  it('should pass the route props to the loadable component', async () => {
    let history = History.createMemoryHistory();
    let load = createLoader();
    let called;
    let loading = jest.fn(props => {
      called = props;
      return <div>Loading</div>
    });

    let l = mount(<Router history={history}><RouteSwitch>
      <LoadableRoute any="thing" path="/" loadKey="lr-props" load={load} loading={loading} />
    </RouteSwitch></Router>);

    expect(loading).toHaveBeenCalled();
    expect(called).toHaveProperty('any', 'thing');
    expect(called).toHaveProperty('path', '/');
  });
});
