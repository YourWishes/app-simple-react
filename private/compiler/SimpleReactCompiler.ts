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

import { WebpackCompiler } from '@yourwishes/app-react';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as fs from 'fs';
import * as path from 'path';

//Remember, this will be compiled into;
///./node_modules/@yourwishes/app-simple-react/dist/compiler
//where ./ is the root folder
//We are trying to access OUR /private folder
// ../ = dist .../ = root
export const TEMPLATE_INPUT_PATH = path.resolve(__dirname, './../../private/compiler/template.html');
export const TEMPLATE_OUTPUT_PATH = path.resolve(__dirname, './template.html');
export const HANDLEBAR_REGEX = /{{\s*[\w\.]+\s*}}/g;

export interface SimpleReactCompilerVariables {
  gtag?:string,
  title:string,
  keywords:string,
  description:string,
  app_handle:string,
  language:string
}

export class SimpleReactCompiler extends WebpackCompiler {
  template:string;
  variables:object;

  constructor(variables:SimpleReactCompilerVariables) {
    if(!variables) throw new Error("You must make a subclass that extends this with your own template variables!");
    super();

    //Read in HTML Template that we can escape variables for later.
    this.template = fs.readFileSync(TEMPLATE_INPUT_PATH, 'utf8');

    //Store expected variables.
    this.variables = variables;

  }

  generateTemplate(variables:object) {
    //Duplicate template
    let template = ''+this.template;

    //Get used variables (includes braces)
    let used:string[] = template.match(/{{\s*[\w\.]+\s*}}/g);

    used.forEach(uv => {
      //For each used variable
      let [ key ] = uv.match(/[\w\.]+/);
      let value = '';
      if(variables[key]) value = variables[key];
      template = template.replace(uv, value);
    });

    return template;
  }

  generateConfiguration(isProduction:boolean) {
    //Now replace HTML variables
    let template = this.generateTemplate(this.variables);
    let config = super.generateConfiguration(isProduction);

    //Now we need to output the template into the /dist/private folder
    if(fs.existsSync(TEMPLATE_OUTPUT_PATH)) fs.unlinkSync(TEMPLATE_OUTPUT_PATH);
    fs.writeFileSync(TEMPLATE_OUTPUT_PATH, template);

    //Now we need to rewrite the standard compiler to have the input index file be
    //the one we just generated...
    config.plugins.some(plugin => {
      //Is HTML Webpack Plugin?
      if(!(plugin instanceof HtmlWebpackPlugin)) return false;
      //Yes! Rewrite.
      plugin[`options`].template = TEMPLATE_OUTPUT_PATH;
      return true;//Done checking.
    });

    return config;
  }
}
