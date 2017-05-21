# fetch-hoc

A React higher order component for fetching data from a server and passing the
result as props.

Using a HoC for fetching data is easier and more legible than redux, while
at the same time being more clear and consise than writing utilities and
extending components.

Automatically fe-fetches if the resource URL changes.

## Synopsis

```js
fetch('/some/static/resource')(Component)
// Or
fetch(props => `/some/resource/${props.someProp}`)(Component)
```

## API
```js
// @flow

type Options = {
  /* The same as the Fetch API options, see
   * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
   */
};

fetch(url: String|Function, options: Options)(component: React.Component)
```

The HoC will inject the following props:

|  Prop     | Type    | Description                                    |
|-----------|---------|------------------------------------------------|
| `data`    | Object  | The data returned from the server              |
| `error`   | Error   | Any error that occured while fetching the data |
| `loading` | boolean | Whether the request is currently in flight     |
| `success` | boolean | Whether the request was successfully fetched   |

## Example: Basic

Simply wrap your component in the result of the `fetch` function. Using this
method enables most of your components to be written as functional stateless
components, which is great for legibility.

```js
const FooComponent = props => {
  if (props.error) {
    return <div className="error">An error occured! {error.toString()}</div>;
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
    : <Component {...props />
);
```

```js
// withErrorMessage.js
const withErrorMessage = message => Component => props => (
  props.error
    ? <div className="error">{message}</div>
    : <Component {...props />
);
```

```js
// FooComponent.js
import withLoadingAnimation from './withLoadingAnimation';
import withErrorMessage from './withErrorMessage';

class FooComponent { /* ... */ }

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
const normalize = normalize => Component => ({ data, ..rest }) => (
  <Component data={normalize(data)} {...rest} />
);

export default compose(
  fetch('/foo'),
  normalize(data => data.rows.filter(row => row.enabled))
);
```
