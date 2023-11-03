import { useEffect } from "react";
import * as LogRocket from "logrocket";
import * as Sentry from "@sentry/react";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { IonApp, setupIonicReact } from "@ionic/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import useAuthTokenStoreFacade from "./stores/useAuthTokenStore/useAuthTokenStore.facade";
import useUserInfoStoreFacade from "./stores/useUserInfoStore/useUserInfoStore.facade";
import { getRoutes } from "./navigation/routes";
import { baseUrlRegex, setAxiosHeaders } from "./api/ApiConfig";
import { worker } from "./testing/mocks/worker";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/globals.scss";

// TODO: improve this so not manually changing release version every time
if (import.meta.env.MODE !== "development") {
  LogRocket.init("cleqvf/hakubun", {
    release: "0.2.3-alpha",
    shouldCaptureIP: false,
  });
}

Sentry.init({
  release: "0.2.3-alpha",
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracePropagationTargets: [baseUrlRegex],
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.5,
  replaysOnErrorSampleRate: 1.0,
});

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

// for msw (used for testing)
if (import.meta.env.MODE === "development") {
  // bypassing warnings in console since clog it up and aren't very useful imo
  worker.start({ onUnhandledRequest: "bypass" });
}

// TODO: change so not using setupIonicReact and IonApp
setupIonicReact();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // stale time of 10 minutes
      staleTime: 10 * (60 * 1000),
      // cache time of 15 minutes
      cacheTime: 15 * (60 * 1000),
    },
  },
});

const App: React.FC = () => {
  const { isAuthenticated, isAuthLoading, authToken } =
    useAuthTokenStoreFacade();
  const { userInfo } = useUserInfoStoreFacade();

  const browserRouter = getBrowserRouter({
    isAuthenticated,
    isAuthLoading,
  });

  // setting the auth token headers for all api requests
  setAxiosHeaders(authToken);

  // setting current user if that info is available
  if (userInfo) {
    LogRocket.identify(`${userInfo.username}`, {
      name: `${userInfo.username}`,
    });

    Sentry.setUser({ username: `${userInfo.username}` });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastPrimitive.Provider>
        <IonApp>
          <RouterProvider router={browserRouter} />
        </IonApp>
      </ToastPrimitive.Provider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

type BrowserRouterProps = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
};

const getBrowserRouter = ({
  isAuthenticated,
  isAuthLoading,
}: BrowserRouterProps) => {
  let routes = getRoutes({ isAuthLoading, isAuthenticated });
  return sentryCreateBrowserRouter(routes);
};

export default App;
