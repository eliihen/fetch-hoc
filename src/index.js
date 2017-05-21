import React from 'react';

export default (resource, options) => Component => (
  class FetchHOC extends React.Component {
    state = {
      loading: true,
    };

    getUrl = () => {
      let url = resource;
      if (typeof url === 'function') {
        url = resource(this.props);
      }

      return url;
    }

    prevUrl = this.getUrl();

    componentDidMount() {
      this.fetchData(this.getUrl());
    }

    componentWillReceiveProps(newProps) {
      if (typeof resource === 'function' && this.urlHasChanged()) {
        this.fetchData();
      }
    }

    fetchData = (async (url) => {
      try {
        const result = await fetch(url, Object.assign({}, {
          credentials: 'same-origin',
        }, options));

        let data = await result.text();
        try {
          data = JSON.parse(data);
        } catch(e) {
          // Not JSON
        }

        this.setState({ data, loading: false, success: true });
      } catch (error) {
        this.setState({ error, success: false });
      }
    })

    urlHasChanged = () => {
      const currentUrl = resource(this.props);
      if (prevUrl !== currentUrl) {
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

