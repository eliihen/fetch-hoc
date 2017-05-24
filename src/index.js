// @flow
import React from 'react';

const initialState = {
  loading: true,
  success: undefined,
  error: undefined,
};

export default (resource: string|Function, options?: RequestOptions): Function => Component => (
  class FetchHOC extends React.Component {
    state = initialState;

    getUrl = () => {
      let url = resource;
      if (typeof resource === 'function') {
        url = resource(this.props);
      }

      return url;
    }

    prevUrl = this.getUrl();
    componentDidMount = () => this.fetchData(this.getUrl());

    componentDidUpdate() {
      if (typeof resource === 'function' && this.urlHasChanged()) {
        this.fetchData(this.getUrl());
      }
    }

    fetchData = ((url) => {
      this.setState(() => initialState);
      try {
        fetch(url, Object.assign({}, {
          credentials: 'same-origin',
        }, options))
        .then(result => result.text())
        .then(data => {
          try {
            data = JSON.parse(data);
          } catch(e) {
            // Not JSON
          }

          this.setState(() => ({ data, loading: false, success: true }));
        });
      } catch (error) {
        this.setState(() => ({ error, loading: false, success: false }));
      }
    })

    urlHasChanged = () => {
      if (typeof resource !== 'function') {
        return this.prevUrl !== resource;
      }

      const currentUrl = resource(this.props);
      if (this.prevUrl !== currentUrl) {
        this.prevUrl = currentUrl;
        return true;
      }

      return false;
    }

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  }
);

