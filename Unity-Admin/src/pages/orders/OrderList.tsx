import React, { useState } from "react";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  DeleteForeverRounded,
  EditRounded,
  Money,
  VisibilityRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Container,
  Typography,
  Avatar,
  Paper,
  CardMedia
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import moment from "moment";
import { useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { CssVarsProvider } from '@mui/joy/styles';
import Chip from '@mui/joy/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { HourglassBottomRounded } from "@mui/icons-material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
const ITEM_HEIGHT = 48;

const OrdersView = ({
  orders,
  setSelectedOrder,
  setOpen,
  setOpenConfirm,
  approveOrderMutation,
  updateOrderMutation,    
}: any) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(" Current Target ",event.currentTarget);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
const rows: GridRowsProp = orders?.result?.map((item: any) => {
    return {
          id: item?.id,
          title: item?.title,
          description: item?.description,
          thumbnail: item?.thumbnailUrl,
          url : item?.url,
          createdAt: `${new Date(item?.createdAt)}`.slice(0,25)
    };
  });
  const columns: GridColDef[] = [
    {
            field: "id",
            headerName: "ID",
            width: 50,
    },
    {
            field: "title",
            headerName: "Title",
            width: 150,
    },
    {
            field: "description",
            headerName: "Description",
            width: 350,
    },
     {
      field: "thumbnail",
      headerName: "Thumbnail",
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <CardMedia
            component="img"
            height="150"
            width="200"
            image={params?.row?.thumbnail}
            alt="green iguana"
          />
        </Box>
      ),
    },    {
      field: "url",
      headerName: "Video",
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <a href={params?.row?.url} target="_blank">Watch Video</a>
        </Box>
      ),
    },
      {
            field: "createdAt",
            headerName: "Published Date",
            width: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 50,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  background: theme.palette.background.paper,
                  boxShadow: theme.shadows[0],
                  opacity: 0.9,
                },
              }}
            >
              
              <MenuItem
                onClick={() => {
                  setOpen(true);
                  setSelectedOrder(params.row);
                }}
              >
                <EditRounded sx={{ color: "secondary.main" }} />
              </MenuItem>
          
              <MenuItem
                onClick={() => {
                  approveOrderMutation(params.row.id);
                }}
                >
                <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
              </MenuItem>
              <MenuItem
                  onClick={() => {
                    setOpenConfirm(true);
                    setSelectedOrder(params.row);
                  }}
                >
                <DeleteForeverRounded sx={{ color: "error.main" }} />
              </MenuItem>
            </Menu>

          </Box>
        );
      },
    },
  ];

  

  return (
    <Container maxWidth="lg">
      <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          pagination
          components={{
            Toolbar: GridToolbar,
          }}
          initialState={{
            pagination: {
              pageSize: 10,
            },

          }}
        />
      </Paper>
    </Container>
  );
};

export default OrdersView;
