// @flow
import React from 'react';

export default (
  resource: string | Function,
  options?: RequestOptions,
): Function => Component =>
  class FetchHOC extends React.Component {
    _isMounted: boolean;

    getUrl = () => {
      let url = resource;
      if (typeof resource === 'function') {
        url = resource(this.props);
      }

      return url;
    };

    state = {
      // Ensure only truthy URLs start off as loading (#3)
      loading: !!this.getUrl(),
      success: undefined,
      error: undefined,
    };

    prevUrl = this.getUrl();

    componentDidMount = () => {
      this._isMounted = true;
      this.fetchData(this.getUrl());
    };

    componentDidUpdate() {
      if (typeof resource === 'function' && this.urlHasChanged()) {
        this.fetchData(this.getUrl());
      }
    }

    componentWillUnmount() {
      this._isMounted = false;
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
          response = result.clone();
          return result.text();
        })
        .then(data => {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Not JSON
          }

          if (!this._isMounted) return;

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
          if (!this._isMounted) return;

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
