// Feature-based imports
import {
  LoginPage,
  RegisterPage
} from '../pages/auth';

import {
  AdminPage
} from '../pages/admin';



import {
  ModeratorPage
} from '../pages/moderator';

import {
  MentorDashboard,
  RegisterMentorPage,
  MentorListPage,
  MentorDetailPage
} from '../pages/mentor';

// Common pages and components
import {
  HomePage,
  NotFoundPage
} from '../pages/common';

import { Layout } from '../components/layout';
import { ProtectedRoute } from '../components/auth';

import { createBrowserRouter, Navigate } from "react-router-dom";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: "/login",
    element: <Layout><LoginPage /></Layout>,
  },
  {
    path: "/register",
    element: <Layout><RegisterPage /></Layout>,
  },
  {
    path: "/register-mentor",
    element: <Layout><RegisterMentorPage /></Layout>,
  },
  {
    path: "/moderator",
    element: <Layout>
      <ProtectedRoute requiredRole="MODERATOR">
        <ModeratorPage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/admin",
    element: <Layout>
      <ProtectedRoute requiredRole="ADMIN">
        <AdminPage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/mentor/dashboard",
    element: <Layout>
      <ProtectedRoute requiredRole="MENTOR">
        <MentorDashboard />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/find-mentor",
    element: <Layout><MentorListPage /></Layout>,
  },
  {
    path: "/mentors/:id",
    element: <Layout><MentorDetailPage /></Layout>,
  },

  {
    path: "*",
    element: <Layout><NotFoundPage /></Layout>,
  },
]);

export default routes;