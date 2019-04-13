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
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement|HTMLButtonElement> {
  to?:string,
  activeClassName?:string,
  exact?:boolean
}

export const isRelativeUrl = (s:string) =>  !/^(?:[a-z]+:)?\/\//i.test(s);

export const Link = (props:LinkProps) => {
  let LinkElement:(string|typeof NavLink) = 'button';
  let np:any = {...props};

  ['to'].forEach(e => delete np[e]);

  if(props.to) {
    if(isRelativeUrl(props.to)) {
      np['to'] = props.to;
      LinkElement = NavLink;
    } else {
      LinkElement = 'a';
      np['href'] = props.to;
    }
  }

  return <LinkElement {...np} />;
};
