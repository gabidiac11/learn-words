import React, { useCallback, useEffect, useState } from "react";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth } from "../firebase";
import {
  FormControl,
  OutlinedInput as Input,
  InputLabel,
  FormGroup,
} from "@mui/material";
import { Button, Typography } from "@mui/material";
import "./auth.scss";
import { useFetchPromise } from "../hooks/useFetchData";
import { useOnEnter } from "../utils";
import { FetchError, FetchFirebaseError } from "../hooks/error-types";
import { useUIFeedback } from "../app-context/useUIFeedback";

const Login = () => {
  const { executeFetch, loading, error } = useFetchPromise<UserCredential>();
  const { displayError } = useUIFeedback();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = useCallback(async () => {
    executeFetch(() => signInWithEmailAndPassword(auth, email, password));
  }, [email, password, executeFetch]);

  const onEnterSubmit = useOnEnter(onSubmit);

  useEffect(() => {
    error && displayError(computeError(error));
  }, [error, displayError])

  return (
    <div className="view login-page">
      <div className="container">
        <Typography
          tabIndex={0}
          variant="h4"
          color={"rgb(25, 118, 210)"}
          style={{ paddingBottom: "20px" }}
        >
          Logare, domne, logare...
        </Typography>

        <FormGroup className="buttons">
          <FormControl className="form-control">
            <InputLabel className="form-label" htmlFor="email-input">
              Adresă de poștă electronică{" "}
            </InputLabel>
            <Input
              onKeyDown={onEnterSubmit}
              placeholder="Email address"
              required
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email-input"
              aria-describedby="my-helper-text"
            />
          </FormControl>
          <FormControl className="form-control">
            <InputLabel className="form-label" htmlFor="password-input">
              Parolă super sucurizantă
            </InputLabel>
            <Input
              onKeyDown={onEnterSubmit}
              placeholder="Password"
              required
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              id="password-input"
              aria-describedby="my-helper-text"
            />
          </FormControl>
          <Button
            tabIndex={0}
            variant="contained"
            color="primary"
            className="button"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading && "Loading..."}
            {!loading && "Așa, tati!"}
          </Button>
        </FormGroup>
      </div>
    </div>
  );
};

function computeError(error: FetchError): string {
  const firebaseError = error as FetchFirebaseError;
  switch (firebaseError.originalError.code) {
    case "auth/invalid-email":
      return "Băăă, ce-i cu poșta aia electronică?!";
    case "auth/invalid-credential":
      return "Nu stiu pe nimeni, nene... Ori pui ceva bun, ori valea, nene!";
  }
  return error.message;
}

export default Login;
