// Copyright (c) 2018 Dominic Masters
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

export const DPI_RATIOS = [1,2,4];

export type ResponsiveImageSource = {
  path:string;
  height:number;
  width:number;
  scale?:number;
}

export type ResponsiveImage = {
  images:ResponsiveImageSource[];
  src:string;
  srcSet:string;
  width:number;
  height:number;
}

export type ImageSource = string|ResponsiveImage;

export interface ImageProps {
  src:ImageSource;
  alt?:string;
  width?:number;
  height?:number;
  maxWidth?:number;
  className?:string
};

export const Image = (props:ImageProps) => {
  let { src, alt, width, height, maxWidth, className } = props;

  //Sources
  let sources:ResponsiveImageSource[] = [];

  //Is Responsive Image?
  if(src && typeof src !== typeof "") {
    src = src as ResponsiveImage;

    sources = src.images;
    width = width || src.width;
    height = height || src.height;
  }
  sources.sort((l,r) => l.width - r.width);


  //Source Elements
  let sourceElements:JSX.Element[] = [];
  let sourcesByWidth:{[key:string]:ResponsiveImageSource[]} = {};

  //Iterate over supplied sources
  for(let i = 0; i < sources.length; i++) {
    let source = sources[i];
    let w = source.width;

    //Thanks to maxWidth prop we need to check if this iteration is the last.
    let maxWidthBreak = false;
    if(maxWidth && i > 0 && width >= maxWidth) maxWidthBreak = true;

    DPI_RATIOS.every(ratio => {
      let scaledWidth = Math.round(w / ratio);

      //Don't scale less than the smallest image (i.e. 200px@1x shouldn't be 50@4x)
      if(scaledWidth < sources[0].width) return false;

      let o = { ...source };
      o.scale = ratio;//Inject scale (DPI ratio)

      //Create an array for this screen width
      let widthKey = `${scaledWidth}`;
      sourcesByWidth[widthKey] = sourcesByWidth[widthKey] || [];
      sourcesByWidth[widthKey].push(o);//Add this source
      return true;
    });

    //Was this the last iteration?
    if(maxWidthBreak) break;
  }


  //Sort by size in ascending order
  let keys = Object.keys(sourcesByWidth);
  keys.sort((l, r) => parseInt(l) - parseInt(r));

  for(let i = 0; i < keys.length; i++) {
    let k = parseInt(keys[i]);//The pixel size
    let ss = sourcesByWidth[k];//Sources at this pixel resolution (array of sources)
    if(!ss.length) continue;//If none?

    let mediaQuery:string = '';//Media query string
    let sss = [];//Scaled Source

    //Try and make this media query be max width by the next key
    if(i+1 < keys.length) {
      let nextKey = keys[i+1];
      mediaQuery = `(max-width:${nextKey}px)`;
    } else {
      mediaQuery = `(min-width:${k}px)`;
    }

    ss.forEach(scale => {
      sss.push( scale.path + (scale.scale && scale.scale!=1 ? " "+scale.scale+"x" : "") );
    });

    let element = <source media={mediaQuery} srcSet={sss.join(", ")} key={i} />;

    sourceElements.push(element);
  }


  return (
    <picture>
      { sourceElements }
      <img className={className} src={ src as string } alt={ alt } width={ width } height={ height } />
    </picture>
  );
}
