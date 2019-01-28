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
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, Reducer, Store, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { SimpleReducer } from './../reducer/';

export interface AppReducer {
  [key:string]: Reducer
}

export abstract class App {
  appHandle:string;

  reducer:Reducer;
  store:Store;

  constructor(appHandle:string, reducer:AppReducer={}) {
    this.appHandle = appHandle;

    //Get and join, or create reducer
    this.reducer = combineReducers({ ...reducer, ...SimpleReducer });
    this.store = createStore(this.reducer);
  }

  render() {
    //Get the component wrapper
    let component = this.getComponent();

    ReactDOM.render((
      <Provider store={this.store}>
        { component }
      </Provider>
    ), this.getElement());
  }

  getElement() {
    return document.getElementById(this.appHandle);
  }

  abstract getComponent():any;
}
