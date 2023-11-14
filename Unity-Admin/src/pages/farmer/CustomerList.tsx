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
    Grid,
    Paper,
} from "@mui/material";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import moment from "moment";
import { useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from 'axios';
import {useState,useEffect} from 'react';
import { useNavigate, Link } from "react-router-dom";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  MenuItem,
} from "@material-ui/core";

const api = import.meta.env.VITE_API_URL;
 interface MyData {
   id: number;
   name: string;
   area: string;
   size: string;
   cultureType: string;
   farmer: {
     name: string;
     phoneNumber: string;
     state: string;
     district: string
  };

   // Add other properties as needed
 }

//  const TankRegistrationModal = ({customers:any}) => {
//     const [open2, setOpen2] = useState(false);
//         const [formData, setFormData] = useState({
//           area: "",
//           size: "",
//           cultureType: "",
//           farmerId: "",
//         });
//         //  const [all, setAll] = useState([]);

//         //  useEffect(() => {
//         //    async function fetchTopic() {
//         //      const response = await axios.get(`${api}farmer/`, {
//         //        headers: {
//         //          "Content-Type": "application/json",
//         //        },
//         //      });
//         //      console.log(" All Tanks Before = ", response.data.result);
//         //      // const data = await response.json();
//         //      setAll(response?.data?.result);
//         //      console.log(" Done ", all);
//         //    }
//         //    fetchTopic();
//         //  }, []);


//     const handleOpen = () => {
//       setOpen2(true);
//     };

//     const handleClose = () => {
//       setOpen2(false);
//     };
//      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//        const { name, value } = e.target;
//        setFormData({ ...formData, [name]: value });
//      };

//      const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
//        e.preventDefault();

//        // Send the form data to /farmer/create using a POST request here
//        // You may use axios or fetch for this purpose

//        console.log(formData);

//        // Close the modal
//        handleClose();
//      };
//      return (
//        <>
      
//          <Grid container spacing={3}>
//            <Button
//             //  variant="contained"
//             //  color="primary"
//              onClick={handleOpen}
//              style={{ marginLeft: 980, width: 150 }}
//            >
//              Add Tank
//            </Button>
//          </Grid>
//            <br></br>
//          <Dialog
//            open={open2}
//            onClose={handleClose}
//            aria-labelledby="form-dialog-title"
//          >
//            <DialogTitle id="form-dialog-title">Add Tank</DialogTitle>
//            <DialogContent>
//              <form onSubmit={handleSubmit}>
//                <TextField
//                  margin="dense"
//                  label="Area"
//                  name="area"
//                  value={formData.area}
//                  onChange={handleChange}
//                  variant="standard"
//                  fullWidth
//                  required
//                />
//                <TextField
//                  label="Size"
//                  name="size"
//                  value={formData.size}
//                  onChange={handleChange}
//                  variant="standard"
//                  fullWidth
//                  required
//                />
//                <FormControl fullWidth>
//                  <InputLabel>Culture Type</InputLabel>
//                  <Select
//                    label="Culture Type"
//                    name="cultureType"
//                    variant="standard"
//                    value={formData.cultureType}
//                    onChange={handleChange}
//                    required
//                  >
//                    <MenuItem value="Fish">Fish</MenuItem>
//                    <MenuItem value="Shrimp">Shrimp</MenuItem>
//                    <MenuItem value="Poly">Poly</MenuItem>
//                  </Select>
//                </FormControl>
//                <FormControl fullWidth>
//                  <InputLabel>Farmer</InputLabel>
//                  <Select
//                    label="Farmer"
//                    variant="standard"
//                    name="farmerId"
//                    value={formData.farmerId}
//                    onChange={handleChange}
//                    required
//                  >
//                    {customers?.map((farmer:any) => (
//                      <MenuItem key={farmer.id} value={farmer.id}>
//                        {farmer.name}
//                      </MenuItem>
//                    ))}
//                  </Select>
//                </FormControl>
//                <DialogActions>
//                  <Button 
//                  type="submit" 
//                  onClick={handleSubmit} variant="contained" color="primary">
//                    Add
//                  </Button>
//                  <Button onClick={handleClose} color="primary">
//                    Cancel
//                  </Button>
//                </DialogActions>
//              </form>
//            </DialogContent>
//          </Dialog>
//        </>
//      );

//  }

const CustomersView = ({
  customers,
  setSelectedCustomer,
  setOpen,
  setOpenConfirm,
  setOpenConfirm2,
  handleUpdate,
}: any) => {
  const theme = useTheme();
  const [all, setAll] = useState([]);


  useEffect(() => {
    async function fetchTopic() {
      const response = await axios.get(`${api}tank/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Tanks Before = ", response.data.result);
      // const data = await response.json();
      setAll(response?.data?.result);
      console.log(" Done ", all);
    }
    fetchTopic();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
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
      field: "cultureType",
      headerName: "Culture Type",
      minWidth: 100,
    },
    {
      field: "labOwner",
      headerName: "Lab Owner",
      minWidth: 100,
    },
    {
      field: "labName",
      headerName: "Lab Name",
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
  const columnss: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
    },
    {
      field: "area",
      headerName: "Area",
      minWidth: 100,
    },
    {
      field: "size",
      headerName: "Size",
      minWidth: 100,
    },
    {
      field: "cultureType",
      headerName: "Culture Type",
      minWidth: 100,
    },
    {
      field: "farmerName",
      headerName: "Farmer Name",
      minWidth: 150,
    },
    {
      field: "farmerPhone",
      headerName: "Farmer Phone",
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
                setOpenConfirm2(true);
              }}
            >
              <DeleteForeverRounded />
            </IconButton>
          </>
        );
      },
    },
  ];

  const rows = customers?.result?.map((item: any) => {
    return {
      id: item?.id,
      name: item?.name,
      phoneNumber: item?.phoneNumber,
      cultureType: item?.cultureType,
      state: item?.state,
      district: item?.district,
      area: item?.area,
      labName: item?.user?.labName,
      labOwner: item?.user?.name,
      createdAt: item?.createdAt,
    };
  });
  const rowss = all?.map((item: any) => {
    return {
      id: item?.id,
      name: item?.name,
      area: item?.area,
      size: item?.size,
      cultureType: item?.cultureType,
      state: item?.farmer ? item?.farmer?.state : "null",
      district: item?.farmer ? item?.farmer?.district : "null",
      farmerName: item?.farmer ? item?.farmer?.name : "null",
      farmerPhone: item?.farmer ? item?.farmer?.phoneNumber : "null",
      createdAt: item?.createdAt,
    };
  });
  console.log(" All ", all);
        const navigate = useNavigate();
        const handleCellClick = (params: GridCellParams) => {
          const { row, id, field } = params;
          if (field != "actions") {
            console.log(params);
            navigate(`${id}`);
          }
        };

  return (
    <div>
      <Container maxWidth="lg">
        <Paper
          sx={{ background: theme.palette.background.paper }}
          variant="outlined"
        >
          <DataGrid
            rows={rows}
            columns={columns}
            rowsPerPageOptions={[5, 10, 20]}
            onCellClick={handleCellClick}
            pagination
            autoHeight
            checkboxSelection
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </Paper>
        <hr></hr>
        <br />
        {/* <TankRegistrationModal customers={customers?.result} />
        <br/> */}
      </Container>
    </div>
  );
};


export default CustomersView;
