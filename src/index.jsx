import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './data_explorer/routes/root'
import ErrorPage from './data_explorer/routes/error-page'
import Index from './data_explorer/routes/projects/index'
import Project, { loader as projectLoader } from './data_explorer/routes/projects/project'

import './data_explorer/css/main.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: 'projects/:projectId',
            element: <Project />,
            loader: projectLoader,
          },
        ]
      }
    ],
  },
])

ReactDOM
  .createRoot(document.getElementById('app'))
  .render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
