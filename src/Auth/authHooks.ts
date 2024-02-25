import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export const useAuthInit = () => {
  const [user, isVerifying] = useAuthState(auth);

  return {
    isVerifying,
    user,
  };
};

export const useAppUser = () => {
  const [user] = useAuthState(auth);
  return { user };
};
