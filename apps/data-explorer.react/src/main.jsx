import './css/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './views/root'
import Index from './views/projects/index'
import Project, { loader as projectLoader } from './views/projects/project'
import ErrorPage from './views/error-page'

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
  