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
import { Provider } from 'react-redux';
import { routerMiddleware } from 'connected-react-router';
import { history } from './../route/';
import { rootReducer } from './../reducer/';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import {
  createStore, applyMiddleware, Reducer, Store, combineReducers, Middleware
} from 'redux';

export abstract class App {
  appHandle:string;

  reducer:Reducer;
  store:Store;

  constructor(appHandle:string, reducer?:Reducer, middlewares?:Middleware[]) {
    this.appHandle = appHandle;

    //Get and join, or create reducer
    this.reducer = reducer ? combineReducers({ router: rootReducer, reducer }) : combineReducers({ router: rootReducer });

    //Create the store, apply middleware
    middlewares = middlewares || [];
    this.store = createStore(this.reducer, applyMiddleware(
      thunk as ThunkMiddleware<any, any>,
      routerMiddleware(history),
      ...middlewares
    ));

    console.log('REducer:');
    console.log(rootReducer);
    console.log(this.reducer);
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
