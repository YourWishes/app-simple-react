import * as React from 'react';
import { AnimatedRoute, AnimatedSwitch, Router } from './../';
import { LoadableFactory } from '~@load';
import { shallow, mount } from 'enzyme';
import * as History from 'history';

describe('AnimatedRoute', () => {
  it('should render the active route', async () => {
    let history = History.createMemoryHistory();
    let Page1 = () => <div>Page 1</div>;
    let Page2 = () => <div>Page 2</div>;

    let l = mount(<Router history={history}>
      <AnimatedSwitch>
        <AnimatedRoute path="/" exact component={Page1} timeout={50} />
        <AnimatedRoute path="/about" exact component={Page2} timeout={50} />
      </AnimatedSwitch>
    </Router>);

    //Expect first page.
    expect(l.text()).toBe('Page 1');

    //Attempt a history update
    history.push('/about');

    //Await for the page transition
    await new Promise(resolve => setTimeout(resolve, 60));

    l.update();
    expect(l.text()).toBe('Page 2');
  });


  it('should put the components within wrappers', async () => {
    let fn = jest.fn(props => <div className="wrapper">{ props.children }</div>);
    let history = History.createMemoryHistory();
    let Page1 = () => <div>Page 1</div>;

    let l = mount(<Router history={history}>
      <AnimatedSwitch>
        <AnimatedRoute path="/" exact component={Page1} animateWrapper={fn} timeout={50} />
      </AnimatedSwitch>
    </Router>);

    //expect(l.find('div').matchesElement(<div className="wrapper"><div>Page 1</div></div>)).toBe(true);
    expect(l.find('[className="wrapper"]').matchesElement(<div className="wrapper"><div>Page 1</div></div>));
    expect(fn).toHaveBeenCalled();
  });


  it('should transition between routes', async () => {
    let history = History.createMemoryHistory();
    let Page1 = () => <div>Page 1</div>;
    let Page2 = () => <div>Page 2</div>;

    const TransitionProps = {
      exact: true,
      classNames: 'page-transition',
      timeout: 50
    };

    let l = mount(<Router history={history}>
      <AnimatedSwitch>
        <AnimatedRoute {...TransitionProps} path="/" component={Page1} />
        <AnimatedRoute {...TransitionProps} path="/about" component={Page2} />
      </AnimatedSwitch>
    </Router>);

    //Expect first page.
    expect(l.text()).toBe('Page 1');

    //Now update the url, this will mount both pages simultaneously.
    history.push('/about');
    l.update();

    //Should have both pages, one will be transitioning out
    expect(l.find('div').containsMatchingElement(<div>Page 1</div>)).toBe(true);
    expect(l.find('div').containsMatchingElement(<div>Page 2</div>)).toBe(true);

    //Wait for transition...
    await new Promise(resolve => setTimeout(resolve, 60));

    //Update DOM and see only the second route mounted
    l.update();
    expect(l.find('div').containsMatchingElement(<div>Page 1</div>)).toBe(false);
    expect(l.find('div').containsMatchingElement(<div>Page 2</div>)).toBe(true);
  });


  it('should transition loadable routes', async () => {
    let history = History.createMemoryHistory();
    let LoadableTest = t => async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      return { default: t };
    }
    let LoadablePage1 = LoadableTest(props => <div>Page 1</div>);
    let LoadablePage2 = LoadableTest(props => <div>Page 2</div>);

    let LoadingPlaceholder1 = () => <div>Loading Page 1</div>;
    let LoadingPlaceholder2 = () => <div>Loading Page 2</div>;

    let TransitionProps = { timeout: 40, classNames: 'load-test', exact: true };
    let l = mount(<Router history={history}>
      <AnimatedSwitch>
        <AnimatedRoute
          {...TransitionProps} path="/" load={LoadablePage1}
          loadKey="animated-route-1" loading={LoadingPlaceholder1}
        />

        <AnimatedRoute
          {...TransitionProps} path="/about" load={LoadablePage2}
          loadKey="animated-route-2" loading={LoadingPlaceholder2}
        />
      </AnimatedSwitch>
    </Router>);

    //We start with / being mounted, but not loaded
    expect(l.text()).toBe('Loading Page 1');
    expect(LoadableFactory.isLoaded('animated-route-1')).toBe(false);

    //Wait for it to "load"
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(LoadableFactory.isLoaded('animated-route-1')).toBe(true);
    l.update();
    expect(l.text()).toBe('Page 1');

    //Now, we shouldn't be loading routes that aren't mounted
    expect(LoadableFactory.isLoaded('animated-route-2')).toBe(false);

    //Alright let's change routes, we should see both routes with Page 1 loaded, page 2 loading.
    history.push('/about');
    l.update();
    expect(l.find('div').containsMatchingElement(<div>Page 1</div>)).toBe(true);
    expect(l.find('div').containsMatchingElement(<div>Loading Page 2</div>)).toBe(true);

    //Now we can wait a tad longer, Page 2 should be loaded but still transitining
    await new Promise(resolve => setTimeout(resolve, 22));
    expect(LoadableFactory.isLoaded('animated-route-2')).toBe(true);
    l.update();
    expect(l.find('div').containsMatchingElement(<div>Page 1</div>)).toBe(true);
    expect(l.find('div').containsMatchingElement(<div>Page 2</div>)).toBe(true);

    //And now wait for the transition to be finished
    await new Promise(resolve => setTimeout(resolve, 10));
    l.update();
    expect(l.find('div').containsMatchingElement(<div>Page 1</div>)).toBe(false);
    expect(l.find('div').containsMatchingElement(<div>Page 2</div>)).toBe(true);
  });
});
