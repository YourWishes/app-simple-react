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
import { Route, RouteProps, LoadableRouteProps } from './../route/';

//Types
//Animated Route will receive, directly, the classNames from the transition.
//This is an issue when attempting to use any LoadableRoute, since this
//Will mean that there is nothing there to receive the className. The only
//real solution is to provide an animateWrapper component that is part of
//the main JS that can receive the classname while the loadable finishes
//it's thing.
export type AnimatedRouteProps<Props> = (
  RouteProps<Props> &
  {
    className?:string,
    animateWrapper?:any
  }
);

//Components
//This is an example animated
export const AnimatedRouteWrapper = (props:any) => {
  return (
    <div className={props.className||""}>
      { props.children }
    </div>
  );
};

export class AnimatedRoute<Props> extends React.Component<AnimatedRouteProps<Props>> {
  constructor(props:AnimatedRouteProps<Props>) {
    super(props);
  }

  render() {
    let WrappedComponent = this.props.animateWrapper || AnimatedRouteWrapper;

    return <Route
      {...this.props} load={undefined} component={undefined}
      render={renderProps => (
        <WrappedComponent {...this.props}>
          <Route {...this.props} path={undefined} exact={undefined} />
        </WrappedComponent>
      )}
    />;
  }
}
