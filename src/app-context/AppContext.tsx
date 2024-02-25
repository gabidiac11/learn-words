import React, { createContext, PropsWithChildren, useReducer } from "react";
import initialState from "./initialState";
import { mainReducer } from "./reducers";
import { State } from "./types";

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => {},
});

const AppContextProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(mainReducer, initialState);
  
    return (
      <AppContext.Provider value={{ state, dispatch }}>
        <>{children}</>
      </AppContext.Provider>
    );
  };
  
  export { AppContextProvider, AppContext };