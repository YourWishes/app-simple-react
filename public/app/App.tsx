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

import '@babel/polyfill';

import * as React from 'react';
import { ReactDOM } from 'react-dom';
import { Provider } from 'react-redux';
import { Action, Reducer } from 'redux';
import { AppStore, AppStoreOwner }  from '@yourwishes/app-store';
import { History, createBrowserHistory } from 'history';

export abstract class App<S,A extends Action> implements AppStoreOwner<S,A>  {
  appHandle:string;
  store:AppStore<S,A>;
  history:History;

  constructor(appHandle:string) {
    this.appHandle = appHandle;
    this.store = new AppStore<S,A>(this);
    this.history = createBrowserHistory();
  }

  render() {
    //Get the component wrapper
    let component = this.getComponent();

    ReactDOM.render((
      <Provider store={this.store.store}>
        { component }
      </Provider>
    ), this.getElement());
  }

  getElement() { return document.getElementById(this.appHandle); }

  abstract getComponent():any;
  abstract getReducer():Reducer<S,A>;
}
