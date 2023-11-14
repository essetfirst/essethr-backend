import React,{useState} from "react";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
  GridCellParams 
} from "@mui/x-data-grid";
import {
  DeleteForeverRounded,
  EditRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Container,
  Grid,
  colors,
  Paper,
  CardMedia,
} from "@mui/material";
import { useNavigate,Link     } from "react-router-dom";
import { useTheme } from "@mui/system";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';



const CategoriesView = ({
  forums,
  setSelectedForum,
  setOpen,
  setOpenConfirm,
}: any) => {
  const theme = useTheme();

  console.log(" Forums ", forums);

 
  const rows: GridRowsProp = forums?.result?.map((item: any) => {
    return {
          id: item?.id,
          title: item?.title,
          topic: item?.forum_topic?.name,
          asker:item?.user?.name,
          createdAt: `${new Date(item?.createdAt)}`.slice(0,25),
          isReported: item?.isBookmarked ? "Yes" : "No",
          answers: item?.forum_answers?.length,

        };
  });

  const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 50,
        },{
            field: "createdAt",
            headerName: "Date",
            width: 180,
        },
    {
            field: "title",
            headerName: "Thread Name",
            width: 150,
    },
        {
            field: "topic",
            headerName: "Topic",
            width: 150,
    },
      {
            field: "asker",
            headerName: "Asker",
            width: 150,
    },
{
            field: "isReported",
            headerName: "Reported",
            width: 150,
    },
    {
            field: "answers",
            headerName: "Answers ",
            width: 150,
    },


    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            onClick={() => {
              setSelectedForum(params.row);
              // setOpenConfirm(true);
            }}
          >
            <CheckCircleOutlineIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedForum(params.row);
              setOpenConfirm(true);
            }}
          >
            <DeleteForeverRounded />
          </IconButton>
           {/* <IconButton component={Link} to={`${params.row.id}`}>
              <VisibilityRounded />
          </IconButton> */}
        </Box>
      ),
    },
  ];

  const navigate = useNavigate();
  const handleCellClick = (params:GridCellParams) => {
    const { row,id,field } = params;
    if (field != "actions") {
      console.log(params)
      navigate(`${id}`);
    }
  };
  return (
    <Container maxWidth="lg">
      <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          onCellClick={handleCellClick}
          initialState={{
            pagination: {
              pageSize: 5,
            },
          }}
          components={{
            Toolbar: GridToolbar,
          }} 
          sx={{
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.05)",
          }}
        />
      </Paper>
    </Container>
  );
};

export default CategoriesView;
