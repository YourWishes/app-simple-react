import { App } from '@yourwishes/app-base';
import { IReactApp, ReactModule } from '@yourwishes/app-react';

class TestApp extends App implements IReactApp {
  server:ReactModule;

  constructor() {
    super();

    this.server = new ReactModule(this);
    this.addModule(this.server);
  }
}

let app = new TestApp();
app.init().catch(e => app.logger.severe(e));
