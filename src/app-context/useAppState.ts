import { useContext } from "react";
import { AppContext } from "./AppContext";

export const useAppStateContext = () => {
  return useContext(AppContext).state;
};