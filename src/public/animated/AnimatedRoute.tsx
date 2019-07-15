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
import { Route, RouteProps } from '~@route';
import { LoadableComponent } from '~@load';
import { CSSTransition } from 'react-transition-group';
import { Omit } from 'utility-types';

//Types
//Animated Route will receive, directly, the classNames from the transition.
//This is an issue when attempting to use any LoadableRoute, since this
//Will mean that there is nothing there to receive the className. The only
//real solution is to provide an animateWrapper component that is part of
//the main JS that can receive the classname while the loadable finishes
//it's thing.

//Wrapper
export type AnimatedWrapperProps<Props> = any;

//This is an example animated wrapped. Ideally this REALLY needs to be completely
//stateless, since any changes to this will break the animation.
export const AnimatedRouteWrapper = <Props extends {}>(props:AnimatedWrapperProps<Props>) => {
  return (
    <div className={props.className||""}>
      { props.children }
    </div>
  );
};


//Router
export type AnimatedRouteProps<Props> = (
  //CSS Transition props, umount on exit is forced set to true
  Omit<CSSTransition.CSSTransitionProps, 'unmountOnExit'> &

  //AnimatedRoute specific props
  {
    animateWrapper?:React.ComponentType<AnimatedWrapperProps<Props>>
  } &

  //Generic route props
  RouteProps<Props>
);

export class AnimatedRoute<Props> extends React.Component<AnimatedRouteProps<Props>> {
  constructor(props:AnimatedRouteProps<Props>) {
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

    let currentRenderProps;

    //Render itself
    return (
      <Route path={path} exact={exact}>{ renderProps => {
        //Keep props around, stops things getting funky
        let { match } = renderProps;
        if(!renderProps || match != null) currentRenderProps = renderProps;

        return <CSSTransition {...this.props as any} in={match != null} unmountOnExit>
          <WrappedComponent>
            <ToRender {...currentRenderProps} {...this.props} />
          </WrappedComponent>
        </CSSTransition>
      } }</Route>
    );
  }
}


type TestProps = {
  test:string;
}

const TestWrapper = (props:AnimatedWrapperProps<TestProps>) => {
  return <div>test</div>
};

<AnimatedRoute<TestProps> timeout={300} test="test" animateWrapper={TestWrapper} loadKey="test" />
