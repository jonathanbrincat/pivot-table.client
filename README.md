# Pix8 Data Explorer
Copyright 2025 by pix8 Ltd. All rights reserved. No license granted. This is not free or open-source software. 

React and Vue Pivot Table (Staged in Vite Dec 2025.)

Founded upon [PivotTable.js](https://github.com/nicolaskruchten/pivottable), it was forked, fixed, modernised and in tandem with the React port of this library by the same author [react-pivottable](https://github.com/plotly/react-pivottable).

With the overhaul came a divorce from the original codebase, which still serves as inspirations and deserves to be credited.

A Vue port has since been added.

Setup
```
yarn install --immutable --immutable-cache
# installation with matched dependencies
```

To run the application for development
```
yarn start
```

To run build for production
```
yarn run build
```

The build will be available on `http://localhost:5173`.

To navigate to a project your must supply a valid project identifier. The route is of the signature `http://localhost:5173/projects/<project_id>`.
