import * as React from 'react';
import { Router, NavLink } from 'react-router-dom';
import { Link, isRelativeUrl } from './';
import { shallow, mount } from 'enzyme';
import { createBrowserHistory } from 'history';

describe('isRelativeUrl', () => {
  it('should return true for relative urls', () => {
    expect(isRelativeUrl('/')).toBe(true);
    expect(isRelativeUrl('/test')).toBe(true);
    expect(isRelativeUrl('/pages/hello')).toBe(true);
  });

  it('should return false for external or absolute urls', () => {
    expect(isRelativeUrl('//google.com')).toBe(false);
    expect(isRelativeUrl('https://ebay.com.au')).toBe(false);
    expect(isRelativeUrl('http://test.com')).toBe(false);
  });
});

describe('Link', () => {
  it('should render a button by default', () => {
    let l = shallow(<Link />);
    expect(l.name()).toEqual('button');
    
    l.setProps({ children: 'Hello World' });
    expect(l.matchesElement(<button>Hello World</button>)).toBe(true);
    
    expect(
      shallow(<Link><span>Hello</span><span>World</span></Link>)
      .matchesElement(<button><span>Hello</span><span>World</span></button>)
    ).toBe(true);
  });
  
  it('should require a router when attempting to use a relative "to" prop', () => {
    let h = createBrowserHistory();
    let l = shallow(<Link to="/" />)
    expect(() => l.html()).toThrow();
    
    expect(() => shallow(
      <Router history={h}><Link to="/" /></Router>
    ).html()).not.toThrow();
    
    l.setProps({ to: '//google.com/' });
    expect(() => l.html()).not.toThrow();
  });
  
  it('should create a hyperlink when using a relative "to" prop', () => {
    let h = createBrowserHistory();
    
    let l = mount(<Router history={h}><Link exact to="/home" /></Router>);
    expect(l.containsMatchingElement(
      <a href="/home"></a>
    )).toBe(true);
    
    l = mount(<Router history={h}><Link to="/blog" /></Router>);
    expect(l.containsMatchingElement(
      <a href="/blog"></a>
    )).toBe(true);
    
    
    l = mount(<Router history={h}>
      <Link to="/hello-world">Hello World</Link>
    </Router>);
    
    expect(l.containsMatchingElement(
      <a href="/hello-world">Hello World</a>
    )).toBe(true);
  });

  it('should create a hyperlink when using non relative "to" prop.', () => {
    let l = shallow(<Link to="//google.com" />);
    expect(l.matchesElement(<a href="//google.com"></a>)).toBe(true);
    
    l.setProps({ to: 'http://www.ebay.com.au', children: 'eBay' });
    expect(l.matchesElement(<a href="http://www.ebay.com.au">eBay</a>)).toBe(true);
  });
});
