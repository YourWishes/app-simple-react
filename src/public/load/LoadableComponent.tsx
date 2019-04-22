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
import {
  LoadedComponent,
  LoadablePlaceholderProps, LoadablePlaceholder,
  LoadableComponentProps, LoadableComponentState
} from './LoadableTypes';
import { ComponentPromise } from './../promise/';

// Types //
export const DummyPlaceholder = (props:LoadablePlaceholderProps<any>) => (
  <>{props.error||''}</>
);

export class LoadableComponent<Props> extends React.PureComponent<LoadableComponentProps<Props>,LoadableComponentState> {
  loadedComponent:LoadedComponent<Props>;
  loadingPromise:ComponentPromise<any>;

  constructor(props:LoadableComponentProps<Props>) {
    super(props);

    //Initial state, not loading or loaded or errored, wait for componentDidMount
    this.state = {
      loading: false,
      loaded: false,
      error: null
    };

  }

  componentDidMount() {
    //Begin Loading (if possible)
    this.setState({
      loading: true,
      loaded: false,
      error: null
    });

    //Cancel any pending promises, may exist but unlikely
    if(this.loadingPromise) this.loadingPromise.cancel();

    //Load and listen, we can allow a simulated load here
    if(this.props.simulate) {
      //You may pass either a bool or a number for simulating a load
      let simu = parseInt(`${this.props.simulate}`);
      if(isNaN(simu)) simu = 1000;

      //Make a fake promise wrapper
      this.loadingPromise = ComponentPromise( (async () => {
        //Here's where we simulate the load
        await new Promise(resolve => setTimeout(resolve, simu));

        //Do a normal load, so keep in mind this may also take some time..
        //e.g. if I pass 1000 it won't REALLY take 1 second, it may take 1.013 seconds
        return await this.props.load();
      })() );
    } else {
      this.loadingPromise = ComponentPromise(this.props.load());
    }

    //Now waiting for the promise to finish
    this.loadingPromise.then(e => this.onLoaded(e)).catch(ex => this.onLoadError(ex));
  }

  componentWillUnmount() {
    //When we unmount cancel any pending promises, doesn't ACTUALLY cancel
    if(this.loadingPromise) this.loadingPromise.cancel();

    //Unmounting, stop listening (but this won't stop the load)
    this.setState({
      loading: false,
      error: 'Component was unmounted during load'
    });
  }

  onLoaded(e:LoadedComponent<Props>) {
    //Cancelled? Do nothing.
    if(e.isCancelled) return;

    //Loaded, use named export (or default)
    this.loadedComponent = e[this.props.loadedExport || 'default'];

    //Now update the state, this will start using the loaded component.
    this.setState({
      loaded: true,
      loading: false,
      error: null
    });
  }

  onLoadError(e:any) {
    //Cancelled... do nothing
    if(e.isCancelled) return;

    //Error
    console.error(e);
    this.setState({
      loading: false,
      loaded: false,
      error: e
    });
  }

  render() {
    //Get state
    let { loading, loaded, error } = this.state;

    //Determine the component to show during loading
    let loadingComponent = this.props.loading;

    //New Props based off my current props
    let np = {...this.props};
    ['load','loading'].forEach(e => delete np[e]);

    //Get Component Type, this will be either the placeholder OR the already loaded component.
    let ComponentType:LoadablePlaceholder<Props>|LoadedComponent<Props> = DummyPlaceholder;

    //Determine...
    if(loaded && this.loadedComponent) {
      //Loaded successfully, use loaded
      ComponentType = this.loadedComponent;
    } else if(loaded) {
      //Loaded but no component found (use paceholder)
      error = error || 'Failed to find loaded component';
      ComponentType = loadingComponent || ComponentType;
    } else {
      //Loading / Load Failed (use placeholder)
      ComponentType = loadingComponent || ComponentType;
    }

    return <ComponentType {...np} loading={loading} loaded={loaded} error={error} />;
  }
}
