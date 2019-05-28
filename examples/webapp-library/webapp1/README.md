# webapp-library/webapp1

[demo](https://precor.github.io/web-api-bridge/examples/webapp-library/DEMO.html)

`webapp-library` creates a functional library abstraction for web apps displayed in iframes. This folder implements a `webapp1` which supports two web app types in a single code base, `LibType1` supporting `Commaon` and `Api1` apis, and the other supporting `LibType2` type web apps which use `Common`, `Api2` and an optional `Api3` with additional priviledges to set how photos are displayed. This web app determines its functionality at load time. This example app could have simply been split into three separate web apps but, if all three categories of web apps: `LibType1`, `LibType2` without `Api3` and `LibType3` with `Api3` were sharing more code (they do share `getPhoto`) or data, then it may be desireable to implement them as a single app despite their differences.

The parent launches three instances of this web app: a `LibType1` type, a `LibType2` type with `Common`, `Api2` and `Api3`, and a `LibType2` type with `Common` and `Api2`.
