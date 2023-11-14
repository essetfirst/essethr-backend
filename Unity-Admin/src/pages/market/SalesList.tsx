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
import { AddCircleRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  TableCell,
} from "@mui/material";
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import React from "react";

import { 
  colors, 
  Card,
    CardContent,
  CardMedia,
  Snackbar,
DialogContentText
} from "@mui/material"; 

import { useTheme } from "@mui/system";
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react'
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";

const api = import.meta.env.VITE_API_URL; 
const url = `${api}treatment`; 
const token = localStorage.getItem("token") || "";
const svgImage = [
  "https://res.cloudinary.com/aastusirara/image/upload/v1693945308/fish-svgrepo-com_1_w7vhmx.svg",
  "https://res.cloudinary.com/aastusirara/image/upload/v1693945019/shrimp-svgrepo-com_yasiez.svg",
];
const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  card: {
    minHeight: 150,
    display: 'flex',
    // marginLeft:"100px",
    marginLeft: theme.spacing(3),
    justifyContent: 'center',
    alignItems: 'center',
    align:'center'
  },
  card2: {
    minHeight: 80,
    minWidth: 180,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    },
 card3: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  selected: {
  fontWeight: 'bold',
},
  cardMedia: {
    paddingTop: '-25.25%', // 16:9 aspect ratio (for 9:16 use paddingBottom)
    maxWidth: '50%', // Limit image width
    margin: 'auto',
  },
  cardContent: {
    flexGrow: 1,
  },
  sectorTypography: {
    fontSize: '0.9rem', // Smaller font size for sector
    color: 'green',
  },
  deleteButton: {
    marginLeft: 'auto', 
    color: theme.palette.error.main,
  },


}));

  

  interface DataItem {
  count: string;
  rate: number;
}
interface SliderSettings {
  infinite: boolean;
  slidesToShow: number;
  slidesToScroll: number;
  autoplay:boolean;
  speed: number;
  autoplaySpeed: number;
  pauseOnHover: boolean;
}

type TableVisibility = Record<string, boolean>;

