# fetch-hoc

[![Build Status](https://travis-ci.org/esphen/fetch-hoc.svg?branch=master)](https://travis-ci.org/esphen/fetch-hoc)
[![Coverage Status](https://coveralls.io/repos/github/esphen/fetch-hoc/badge.svg?branch=master)](https://coveralls.io/github/esphen/fetch-hoc?branch=master)
[![npm version](https://badge.fury.io/js/fetch-hoc.svg)](https://badge.fury.io/js/fetch-hoc)

A React higher order component for fetching data from a server and passing the
result as props.

Using a HoC for fetching data is easier to understand and master than redux,
while at the same time being more consise than writing utilities and extending
components.

The resource can be either a string or a function. If the resouce is a function,
then the HoC will automatically re-fetch the resouce when the resource URL
changes.

This library is [super tiny][size], measuring just over 1kB gzipped, and has no
dependencies!

## Installation

```bash
yarn add fetch-hoc
# or
npm i -S fetch-hoc
```

If you don't yet use npm or a bundler like webpack, you can get a UMD bundle
from unpkg. Simply add one of the following links into your app, and the library
will be accessible as `FetchHOC` on `window`. Remember to replace `[VERSION]`
with the version you want.

- Minified: https://unpkg.com/fetch-hoc@[VERSION]/dist/fetch-hoc.min.js
- Non-minified: https://unpkg.com/fetch-hoc@[VERSION]/dist/fetch-hoc.js

```html
<script src="https://unpkg.com/fetch-hoc@[VERSION]/dist/fetch-hoc.min.js"></script>
```

## Usage

Now it's my job to tell you why this library is cool.

Simply wrap your component in the result of the `fetch` function to get started.
Using this method enables most of your components to be written as functional
stateless components, which is great for legibility and testabiliy.

```js
fetch('/some/static/resource')(Component)
// Or
fetch(props => `/some/resource/${props.someProp}`)(Component)
```

Here is a more complete example:

```js
const FooComponent = props => {
  if (props.error) {
    return <div className="error">{`An error occured! ${props.error}`}</div>;
  }
  if (props.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {props.data.map(row => <div>{row.text}</div>)}
    </div>
  );
}

// This feeds the props used in render
fetch('http://foo.com/bar')(FooComponent);
```

If you need more flexibility in your component, you can also use a function to
reduce the URL from the component's props. These props can be redux props if you
also have used `connect` on the component.

```js
// With props from parent
fetch(props => `/user/${props.user}/cart`)(FooComponent);

// With redux
compose(
  mapStateToProps(state => ({ user: state.user })),
  fetch(props => `/user/${props.user}/cart`),
)(FooComponent);
```

## Example: Composition is king

Use composition to compose behaviors upon the props this HoC provides! For
example, to add an easily reusable loading icon and error message:

```js
// withLoadingAnimation.js
export default Component => props => (
  props.loading
    ? <YourLoadingComponent />
    : <Component {...props} />
);
```

```js
// withErrorMessage.js
export default message => Component => props => (
  props.error
    ? <div className="error">{message}</div>
    : <Component {...props} />
);
```

```js
// FooComponent.js
import withLoadingAnimation from './withLoadingAnimation';
import withErrorMessage from './withErrorMessage';

const FooComponent = ({ data }) => (
  <div>
    <h1>I will only render on a successfully completed fetch!</h1>
    <pre>{data.toString()}</pre>
  </div>
);

export default compose(
  fetch('/foo'),
  withLoadingAnimation,
  withErrorMessage('Failed to fetch that thing'),
)(FooComponent);
```

## Example: Normalizing data

What about if you need a subset of the data, and the entire dataset is not
convenient to work with? Simple, add a HoC for that:

```js
const normalize = func => Component => ({ data, ..rest }) => (
  <Component data={func(data)} {...rest} />
);

export default compose(
  fetch('/foo'),
  normalize(data => data.rows.filter(row => row.enabled))
);
```

## API
```js
// @flow

type Options = {
  /* The same as the Fetch API options, see
   * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
   */
};

fetch(url: string|Function, options: Options)(component: React.Component)
```

The HoC will inject the following props:

|  Prop      | Type     | Description                                                  |
|------------|----------|--------------------------------------------------------------|
| `data`     | Object   | The data returned from the server                            |
| `error`    | Error    | Any error that occured while fetching the data               |
| `loading`  | boolean  | Whether the request is currently in flight                   |
| `success`  | boolean  | Whether the request was successfully fetched                 |
| `response` | Response | The full response with headers. Cloned and can be read again |

[size]: https://cost-of-modules.herokuapp.com/?p=fetch-hoc
