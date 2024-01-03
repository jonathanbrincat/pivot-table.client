import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './data_explorer/root_component.jsx'
import Root, { loader as rootLoader, action as rootAction, } from './data_explorer/routes/root.jsx'
import Index from './data_explorer/routes/index'
import Contact, { loader as contactLoader, action as contactAction, } from './data_explorer/routes/contact.jsx'
import Project, { loader as projectLoader } from './data_explorer/routes/project.jsx'
import EditContact, { action as editAction } from './data_explorer/routes/edit.jsx'
import { action as destroyAction } from './data_explorer/routes/destroy.jsx'
import ErrorPage from './data_explorer/routes/error-page.jsx'

import './data_explorer/css/main.css'
import './data_explorer/css/react-router.css' // TEMP

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      // pathless route allows encapsulated definition without introducing a new path segment in the url
      {
        errorElement: <ErrorPage />, // the Outlet utilises this, consequently so do all child routes
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: "contacts/:contactId",
            element: <Contact />,
            loader: contactLoader,
            action: contactAction,
          },
          {
            path: "contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editAction,
          },
          {
            path: "contacts/:contactId/destroy",
            action: destroyAction,
            errorElement: <div>Oops! There was an error.</div>,
          },
        ]
      },

      {
        errorElement: <ErrorPage />, // the Outlet utilises this, consequently so do all child routes
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: "projects/:projectId",
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
      {/* <App /> */}
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
