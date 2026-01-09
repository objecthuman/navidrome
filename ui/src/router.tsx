import { createRouter, createRootRoute, createRoute, Outlet, Navigate } from '@tanstack/react-router'
import App from './App'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AlbumPage } from './pages/AlbumPage'
import { authService } from './services/auth'

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
})

// Authenticated layout route - includes App with navbar, sidebar, player
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: () => {
    // Check auth - redirect to login if not authenticated
    if (!authService.isAuthenticated()) {
      return <Navigate to="/login" />
    }

    return <App />
  },
})

// Public routes (no authentication required)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

// Index route - redirects based on auth
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    return <Navigate to={authService.isAuthenticated() ? '/home' : '/login'} />
  },
})

// Authenticated child routes
const homeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/home',
  component: HomePage,
})

const albumRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/album/$albumId',
  component: AlbumPage,
})

// Create the router
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    authLayoutRoute.addChildren([homeRoute, albumRoute]),
    loginRoute,
    signupRoute,
    indexRoute,
  ]),
  defaultPreload: 'intent',
})

// Register the router for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
