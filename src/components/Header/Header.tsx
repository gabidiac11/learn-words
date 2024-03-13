import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuthState } from "react-firebase-hooks/auth";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router";
import {
  Home,
  UploadFileRounded,
  TextIncrease,
  LogoutRounded,
  AddLink,
  StarRate,
} from "@mui/icons-material";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { routes } from "../../routes";
import "./Header.scss";

const links = [
  {
    path: routes.Records.path,
    icon: <Home htmlColor="white" className="outline-none" />,
  },
  {
    path: routes.File.path,
    icon: <UploadFileRounded htmlColor="white" className="outline-none" />,
  },
  {
    path: routes.Text.path,
    icon: <TextIncrease htmlColor="white" className="outline-none" />,
  },
  {
    path: routes.Url.path,
    icon: <AddLink htmlColor="white" className="outline-none" />,
  },
  {
    path: routes.WordsToLearn.path,
    icon: <StarRate htmlColor="white" className="outline-none" />,
  },
];

export default function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <>
              {links.map((item) => (
                <button
                  key={item.path}
                  className="no-btn header-btn mr-20"
                  onClick={() => navigate(item.path)}
                  tabIndex={0}
                >
                  {item.icon}
                </button>
              ))}

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
                  <IconButton sx={{ p: 0 }} tabIndex={0}>
                    {!user?.photoURL && <AccountCircle htmlColor="white" />}
                    {user?.photoURL && (
                      <Avatar alt={`User photo`} src={user?.photoURL} />
                    )}
                  </IconButton>
                  <div onClick={() => signOut(auth)} tabIndex={0}>
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
    </Box>
  );
}
