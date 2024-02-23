import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuthState } from "react-firebase-hooks/auth";
import { Alert, Avatar, Snackbar } from "@mui/material";
import { useNavigate } from "react-router";
import { Home, LogoutRounded } from "@mui/icons-material";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Header() {
  const [user] = useAuthState(auth);
  const [snack, setSnack] = useState({
    message: "",
    open: false,
    severity: "error",
  });
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }} aria-label="header">
      <AppBar position="static" aria-label="header">
        <Toolbar aria-label="header">

          {user && (
            <>
              <button
                className="no-btn"
                aria-label="link to home page"
                onClick={() => navigate("/home")}
                style={{ flexGrow: 0, padding: 10, boxSizing: "border-box" }}
                tabIndex={0}
              >
                <Home
                  htmlColor="white"
                  aria-label="link to home page"
                  className="outline-none"
                />
              </button>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ flexGrow: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    tabIndex={0}
                    aria-label={`text: user ${
                      user?.displayName || user?.email
                    }`}
                    component="div"
                    style={{ lineHeight: "50px", paddingRight: "10px" }}
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    {user?.displayName || user?.email}
                  </Typography>
                  <IconButton
                    aria-label="photo user"
                    sx={{ p: 0 }}
                    tabIndex={0}
                  >
                    {!user?.photoURL && <AccountCircle htmlColor="white" />}
                    {user?.photoURL && (
                      <Avatar alt={`User photo`} src={user?.photoURL} />
                    )}
                  </IconButton>
                  <div
                    onClick={() => signOut(auth)}
                    aria-label="logout button"
                    tabIndex={0}
                  >
                    <LogoutRounded
                      style={{
                        color: "white",
                        marginLeft: "10px",
                        fontSize: 20,
                      }}
                    ></LogoutRounded>
                  </div>
                </div>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Snackbar
        open={snack.open}
        autoHideDuration={12000}
        transitionDuration={0}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={"error"}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
