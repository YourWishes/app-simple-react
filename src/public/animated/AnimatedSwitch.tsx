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
import { RouteSwitch, Route } from './../route/';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Location } from 'history';


//Here we have a switch render wrapped to help stop route changes forcing a
//re-render This was driving me insane.
export interface AnimatedSwitchManagerProps {
  children?:React.ReactNode,
  location:Location
}
export class AnimatedSwitchManager extends React.Component<AnimatedSwitchManagerProps> {
  constructor(props:AnimatedSwitchManagerProps) { super(props); }

  shouldComponentUpdate(props:AnimatedSwitchManagerProps) {
    return props.location.pathname !== this.props.location.pathname;
  }

  render() {
    return <>{ this.props.children }</>;
  }
}

//Children should be the animated Routes to be transitioned.
//Note that if using a loaded route you will need to have a wrapper that can
//safely receive the props while the component is still loading, especially
//if it is unloaded early.
export type AnimatedSwitchProps = (
  {
    children:React.ReactNode
  } & CSSTransition.CSSTransitionProps
);

export const AnimatedSwitch = (props:AnimatedSwitchProps) => {
  //We wrap the transition in a route to help the CSS Transition work as intended
  //This technically renders nothing, but provides all logic necessary, including
  //A switch for routes, as well as the CSSTransition wrapper.

  //At the moment only CSS Trnaistions are supported.
  return (
    <Route render={ ({location}) => {
      return (
        <TransitionGroup component={null}>
          <CSSTransition key={location.key} {...props}>
            <RouteSwitch location={location}>
              <AnimatedSwitchManager location={location}>
                { props.children }
              </AnimatedSwitchManager>
            </RouteSwitch>
          </CSSTransition>
        </TransitionGroup>
      );
    }} />
  );
};
