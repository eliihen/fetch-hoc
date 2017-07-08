# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.2.0] - 2017-07-08
### Added
- Don't fetch when the URL resolves to a falsey value (#1)
- Handle 4xx and 5xx responses by setting props to an error state (#2)
- Add new `response` prop which contains the `fetch` response

## [0.1.0] - 2017-05-25
### Added
- Reactive URL by passing a function as the first parameter
- Lots of project related stuff (Tests, ESLint, Flow, prettier, travis,
  coveralls)

### Fixed
- Bugs from the first release

## [0.0.1] - 2017-05-21
### Added
- Initial (buggy) release!

[0.2.0]: https://github.com/esphen/fetch-hoc/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/esphen/fetch-hoc/compare/0.0.1...0.1.0
[0.0.1]: https://github.com/esphen/fetch-hoc/commit/148b67fdfd0ad40439fc4a8f2e61418fa823441b
