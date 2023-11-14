import MuiAppBar, {
  AppBarProps,
} from "@mui/material/AppBar";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { NavLink as RouterLink, Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Link } from "@mui/material";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }: any) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.dark : "white",
  color: theme.palette.mode === "dark" ? "white" : "#1c4b7a",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" , alignItems: "center"}}>
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          boxShadow: "none",
        }}

      >
        <Toolbar>
          <Typography variant="h5" noWrap component="div">
            <span>Unity Aqua</span>
          </Typography>
          {/* <Button color="success" variant="text" style={{ marginLeft: "auto" }}>
            <Link component={RouterLink} to="/auth/login" style={{ textDecoration: "none" }}>
              Login
            </Link>
          </Button>
          <Button
            variant="outlined"
            color="success"
            style={{ marginLeft: "1rem" }}
          >
            <Link component={RouterLink} to="/auth/register" style={{ textDecoration: "none" }}>
              Register
            </Link>

          </Button> */}
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
