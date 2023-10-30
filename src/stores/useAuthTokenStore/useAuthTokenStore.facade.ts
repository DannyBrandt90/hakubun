import { useShallow } from "zustand/react/shallow";
import {
  AuthTokenState,
  AuthTokenActions,
  useAuthTokenStore,
} from "./useAuthTokenStore";

// using facade pattern, cleaner to use in components and easier to replace zustand in future if necessary
const useAuthTokenStoreFacade = () => {
  const {
    authToken,
    isAuthenticated,
    isAuthLoading,
    setAuthToken,
    setIsAuthLoading,
    setIsAuthenticated,
    reset,
  } = useAuthTokenStore(
    useShallow((state: AuthTokenState & AuthTokenActions) => ({
      authToken: state.authToken,
      isAuthenticated: state.isAuthenticated,
      isAuthLoading: state.isAuthLoading,
      setAuthToken: state.setAuthToken,
      setIsAuthLoading: state.setIsAuthLoading,
      setIsAuthenticated: state.setIsAuthenticated,
      reset: state.reset,
    }))
  );

  return {
    authToken,
    isAuthenticated,
    isAuthLoading,
    setAuthToken,
    setIsAuthLoading,
    setIsAuthenticated,
    reset,
  };
};

export default useAuthTokenStoreFacade;
