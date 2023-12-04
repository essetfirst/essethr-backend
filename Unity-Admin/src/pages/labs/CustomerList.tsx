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

import DangerousIcon from '@mui/icons-material/Dangerous';
import {
  Box,
  IconButton,
  Container,
  Typography,
  Avatar,
  Grid,
  Button,
  Paper,
} from "@mui/material";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import moment from "moment";
import { useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

const api = import.meta.env.VITE_API_URL;
interface Item {
  id?: string;
  name?: string;
  phoneNumber?: string;
  qualification?: string;
  labName?: string;
  status?: string;
  user?: {
    name?: string;
  };
  createdAt?: string;
}
const CustomersView = ({
  setSelectedCustomer,
  setOpen,
  setOpenConfirm,
  handleUpdate
}: any) => {
  const theme = useTheme();
  const [all, setAll] = useState([]);
  const [url,setUrl] = useState(window.location.href);
  const [otherType ,setOtherType] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const labType = pathParts[3]; // Assuming the lab type is at index 4 in the URL
    const others = labType === 'pending' ? '/pending/' : '/';
    const othersType = labType === 'pending' ? 'pending' : 'all';
    const apiUrl = `${api}lab${others}`;
    setOtherType(othersType)
    console.log(" URL ",apiUrl);
      async function fetchTopic() {
         const response = await axios.get(
           apiUrl,
           {
             headers: {
               "Content-Type": "application/json",
             },
           }
         );
         console.log(" All Values =", response?.data);
         setAll(response?.data?.result);
  }
  fetchTopic();
}, [location.pathname]);


  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      minWidth: 150,
    },
    {
      field: "qualification",
      headerName: "Qualification",
      minWidth: 100,
    },
    {
      field: "labName",
      headerName: "Lab Name",
      minWidth: 100,
    },
    {
      field: "owner",
      headerName: "Owner",
      minWidth: 120,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 70,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
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
      headerName: "Manage Assistant",
      minWidth: 150,
      renderCell: (params: any) => {
        const { row } = params;
        console.log(" Other Rtype ",otherType)
        if(otherType == "pending"){
         return (
          <>
             <IconButton
              onClick={() => {
                console.log(row.id,"Approved");
                handleUpdate({id:row?.id,status:"Approved"})
              }}
            >
              <CheckCircleOutlineIcon />
            </IconButton>
             <IconButton
              onClick={() => {
                  console.log(row.id,"Rejected");
                  handleUpdate({id:row?.id,status:"Rejected"})
              }}
            >
              <DangerousIcon />
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
        }
        if(otherType == "all"){
           return (
          <>
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
        }
        
        
        
      },
    },
  ];


  console.log(" All = ",all);
   const rows = all && all?.map((item:Item) => {
    return {
      id: item?.id || "",
      name: item?.name || "",
      phoneNumber: item?.phoneNumber || "",
      qualification: item?.qualification || "",
      labName: item?.labName || "",
      status: item?.status || "",
      owner: item?.user?.name || "",
      createdAt: item?.createdAt || "",
    };
  });


  return (
    <Container maxWidth="lg">
      <Paper
        sx={{ background: theme.palette.background.paper }}
        variant="outlined"
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
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
