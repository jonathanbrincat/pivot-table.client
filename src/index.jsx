import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './data_explorer/root_component.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import './data_explorer/css/main.css'

ReactDOM
  .createRoot(document.getElementById('app'))
  .render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
