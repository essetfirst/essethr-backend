import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashbordIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import GroupIcon from '@mui/icons-material/Group';
import DiscountIcon from '@mui/icons-material/Discount';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { NavLink } from 'react-router-dom';
import { listItemClasses } from "@mui/material/ListItem";
import List from "@mui/material/List";
import { Typography, colors } from "@mui/material";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import TopicIcon from '@mui/icons-material/Topic';
import HealingIcon from '@mui/icons-material/Healing';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AgricultureIcon from "@mui/icons-material/Agriculture";
import PhishingIcon from "@mui/icons-material/Phishing";
import SailingIcon from "@mui/icons-material/Sailing";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import  {useState } from 'react';
import PendingIcon from "@mui/icons-material/Pending";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
// import AssessmentIcon from "@mui/icons-material/Assessment";

const listAdminItems = [
  {
    name: "Dashboard",
    icon: <DashbordIcon />,
    path: "/app/dashboard",
  },
  {
    name: "News",
    icon: <NewspaperIcon />,
    path: "/app/news",
  },
  {
    name: "Books",
    icon: <MenuBookIcon />,
    path: "/app/books",
  },
  {
    name: "Videos",
    icon: <OndemandVideoIcon />,
    path: "/app/videos",
  },
  {
    name: "Forum",
    icon: <ForumIcon />,
    path: "/app/forums",
  },
  {
    name: "Treatment",
    icon: <HealingIcon />,
    path: "/app/treatments",
  },
  {
    name: "Market",
    icon: <StorefrontIcon />,
    path: "/app/markets",
    subcategories: [
      {
        name: "Fish",
        icon: <PhishingIcon />,
        path: "/app/markets/1",
      },
      {
        name: "Shrimp",
        icon: <SailingIcon />,
        path: "/app/markets/2",
      },
    ],
  },
  {
    name: "Users",
    icon: <PeopleIcon />,
    path: "/app/users",
    subcategories: [
      {
        name: "Pending",
        icon: <PendingIcon />,
        path: "/app/users/2",
      },
      {
        name: "Approved",
        icon: <CheckBoxIcon />,
        path: "/app/users/1",
      },
    ],
  },
  {
    name: "Farmers",
    icon: <AgricultureIcon />,
    path: "/app/farmers",
  },
  {
    name: "Reports",
    icon: <AssessmentIcon />,
    path: "/app/reports",
    subcategories: [
      {
        name: "Complex",
        icon: <PendingIcon />,
        path: "/app/reports/complex",
      },
      {
        name: "All",
        icon: <CheckBoxIcon />,
        path: "/app/reports/all",
      },
    ],
  },
];

type ShowMarketSubcategories = boolean;
type SetShowMarketSubcategories = React.Dispatch<React.SetStateAction<boolean>>;
type ShowUsersSubcategories = boolean;
type SetShowUsersSubcategories = React.Dispatch<React.SetStateAction<boolean>>;
type ShowReportsSubcategories = boolean;
type SetShowReportsSubcategories = React.Dispatch<React.SetStateAction<boolean>>;

export const mainListItems = (
  showMarketSubcategories: ShowMarketSubcategories,
  setShowMarketSubcategories: SetShowMarketSubcategories,
  showUsersSubcategories: ShowUsersSubcategories,
  setShowUsersSubcategories: SetShowUsersSubcategories,
  showReportsSubcategories: ShowReportsSubcategories,
  setShowReportsSubcategories: SetShowReportsSubcategories,
) => {
  return (
    <React.Fragment>
      <ListSubheader inset sx={{ fontFamily: "Montserrat" }}>
        Admin
      </ListSubheader>
      <List
        sx={{
          [`& .active, & .${listItemClasses.root}:hover`]: {
            "& .MuiListItemIcon-root": {
              color: colors.blue[500],
            },
          },
        }}
      >
        {listAdminItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.name === "Market" ||
            item.name === "Users" ||
            item.name === "Reports" ? (
              <ListItemButton
                onClick={() => {
                  if (item.name === "Market") {
                    setShowMarketSubcategories(!showMarketSubcategories);
                  } else if (item.name === "Users") {
                    console.log("Users Clicked ", showUsersSubcategories);
                    setShowUsersSubcategories(!showUsersSubcategories);
                  } else if (item.name === "Reports") {
                    console.log("Reports Clicked ", showReportsSubcategories);
                    setShowReportsSubcategories(!showReportsSubcategories);
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name.toUpperCase()} />
                {item.name === "Market" ? (
                  showMarketSubcategories ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null}
                {item.name === "Users" ? (
                  showUsersSubcategories ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null}
                {/* {item.name === "Users" ? (
                  showUsersSubcategories ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null} */}
                {item.name === "Reports" ? (
                  showReportsSubcategories ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null}
              </ListItemButton>
            ) : (
              <ListItemButton component={NavLink} to={item.path}>
                <ListItemIcon>{item?.icon}</ListItemIcon>
                <ListItemText primary={item.name.toUpperCase()} />
              </ListItemButton>
            )}
            {item?.name === "Market" &&
              showMarketSubcategories &&
              item?.subcategories && (
                // Render Market subcategories as before
                <List>
                  {item?.subcategories.map((subcategory, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      component={NavLink}
                      to={subcategory?.path}
                      sx={{ paddingLeft: "30px" }} // Indent subcategories
                    >
                      <ListItemIcon>{subcategory?.icon}</ListItemIcon>
                      <ListItemText primary={subcategory?.name} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            {item?.name === "Reports" &&
              showReportsSubcategories &&
              item?.subcategories && (
                <List>
                  {item?.subcategories.map((subcategory, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      component={NavLink}
                      to={subcategory?.path}
                      sx={{ paddingLeft: "30px" }} // Indent subcategories
                    >
                      <ListItemIcon>{subcategory?.icon}</ListItemIcon>
                      <ListItemText primary={subcategory?.name} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            {item?.name === "Users" &&
              showUsersSubcategories &&
              item?.subcategories && (
                <List>
                  {item?.subcategories.map((subcategory, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      component={NavLink}
                      to={subcategory?.path}
                      sx={{ paddingLeft: "30px" }} // Indent subcategories
                    >
                      <ListItemIcon>{subcategory?.icon}</ListItemIcon>
                      <ListItemText primary={subcategory?.name} />
                    </ListItemButton>
                  ))}
                </List>
              )}
          </React.Fragment>
        ))}
      </List>
    </React.Fragment>
  );
};
;


//Secondary Nav Items
export const secondaryListItems = (
    <React.Fragment>
        {/* <ListSubheader inset sx={{ fontFamily: 'Montserrat' }}>
            Reports
        </ListSubheader>
        <List sx={{
            [`& .active, & .${listItemClasses.root}:hover`]: {
                "& .MuiListItemIcon-root": {
                    color: colors.blue[500],
                },
            },
        }}>
            {listReportItems.map((item, index) => (
                <ListItemButton key={index} component={NavLink} to={item.path}>
                    <ListItemIcon sx={{ color: item.color }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name.toUpperCase()} />
                </ListItemButton>))}
        </List> */}
    </React.Fragment>
);

