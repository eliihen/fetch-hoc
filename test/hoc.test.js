import React from 'react';

import { mount } from 'enzyme';
import fetch from '../src/index';

const exampleUrl = 'http://example.com';
const Wrapped = () => <div />;
const Component = fetch(exampleUrl)(Wrapped);

const fakeText = jest.fn(() => Promise.resolve('mockText'));
const fakeFetch = () =>
  Promise.resolve({
    text: fakeText,
  });

const onCompletion = test =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        test();
      } catch (e) {
        reject(e);
      }

      resolve();
    });
  });

describe('FetchHOC', () => {
  describe('when in the process of fetching', () => {
    window.fetch = jest.fn();

    it('should render a component with loading=true', () => {
      const component = mount(<Component />);
      const wrapped = component.find(Wrapped);

      expect(wrapped).toHaveProp('loading', true);
    });

    it('should have called fetch with the correct URL', () => {
      window.fetch.mockClear();
      mount(<Component />);

      expect(window.fetch).toHaveBeenCalledWith(exampleUrl, {
        credentials: 'same-origin',
      });
    });
  });

  describe('when fetching has succeeded', () => {
    window.fetch = jest.fn(fakeFetch);

    it('should have called .text() on the response', async () => {
      const component = mount(<Component />);
      component.find(Wrapped);

      await onCompletion(() => expect(fakeText).toHaveBeenCalled());
    });

    it('should render a component with the prop loading=false', async () => {
      const component = mount(<Component />);
      const wrapped = component.find(Wrapped);

      await onCompletion(() => expect(wrapped).toHaveProp('loading', false));
    });

    it('should render a component with the prop data="mockText"', async () => {
      const component = mount(<Component />);
      const wrapped = component.find(Wrapped);

      await onCompletion(() => expect(wrapped).toHaveProp('data', 'mockText'));
    });
  });

  describe('when using a function as a resource and the props change', () => {
    /* Needed to be able to change the props of Component after mount */
    class Wrapper extends React.Component {
      state = {};
      render = () => <Component {...this.state} />;
    }
    const exampleUrl = props => `/foo/${props.userId}`;
    const Wrapped = () => <div />;
    const Component = fetch(exampleUrl)(Wrapped);

    it('should update the resolved URL', () => {
      const wrapper = mount(<Wrapper />);
      const wrapped = wrapper.find('FetchHOC');
      const node = wrapped.getNode();

      wrapper.setState({ userId: 123 });
      expect(node.getUrl()).toBe('/foo/123');

      wrapper.setState({ userId: 'foo/bar' });
      expect(node.getUrl()).toBe('/foo/foo/bar');

      // RFC: Is this expected behaviour?
      wrapper.setState({ userId: null });
      expect(node.getUrl()).toBe('/foo/null');

      // RFC: Is this expected behaviour?
      wrapper.setState({ userId: undefined });
      expect(node.getUrl()).toBe('/foo/undefined');
    });

    it('should call fetch', async () => {
      const wrapper = mount(<Wrapper />);

      window.fetch.mockClear();
      wrapper.setState({ userId: 123 });
      wrapper.update(); // Force update required
      expect(window.fetch).toHaveBeenCalledWith('/foo/123', {
        credentials: 'same-origin',
      });

      window.fetch.mockClear();
      wrapper.setState({ userId: 234 });
      wrapper.update(); // Force update required
      expect(window.fetch).toHaveBeenCalledWith('/foo/234', {
        credentials: 'same-origin',
      });
    });
  });

  describe('when fetch throws', () => {
    const error = new Error('MockError');
    beforeAll(() => (window.fetch = jest.fn(() => Promise.reject(error))));

    it('should render a component with a prop success=false and loading=false', async () => {
      const component = mount(<Component />);
      const wrapped = component.find(Wrapped);

      await onCompletion(() => expect(wrapped).toHaveProp('success', false));
      await onCompletion(() => expect(wrapped).toHaveProp('loading', false));
    });

    it('should render a component with a prop error=Error', async () => {
      const component = mount(<Component />);
      const wrapped = component.find(Wrapped);

      await onCompletion(() => expect(wrapped).toHaveProp('error', error));
    });
  });
});
