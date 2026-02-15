import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root
  },
  {
    path: '/admin',
    Component: Root
  },
  {
    path: '/admin/events',
    Component: Root
  },
  {
    path: '/admin/events/:eventId',
    Component: Root
  },
  {
    path: '/admin/results',
    Component: Root
  },
  {
    path: '/admin/teams',
    Component: Root
  },
  {
    path: '/admin/judges',
    Component: Root
  },
  {
    path: '/admin/team-allocation',
    Component: Root
  },
  {
    path: '/admin/allocation-view',
    Component: Root
  },
  {
    path: '/judge',
    Component: Root
  },
  {
    path: '/judge/events/:eventId',
    Component: Root
  },
  {
    path: '/judge/events/:eventId/score/:teamId',
    Component: Root
  },
  {
    path: '*',
    Component: Root
  }
]);