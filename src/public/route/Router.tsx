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
import { History } from 'history'
import { Router as ReactRouter, withRouter, Switch, RouteComponentProps } from 'react-router-dom';

//General switch wrapper.
export const RouteSwitch = withRouter((props:RouteComponentProps) => {
  return <Switch {...props} />;
});

//Routers
export interface RouterProps {
  history:History;
  children?:React.ReactNode;
};


export const Router = (props:RouterProps) => {
  //ConnectedRouter provides the store manipulation
  //Router element is automatically selected below to be
  //either HashRouter or BrowserRouter depending on dev mode or not.
  //The route switch provides the wrapper for the routes
  //routes is the children of this object.

  //Select Router type
  //let RouterElement = ProductionRouter;
  //if(!PRODUCTION) RouterElement = DevelopmentRouter;

  return (
    <ReactRouter {...props}>
      { props.children }
    </ReactRouter>
  );
}
