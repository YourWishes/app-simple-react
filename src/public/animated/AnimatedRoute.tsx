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
import { Route } from '~@route';
import { LoadableComponent } from '~@load';
import { CSSTransition } from 'react-transition-group';

//Types
//Animated Route will receive, directly, the classNames from the transition.
//This is an issue when attempting to use any LoadableRoute, since this
//Will mean that there is nothing there to receive the className. The only
//real solution is to provide an animateWrapper component that is part of
//the main JS that can receive the classname while the loadable finishes
//it's thing.

//Wrapper
export type AnimatedWrapperProps = any;

//This is an example animated wrapped. Ideally this REALLY needs to be completely
//stateless, since any changes to this will break the animation.
export const AnimatedRouteWrapper = (props:AnimatedWrapperProps) => {
  return (
    <div className={props.className||""}>
      { props.children }
    </div>
  );
};


//Route
export type AnimatedRouteProps = any & CSSTransition.CSSTransitionProps;

export class AnimatedRoute<Props extends AnimatedRouteProps> extends React.Component<Props> {
  constructor(props:Props) {
    super(props);
  }

  render() {
    //Prop Clones, since we only want to pass specific props down
    let {
      animateWrapper, path, exact, component, render, load
    } = this.props;

    //Wrapped Component
    let WrappedComponent = animateWrapper || AnimatedRouteWrapper

    //Thing to actually render (Within the wrapped component)
    let ToRender:any;
    if(component) {
      ToRender = component;
    } else if(render) {
      ToRender = render;
    } else if(load) {
      //Loadable Route (hack)
      //ToRender = props => <LoadableRoute {...props as any} />
      ToRender = LoadableComponent;
    } else {
      ToRender = () => <></>;
    }

    //Render itself
    return (
      <Route path={path} exact={exact}>{ renderProps => {
        let { match } = renderProps;
        return <CSSTransition {...this.props as any} in={match != null} unmountOnExit>
          <WrappedComponent>
            <ToRender {...renderProps} {...this.props} />
          </WrappedComponent>
        </CSSTransition>
      } }</Route>
    );
  }
}
