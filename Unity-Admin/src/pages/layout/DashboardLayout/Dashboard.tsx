import * as React from "react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import { Outlet } from "react-router-dom";
import { mainListItems, secondaryListItems } from "./ListItems";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useTheme } from "../../../hooks/useTheme";
import { Card, Typography } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { colors } from "@mui/material";
import {
  ArrowCircleLeft,
  ArrowCircleRight,
  ContactSupport,
} from "@mui/icons-material";
import Footer from "../../../components/CopyRight";
import MeanuList from "./MenuList";
import PerfectScrollbar from 'react-perfect-scrollbar'


interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}



const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.dark : "white",
  color: theme.palette.mode === "dark" ? "white" : "#1c4b7a",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    border: "none",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const toggleDrawer = () => {
    setOpen(!open);
  };
    const [showMarketSubcategories, setShowMarketSubcategories] = React.useState(false);
    const [showUsersSubcategories, setShowUsersSubcategories] = React.useState(false);
    const [showReportsSubcategories, setShowReportsSubcategories] = React.useState(false);


  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="absolute" open={open} elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <ArrowCircleRight />
          </IconButton>
          <Typography
            component="div"
            sx={{
              flexGrow: 1,
              ...(open && { display: "none" }),
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "Montserrat",
            }}
          >
            Unity Aqua
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <MeanuList />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <Typography variant="h3" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontFamily: "Montserrat",
                color: darkMode ? "white" : "#1c4b7a",
              }}
            >
              <TravelExploreIcon sx={{ mr: 1, fontSize: 30 }} />
              Unity Aqua
            </Box>
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <ArrowCircleLeft
              sx={{
                color: darkMode ? "white" : "#1c4b7a",
              }}
            />
          </IconButton>
        </Toolbar>
        {/* <Divider /> */}
        <List>
          {mainListItems(
            showMarketSubcategories,
            setShowMarketSubcategories,
            showUsersSubcategories,
            setShowUsersSubcategories,
            showReportsSubcategories,
            setShowReportsSubcategories
          )}
        </List>
        <Divider sx={{ mt: 2 }} />
        {/* <List>{secondaryListItems}</List> */}
        <Box sx={{ flexGrow: 1 }} />
        <Box style={!open ? { display: "none" } : {}}>
          <Footer />
        </Box>
        <Box style={open ? { display: "none" } : {}}>
          <IconButton
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ContactSupport
              sx={{ color: darkMode ? colors.brown[50] : colors.brown[700] }}
            />
          </IconButton>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
      >
        <Toolbar />
        <PerfectScrollbar>
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Outlet />
          </Container>
        </PerfectScrollbar>
      </Box>
    </Box>
  );
}

export default DashboardContent;
