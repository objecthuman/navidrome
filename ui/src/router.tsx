import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AlbumPage } from "./pages/AlbumPage";
import { ArtistPage } from "./pages/ArtistPage";
import { SearchPage } from "./pages/SearchPage";
import { authService } from "./services/auth";

// Create router configuration
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <Navigate
              to={authService.isAuthenticated() ? "/home" : "/login"}
              replace
            />
          ),
        },
        {
          path: "home",
          element: <HomePage />,
        },
        {
          path: "album/:albumId",
          element: <AlbumPage />,
        },
        {
          path: "artist/:artistId",
          element: <ArtistPage />,
        },
        {
          path: "search",
          element: <SearchPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/signup",
      element: <SignupPage />,
    },
  ],
  {
    basename: "/",
  },
);
