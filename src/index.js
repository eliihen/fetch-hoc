// @flow
import React from 'react';

export default (
  resource: string | Function,
  options?: RequestOptions,
): Function => Component =>
  class FetchHOC extends React.Component {
    state = {
      loading: false,
      success: undefined,
      error: undefined,
    };

    getUrl = () => {
      let url = resource;
      if (typeof resource === 'function') {
        url = resource(this.props);
      }

      return url;
    };

    prevUrl = this.getUrl();
    componentDidMount = () => this.fetchData(this.getUrl());

    componentDidUpdate() {
      if (typeof resource === 'function' && this.urlHasChanged()) {
        this.fetchData(this.getUrl());
      }
    }

    fetchData = url => {
      if (!url) return;

      // About to start fetching, set loading state
      this.setState(() => ({
        loading: true,
        success: undefined,
        error: undefined,
        response: undefined,
      }));

      const init = {
        credentials: 'same-origin',
        ...options,
      };

      let response;
      fetch(url, init)
        .then(result => {
          response = result;
          return result.text();
        })
        .then(data => {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Not JSON
          }

          if (response.status >= 400 && response.status <= 599) {
            this.setState(() => ({
              data,
              error: new Error(response.statusText),
              loading: false,
              success: false,
              response,
            }));
            return;
          }

          this.setState(() => ({
            data,
            loading: false,
            success: true,
            response,
          }));
        })
        .catch(error => {
          this.setState(() => ({
            error,
            loading: false,
            success: false,
            response,
          }));
        });
    };

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
    };

    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