const sliderSettings: SliderSettings = {
  infinite: true,
  slidesToShow: 6, // You can adjust the number of visible cities
  slidesToScroll: 1,
  autoplay: false,
  speed: 2000,
  autoplaySpeed: 3000,
  pauseOnHover: true,
};
const SalesView = ({
  sales,
  setSelectedSales,
  setOpen,
  setOpenConfirm,
}: any) => {
  const location = useLocation();

  const classes = useStyles(); // Assign the classes object to a variable
  const [openZone, setOpenZone] = useState(false);
  const [zoneName, setZoneName] = useState("");
  var selectedMarketId = location.pathname.split("/")[3];
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  var selectedMarket = location.pathname.split("/")[3];
  const [marketTable, setMarketTable] = useState([
    { id: "", name: "", status: [{ rate: 0, count: "" }] },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    console.log(" Date Change ", selectedZoneId);
    await handleZoneClick2(selectedZoneId, date);
    console.log("ENDDDDD");
  };
  const handleClickOpen = () => {
    setOpenZone(true);
  };
  const handleClose = () => {
    setOpenZone(false);
  };
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoneName(event.target.value);
  };
  const handleMarket = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    // setSelectedMarket(value);
    const response = await fetch(`${api}market/find/market/${selectedMarket}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(" Get All Zone Change : ", value, data?.result);
    setAllZone(data?.result);
    setMarketTable([]);
  };
  const handleZoneClick = (cityId: string) => {
    const date = selectedDate?.toISOString().split("T")[0];
    console.log(" Zone Date ", cityId, date);
    setSelectedZoneId(cityId);
    fetch(`${api}market/find/zone/${cityId}?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          setMarketTable([]);
          return;
        }
        return response.json();
      })
      .then((data) => {
        console.log(" Response ", data);
        console.log(" Get All Type Table Change : ", data?.result);
        setMarketTable(data?.result);
      })
      .catch((error) => {
        setMarketTable([]);
        // Handle any errors that occurred during the fetch
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const handleZoneClick2 = (cityId: string, selectedDate: Date) => {
    const date = selectedDate?.toISOString().split("T")[0];
    console.log(" Zone Date ", cityId, date);
    setSelectedZoneId(cityId);
    fetch(`${api}market/find/zone/${cityId}?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response?.ok) {
          setMarketTable([]);
          return;
        }
        return response.json();
      })
      .then((data) => {
        console.log(" All Type Table Change = ", data?.result);
        setMarketTable(data?.result);
      })
      .catch((error) => {
        setMarketTable([]);
        // Handle any errors that occurred during the fetch
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const [allZones, setAllZone] = useState([{ id: "", name: "" }]);
  useEffect(() => {
    async function fetchTopic() {
      const response = await fetch(
        `${api}market/find/market/${selectedMarket}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(" Get All Zone : ", selectedMarket, data?.result);
      setAllZone(data?.result);
    }
    fetchTopic();
  }, []);

  const handleAddZone = () => {
    // Send a POST request with the entered name
    axios
      .post(`${api}market/zone/`, {
        name: zoneName,
        marketId: selectedMarket,
      })
      .then((response) => {
        // Handle the response if needed
        console.log("Add Zone :", response.data);
        toast.success("Zone added successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        handleClose();
        setZoneName("");
        //  setSelectedMarketId(location.pathname.split("/")[3]);
      })
      .catch((error) => {
        toast.error("Error adding zone. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Error sending POST request:", error);
      });
  };

  const theme = useTheme();
  console.log(" All Market :=: ", sales);
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Id",
      width: 50,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "count",
      headerName: "Count",
      width: 150,
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
    },
    {
      field: "marketzone",
      headerName: "Market Zone",
      width: 150,
    },
    {
      field: "market",
      headerName: "Market",
      minWidth: 100,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            <IconButton
              onClick={() => {
                setSelectedSales(params.row);
                setOpen(true);
              }}
            >
              <EditRounded />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedSales(params.row);
                setOpenConfirm(true);
              }}
            >
              <DeleteForeverRounded />
            </IconButton>
          </Box>
        );
      },
    },
  ];
  console.log(" URL ", location.pathname.split("/")[3], selectedMarket);
  const rows: GridRowsProp = sales?.result.map((item: any) => {
    return {
      id: item?.id,
      name: item?.name,
      count: item?.count,
      rate: item?.rate,
      marketzone: item?.market_zone?.name,
      market: item?.market_zone?.market?.name,
      status: item?.status,
    };
  });
  const [openTable, setOpenTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [numRows, setNumRows] = useState(0);
  const [data, setData] = useState<DataItem[]>([{ count: "", rate: 0 }]);

  const handleOpenTable = () => {
    setOpenTable(true);
  };

  const handleCloseTable = () => {
    setOpenTable(false);
    setTableName("");
    setNumRows(0);
    setData([]);
  };

  const handleRowCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(event.target.value, 10) || 0;
    console.log(" Row Count ", count);
    setNumRows(count);
    if (count > 0) {
      handleAddData(count);
    } else {
      // If count is 0, reset the data array
      setData([]);
    }
  };

  const handleAddData = (count: Number) => {
    var newData = [];
    for (let i = 0; i < count; i++) {
      newData.push({ count: "", rate: 0.0 });
    }
    setData(newData);
  };

  const handleDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: string
  ) => {
    var newData = [...data];
    var { value } = event.target;
    console.log(field, value, index, " Field Value Index Order ");
    // newData[index][field] = field == "rate" ? parseFloat(value) : value;
    (newData[index] as any)[field] =
      field === "rate" ? parseFloat(value) : value;
    setData(newData);
  };
  const handleSave = () => {
    // Prepare the data for the POST request
    var postData = {
      name: tableName,
      data: data,
      marketZoneId: selectedZoneId ? selectedZoneId : 3,
    };
    console.log(" Form Data ", postData);
    axios
      .post(`${api}market/type/`, postData)
      .then((response) => {
        console.log(" Response Add table ", response);
        if (response.status == 200 || response.status == 201) {
          // Table deleted successfully
          toast.success("Table added successfully");
          // Update your data or state here if necessary
        } else {
          // Handle other status codes as needed
          toast.error("Error adding table");
        }
      })
      .catch((error) => {
        console.error("Delete request error:", error);
        toast.error("Error adding table");
      });
    handleCloseTable();
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDeleteId, setTableToDeleteId] = useState("");
  const [tableVisibility, setTableVisibility] = useState<TableVisibility>({});

  useEffect(() => {
    const initialVisibility: TableVisibility = {};
    marketTable.forEach((table) => {
      initialVisibility[table.id] = true;
    });
    setTableVisibility(initialVisibility);
  }, [marketTable]);

  const handleDeleteClick = (tableId: string) => {
    setTableToDeleteId(tableId);
    setDeleteDialogOpen(true);
  };

  const handleShowHideClick = (tableId: string) => {
    setTableVisibility((prevVisibility) => ({
      ...prevVisibility,
      [tableId]: !prevVisibility[tableId],
    }));
  };

  const handleDeleteConfirm = () => {
    axios
      .delete(`${api}market/type/${tableToDeleteId}`)
      .then((response) => {
        console.log(" Delete Response ", response);
        if (response.status == 200) {
          toast.success("Table deleted successfully");
        } else {
          toast.error("Error deleting table");
        }
        setDeleteDialogOpen(false);
        setTableToDeleteId("");
      })
      .catch((error) => {
        console.error("Delete request error:", error);
        toast.error("Error deleting table");
        setDeleteDialogOpen(false);
        setTableToDeleteId("");
      });
    setDeleteDialogOpen(false);
  };

  //  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTableToDeleteId("");
  };

  return (
    <>
      <Container maxWidth="lg">
        <Paper
          sx={{ background: theme.palette.background.paper }}
          variant="outlined"
        ></Paper>
        <br />
        <br />
        <div>
          <Slider {...sliderSettings}>
            {allZones?.length > 1 &&
              allZones.map((city) => (
                <div key={city?.id} onClick={() => handleZoneClick(city?.id)}>
                  <p
                    style={{
                      fontWeight:
                        selectedZoneId == city?.id ? "bold" : "normal",
                    }}
                  >
                    {city?.name}
                  </p>
                </div>
              ))}
          </Slider>
        </div>
        <hr></hr>
        <hr></hr>

        <div>
          <Button
            variant="contained"
            onClick={handleOpenTable}
            endIcon={<AddCircleRoundedIcon />}
            style={{
              backgroundColor: "blue",
              color: "white",
              marginLeft: "990px",
              marginTop: "10px",
            }}
          >
            Add Table
          </Button>
          <Dialog open={openTable} onClose={handleCloseTable}>
            <DialogTitle>Add Table</DialogTitle>
            <DialogContent>
              <TextField
                label="Table Name"
                fullWidth
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
              />
              <TextField
                label="Number of Rows"
                type="number"
                fullWidth
                value={numRows}
                onChange={handleRowCountChange}
                required
              />
              {numRows > 0 && (
                <Grid container spacing={2}>
                  {data.map((item, index) => (
                    <Grid container item spacing={1} xs={12} key={index}>
                      <Grid item xs={6}>
                        <TextField
                          label={`Count ${index + 1}`}
                          fullWidth
                          value={item?.count}
                          onChange={(e) => handleDataChange(e, index, "count")}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label={`Rate ${index + 1}`}
                          fullWidth
                          type="number"
                          value={item?.rate}
                          onChange={(e) => handleDataChange(e, index, "rate")}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTable} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <ToastContainer />
        </div>
        <div>
          <Grid container spacing={3}>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              {marketTable[0]?.id &&
                marketTable.map((table, index) => (
                  <Grid item key={index} xs={8}>
                    <Paper
                      key={index}
                      elevation={6}
                      style={{ marginBottom: "20px", textAlign: "center" }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        style={{ padding: "10px" }}
                      >
                        {table?.name}
                      </Typography>
                      <Button onClick={() => handleShowHideClick(table.id)}>
                        {tableVisibility[table?.id]
                          ? "Hide Table"
                          : "Show Table"}
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => handleDeleteClick(table?.id)}
                      >
                        Delete
                      </Button>
                      {tableVisibility[table?.id] && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ width: "50px" }}>
                                  Count
                                </TableCell>
                                <TableCell style={{ width: "50px" }}>
                                  Rate
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {table?.status.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  <TableCell style={{ width: "50px" }}>
                                    {row.count}
                                  </TableCell>
                                  <TableCell style={{ width: "50px" }}>
                                    {row.rate}
                                  </TableCell>
                                  <TableCell
                                    style={{ width: "50px" }}
                                  ></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Paper>
                  </Grid>
                ))}
            </Grid>
            <ToastContainer position="top-right" autoClose={3000} />
            <Dialog
              open={deleteDialogOpen}
              onClose={handleCloseDeleteDialog}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Delete Table</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this table?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
            <Grid item xs={3}>
              <Typography variant="subtitle1">Calender</Typography>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
              />
            </Grid>
          </Grid>
        </div>
        <div></div>
      </Container>
    </>
  );
};

export default SalesView;