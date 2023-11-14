import React from "react";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
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
  Typography,
} from "@mui/material";
import { useNavigate,Link } from "react-router-dom";
import { useTheme } from "@mui/system";
const CategoriesView = ({
  categories,
  setSelectedCategory,
  setOpen,
  setOpenConfirm,
}: any) => {
  const theme = useTheme();

  const navigate = useNavigate();
  console.log(" Categories  : ", categories?.result);
  const rows: GridRowsProp = categories?.result?.map((item: any) => {
    return {
          id: item.id,
          title: item.title,
          description: item.description,
          thumbnail: item?.thumbnail,
          createdAt: `${new Date(item?.createdAt)}`.slice(0,25)
        };
  });

  const columns: GridColDef[] = [
  {
            field: "createdAt",
            headerName: "Date",
            width: 200,
    },
        {
            field: "id",
            headerName: "ID",
            width: 50,
        },
    {
            field: "title",
            headerName: "Heading",
            width: 150,
        },
        {
            field: "description",
            headerName: "Description",
            width: 350,
            renderCell:(params:any)=>{
              const {row} = params;
              return (
                <>
                <Typography
                  variant="body2"
                  color="textPrimary"
                  gutterBottom
                  dangerouslySetInnerHTML={{
                    __html: row?.description,
                  }}
                />
                </>
              );
            }
        },
    {
      field: "thumbnail",
      headerName: "Image",
      width: 150,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <CardMedia
            component="img"
            height="80"
            width="150"
            image={params?.row?.thumbnail}
            alt="green iguana"
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            onClick={() => {
              setSelectedCategory(params.row);
              setOpen(true);
            }}
          >
            <EditRounded />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedCategory(params.row);
              setOpenConfirm(true);
            }}
          >
            <DeleteForeverRounded />
          </IconButton>
           <IconButton component={Link} to={`${params.row.id}`}>
              <VisibilityRounded />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
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
