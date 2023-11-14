import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridCellParams,
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
    Typography,
    Avatar,
    Paper,
} from "@mui/material";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import moment from "moment";
import { useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";


const CustomersView = ({
    customers,
    setSelectedCustomer,
    setOpen,
    setOpenConfirm,
    handleUpdate
}: any) => {
    const theme = useTheme();
    const location = useLocation()
    const columns: GridColDef[] = [
      {
        field: "name",
        headerName: "Full Name",
        minWidth: 150,
      },
      {
        field: "phoneNumber",
        headerName: "Phone Number",
        minWidth: 100,
      },
      {
        field: "qualification",
        headerName: "Qualification",
        minWidth: 100,
      },
      {
        field: "state",
        headerName: "State",
        minWidth: 100,
      },
      {
        field: "district",
        headerName: "District",
        minWidth: 100,
      },
      {
        field: "area",
        headerName: "Area",
        minWidth: 100,
      },
      {
        field: "labName",
        headerName: "Lab Name",
        minWidth: 100,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 100,
      },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 100,
        renderCell: (params: any) => {
          const { row } = params;
          const { createdAt } = row;
          return (
            <>
              <Typography variant="body1">
                {moment(createdAt).format("DD MMM YYYY")}
              </Typography>
            </>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 100,
        renderCell: (params: any) => {
          const { row } = params;
          return (
            <>
              <IconButton
                onClick={() => {
                  setSelectedCustomer(row);
                  handleUpdate(row);
                  console.log(" Row ", row);
                }}
              >
                <CheckCircleOutlineIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setSelectedCustomer(row);
                  setOpenConfirm(true);
                }}
              >
                <DeleteForeverRounded />
              </IconButton>
            </>
          );
        },
      },
    ];
    var status =
      location.pathname.split("/")[3] == "2" ? "Pending" : "Approved";
    console.log(" Status  ",status)
    const rows = customers?.result?.map((item: any) => {
        return {
          id: item?.id,
          name: item?.name,
          phoneNumber: item?.phoneNumber,
          qualification: item?.qualification,
          state: item?.state,
          district: item?.district,
          area: item?.area,
          labName: item?.labName,
          status: item?.status == "2" ? "Pending" :"Approved",
          createdAt: item?.updatedAt,
        };
    });

      const navigate = useNavigate();
      const handleCellClick = (params: GridCellParams) => {
        const { row, id, field } = params;
        if (field != "actions") {
          console.log(params);
          navigate(`${id}`);
        }
      };

      const rowss = rows.filter((item:{status:""}) => item.status == status);
    return (
      <Container maxWidth="lg">
        <Paper
          sx={{ background: theme.palette.background.paper }}
          variant="outlined"
        >
          <DataGrid
            rows={rowss}
            columns={columns}
            rowsPerPageOptions={[5, 10, 20]}
            onCellClick={handleCellClick}
            pagination
            autoHeight
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </Paper>
      </Container>
    );
};


export default CustomersView;
