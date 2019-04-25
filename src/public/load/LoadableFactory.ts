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

/*
 *  LoadableFactory
 *    Manager for loadable components, designed to enforce better, and more
 *    reliable caching than the browser. Also allows us to load the same
 *    component in multiple places at the same time.
 *
 *    Due to the way this functions each loaded item must have a key assigned to
 *    it, so we can reference what is being loaded. (Usually the filename)
 */
import { Loader, LoadedComponent, LoadableListener } from './LoadableTypes';

class LoadableFactoryModule {
  loaders:{[key:string]:Promise<LoadedComponent<any>>}={};
  loaded:{[key:string]:LoadedComponent<any>}={};
  loadErrors:{[key:string]:LoadedComponent<any>}={};
  loadListeners:{[key:string]:LoadableListener<any>[]}={};

  constructor() {}

  load(key:string, loader:Loader<any>) {
    if(!key||!key.length) throw new Error('Cannot load a component with an invalid load key');

    //Before we begin loading, let's see if it already loaded, if it is we can
    //make a nice dummy promise that will immediately return.
    if(this.loaders[key]) return this.loaded[key];

    //Not loaded, begin loading
    let loading = this.loaders[key] = loader();

    //The factory itself will also listen for the load event, and it will do so first.
    loading.then(e => this.onLoad(key, e)).catch(ex => this.onLoadError(key, ex));

    return loading;
  }

  isLoaded(key:string) { return !!this.loaded[key]; }
  getLoadedComponent(key:string) {return this.loaded[key] || null; }
  getLoadError(key:string) { return this.loadErrors[key] || null; }

  onLoad(key:string, e:LoadedComponent<any>) {
    this.loaded[key] = e;
    delete this.loadErrors[key];

    [...(this.loadListeners[key]||[])].forEach(ll => ll.onLoad(key, e));
  }

  onLoadError(key:string, ex:any) {
    console.error(ex);
    this.loadErrors[key] = ex;
    delete this.loaded[key];//Cleanup the last successful load (if any)
    delete this.loaders[key];

    [...(this.loadListeners[key]||[])].forEach(ll => ll.onLoadError(key, ex));
  }

  addLoadListener(key:string, listener:LoadableListener<any>) {
    this.loadListeners[key] = this.loadListeners[key] || [];
    if(this.loadListeners[key].indexOf(listener) !== -1) return;
    this.loadListeners[key].push(listener);

    //Since the loaded component may already be loaded we need to test here.
    if(this.loaded[key]) {
      listener.onLoad(key, this.loaded[key]);
    } else if(this.loadErrors[key]) {
      listener.onLoadError(key, this.loadErrors[key]);
    }
  }

  removeLoadListener(key:string, listener:LoadableListener<any>) {
    if(!this.loadListeners[key]) return;
    let index = this.loadListeners[key].indexOf(listener);
    this.loadListeners[key].splice(index, 1);
  }
}

const FactoryInstance = new LoadableFactoryModule();
export const LoadableFactory = FactoryInstance;
