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
import { Route, withRouter, RouteComponentProps, RouteProps } from 'react-router-dom';
import { LoadableComponentProps, LoadableComponent } from './../load/';

export type LoadableRouteProps<Props> = (
  LoadableComponentProps<Props> & RouteProps
);

export type LoadableRouteComponent<Props> = (
  (props:LoadableRouteProps<Props>) => any
);

export const LoadableRoute = function<Props extends RouteProps>(props:LoadableRouteProps<Props>) {
  return (
    <Route<Props> {...props} render={(routeProps) => {
      //TODO: There's something strange happening so I need to "make a new component"
      //everytime render is called, otherwise react-router isn't working as expected...
      let WrappedLoadable = withRouter(LoadableComponent);
      return <WrappedLoadable {...props} {...routeProps} />
    }} />
  );
};
