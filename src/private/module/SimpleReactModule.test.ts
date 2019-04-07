import { App } from '@yourwishes/app-base';
import { ServerModule } from '@yourwishes/app-server';
import { ReactModule } from '@yourwishes/app-react';
import { SimpleReactModule, ISimpleReactApp, SimpleReactCompiler } from './../';

class DummyApp extends App implements ISimpleReactApp {
  server:ServerModule;
  react:ReactModule;
  simpleReact: SimpleReactModule;

  getCompiler():SimpleReactCompiler { return null; }
}

describe('loadPackage', () => {
  it('should return the package data', () => {
    expect(new SimpleReactModule(new DummyApp()).package).toHaveProperty('name', '@yourwishes/app-simple-react');
  });
});
