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
import * as Loadable from 'react-loadable';
import { Route as ReactRoute, RouteProps as ReactRouteProps } from 'react-router-dom';
import { LoadingComponentProps } from 'react-loadable';

const LoadingComponent = (props:LoadingComponentProps) => {
  let { error, pastDelay } = props;
  if(error) return <div>{error}</div>;
  if(pastDelay) return <div>Loading...</div>;
  return null;
};

export interface RouteProps<Props> extends ReactRouteProps {
  //For Delayed Loading Components,
  load?:any,
  loadingComponent?:React.ComponentType<LoadingComponentProps> | (() => null),
  render?:(props:any) => React.ReactElement<any>
}

export const Route = (props:RouteProps<any>) => {
  let { children, component, render } = props;
  if(children || component || render) return <ReactRoute {...props}  />;

  //Default Loader
  let loadingComponent = props.loadingComponent || LoadingComponent;

  let LoadRender = (subProps:ReactRouteProps) => {
    let CustomLoadable = Loadable({
      loader: props.load,
      loading: loadingComponent
    });
    return <CustomLoadable {...props} {...subProps} />
  };

  return <ReactRoute {...props} render={LoadRender} />;
};
