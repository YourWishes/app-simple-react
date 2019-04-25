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

import { LoadableListener } from './LoadableTypes';
import { LoadableFactory } from './LoadableFactory';
import { Subtract } from 'utility-types';

export type LoadableListenerState = {
  loading:boolean,
  loaded:boolean,
  error:any
};

export type withLoaderParametersProps = {
  simulate?:boolean|number
}

export type withLoaderProps = LoadableListenerState & withLoaderParametersProps;

export const withLoader = function<Props extends withLoaderProps>(loadKey:string, WrappedComponent:React.ComponentType<Props>) {
  type HOCProps = Subtract<Props,withLoaderProps> & withLoaderParametersProps;

  return class extends React.Component<HOCProps, LoadableListenerState> implements LoadableListener<Props> {
    simuTimeout:NodeJS.Timeout;

    constructor(props:HOCProps) {
      super(props);

      this.state = {
        loading: false,
        loaded: false,
        error: null
      };
    }

    componentDidMount() {
      if(this.simuTimeout) clearTimeout(this.simuTimeout);

      if(this.props.simulate) {
        //Since simulated loads always need to actually load, we're going to
        //set state to loading by force.
        this.setState({ loading: true, loaded: false, error: null });

        //You may pass either a bool or a number for simulating a load
        let simu = parseInt(`${this.props.simulate}`);
        if(isNaN(simu)) simu = 1000;

        //Run a delay
        this.simuTimeout = setTimeout(() => {
          LoadableFactory.addLoadListener(loadKey, this);
        }, simu);

      } else {

        //Normal load scenario, we're going to check if the component is actually
        //loaded or not first, this will "avoid the flicker"
        if(LoadableFactory.isLoaded(loadKey) || LoadableFactory.getLoadError(loadKey)) {
          //Already loaded, we're just going to add ourselves as a load listener
          //this will trigger the loadable factory to tell us we're loaded anyway
          LoadableFactory.addLoadListener(loadKey, this);
        } else {
          this.setState({ loading: true, loaded: false, error: null });
          LoadableFactory.addLoadListener(loadKey, this);
        }
      }
    }

    componentWillUnmount() {
      LoadableFactory.removeLoadListener(loadKey, this);
    }

    onLoad(key:string) {
      this.setState({ loaded: true, loading: false, error: null });
    }

    onLoadError(key:string, ex:any) {
      this.setState({ loaded: false, loading: false, error: null });
    }

    render() {
      return <WrappedComponent {...this.props as Props} {...this.state} />
    }
  }
};
