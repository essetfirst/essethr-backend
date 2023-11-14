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
    Box, IconButton, Container, Grid, Typography,
    Chip, Button, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from "@mui/material";
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

const api = import.meta.env.VITE_API_URL; 
const url = `${api}treatment`; 
const token = localStorage.getItem("token") || "";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  card: {
    minHeight: 50,
    display: 'flex',
    justifyContent: 'center',
      alignItems: 'center',
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
interface ObjectWithAttributes {
  id: number | string;
  name: string;
  description: string;
  images: [string],
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
}

//  id: '', name: '',description:'',images:[''],imageUrl1:'',imageUrl2:'',imageUrl3:'' 
const SalesView = ({
    sales,
    setSelectedSales,
    setOpen,
    setOpenConfirm,
}: any) => {
    const classes = useStyles(); // Assign the classes object to a variable
    const [categories, setCategories] = useState([{ id: '', name: '' ,image:''}]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProblem, setSelectedProblem] = useState('');
    const [problems, setProblem] = useState([{ id: '', name: '' }]);
    const [solutions, setSolution] = useState<ObjectWithAttributes[]>([]);
    const [message, setMessage] = useState('');
    const [selectedIndex, setIndex] = useState(0)
    const [problemIndex, setProblemIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false);
      const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [newSectorName, setNewSectorName] = useState('');
    const [newProblemName, setNewProblemName] = useState('');
    const [allproblems, setAllProblem] = useState([{ id: '', name: '', sector:{name:''} }]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarColor, setSnackbarColor] = useState('success'); // 'success' or 'error'
    const [selectedImage, setSelectedImage] = useState<File | null>(null);


  const handleImageChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files && event.target.files[0]; // Get the first selected file
    setSelectedImage( file);
  };
    useEffect(() => {
        async function fetchTopic() {
            const response = await fetch(`${url}/sector`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            setCategories(data?.result);
        }
        fetchTopic();
    }, []);
    useEffect(() => {
        async function fetchProblems() {
            const response = await fetch(`${url}/problem`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            setAllProblem(data?.result);
        }
        fetchProblems();
    }, []);
    const handleSectorClick = async (id: any,name:string,index:number) => {
        const response = await fetch(`${url}/problem/sector/${id}`, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        setSelectedCategory(name);
        setIndex(index);
        // console.log(" Sector ",name," Id: ",id)
        const data = await response.json();
        // console.log(" Get Selected Problem : ", data?.result,name)
        setProblem(data?.result);
    }

  const handleProblemClick = async (id: any, name: string, index: number) => {
      console.log(" Get Farmer ",id)
        const response = await fetch(`${url}/farmer/problem/${id}`, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        setSelectedProblem(name);
        setProblemIndex(index);
        const data = await response.json();
        console.log(" Get Selected Solution : ", data?.result,id)
      setSolution(data?.result);
      console.log(" Test ",solutions)
    }
    // Handle Modal 
    const handleModalOpen = () => {
      setIsModalOpen(true);
    };

  const handleModalOpen2 = () => {
      setIsModalOpen2(true);
    };
    const handleModalClose = () => {
      setIsModalOpen(false);
      setNewSectorName(''); // Clear the input field
  };
  const handleModalClose2 = () => {
      setIsModalOpen2(false);
      setNewSectorName(''); // Clear the input field
    };
    
    const handleNewSectorNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewSectorName(event.target.value);
    };
    const handleNewProblemNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewProblemName(event.target.value);
    };
    const [selectedSector, setSelectedSector] = useState<number | ''>('');

    const handleSectorChange = (event: SelectChangeEvent<number>) => {
          const value = event.target.value;
        setSelectedSector(value === '' ? '' : Number(value));
    };


    const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogOpen2, setDeleteDialogOpen2] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedSectorId, setSelectedSectorId] = useState(null);

  const handleDeleteSectorClick = (problemId: any) => {
    setSelectedSectorId(problemId);
    setDeleteDialogOpen2(true);
  };

  const handleDeleteClick = (problemId: any) => {
    setSelectedProblemId(problemId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // TODO: Make delete request using selectedProblemId
    console.log(" Selected Problem = ",selectedProblemId);
    const response = await axios.delete(`${url}/problem/${selectedProblemId}`, {
            headers: {
                "Content-Type": "application/json",
            }
    });
    console.log(" Selected Problem = ",response);
    setDeleteDialogOpen(false);
    setSelectedProblemId(null);
  };
  const handleDeleteSectorConfirm = async () => {
    // TODO: Make delete request using selectedProblemId
    console.log(" Selected Sector Delete = ",selectedSectorId);
    const response = await axios.delete(`${url}/sector/${selectedSectorId}`, {
            headers: {
                "Content-Type": "application/json",
            }
    });
    console.log(" Selected Sector Delete = ",response);
    setDeleteDialogOpen2(false);
    setSelectedSectorId(null);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProblemId(null);
  };
  const handleDeleteCancel2 = () => {
    setDeleteDialogOpen2(false);
    setSelectedSectorId(null);
  };


    const handleAddSector = async() => {
      const data = {name:newSectorName,image:selectedImage};
        // Make your API POST request here with newSectorName
        console.log(" new Sector Data ", data);
        const response = await axios.post(`${url}/sector`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
                authtoken: `${token}`
            }
        });
        
        setIsModalOpen2(false);
        console.log(" Response Create Sector ",response)
    };
     const handleAddProblem = async() => {
      const data = {name:newProblemName,sectorId:selectedSector};
        // Make your API POST request here with newSectorName
        console.log(" new Problem Data ", data);
        const response = await axios.post(`${url}/problem`, data, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`
            }
        });
         setIsModalOpen(false);
         setSelectedSector('')
         setNewProblemName('')

        // if (response?.data?.result) {
        //  console.log(" Sucess ")   
        //  setSnackbarColor('success');
        //  setSnackbarMessage('Problem added successfully');

        // } else {
        //     console.log(" Error ")   
        //    setSnackbarColor('error');
        //   setSnackbarMessage('Failed to add problem');

        // }
        // setSnackbarOpen(false);

        console.log(" Response Create Problem ",response)
    };
    const handleDeleteProblem = async() => {
        console.log(" New Problem Delete ID ");
        const response = await axios.delete(`${url}/problem/{id}`);
         setIsModalOpen(false);
         

        console.log(" Response Delete Problem ",response)
  };


    const theme = useTheme();
    console.log(" All Sales :=: ", sales);
    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "Id",
            width: 50,
        },
        {
            field: "treatment",
            headerName: "Treatment",
            width: 150,
        },
        {
            field: "category",
            headerName: "Category",
            width: 150,
        },
        {
            field: "problem",
            headerName: "Problem",
            width: 150,
        },
        {
            field: "date",
            headerName: "Date ",
            width: 150,
            renderCell: (params: any) => {
                return <>{new Date(params.value).toLocaleDateString()}</>;
            },
        },
        {
            field: "user",
            headerName: "Added By",
            minWidth: 100
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 100
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
                        <IconButton
                            component={Link}
                            to={`${params.row.id}`}
                        >
                            <VisibilityRounded />
                        </IconButton>

                    </Box>
                );
            },
        },
    ];

    const rows: GridRowsProp = sales?.result.map((item: any) => {
        return {
            id: item?.id,
            treatment: item?.treatment?.name,
            category: item?.treatment?.problem?.sector?.name,
            problem: item?.treatment?.problem?.name,
            date: item?.createdAt,
            user: item?.nameOne + " ",
            status : item?.status == 1? "Pending":"Approved"
        };
    });

    const rowSolution: GridRowsProp = solutions?.map((item: any) => {
      return {
            id: item?.id,
            treatment: item?.treatment?.name,
            category: item?.treatment?.problem?.sector?.name,
            problem: item?.treatment?.problem?.name,
            date: item?.createdAt,
            user: item?.nameOne + " ",
            status : item?.status == 1? "Pending":"Approved"
        };
    });
    return (
        <>
        <Container maxWidth="lg">
            <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    pagination
                    rowsPerPageOptions={[5, 10, 20]}
                    initialState={{
                        pagination: {
                            pageSize: 10,
                        },
                    }
                }
                components={{
                    Toolbar: GridToolbar,
                }}
                />
                </Paper>
                <hr></hr>
                <br></br><br></br>

    <div>
                    <Grid container spacing={1}>
                    <Button variant="contained" color="primary"
                    onClick={handleModalOpen2}
                    style={{ marginLeft: 880 }}>
                    Add Sector
                        </Button>
                        <br></br>
                        <br></br>
                    </Grid>
                    <br></br>
      <Dialog open={isModalOpen2} onClose={handleModalClose2}>
        <DialogTitle>Add New Sector</DialogTitle>
        <DialogContent>
            <TextField
            label="Sector Name"
            value={newSectorName}
            onChange={handleNewSectorNameChange}
            fullWidth
                />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose2} color="primary">Cancel</Button>
          <Button onClick={handleAddSector} color="primary">Add</Button>
        </DialogActions>
        </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // Use 'success' or 'error' color here
        sx={{ backgroundColor: snackbarColor === 'success' ? 'green' : 'red' }}

      >
        <Typography variant="body1">{snackbarMessage}</Typography>
      </Snackbar>

    </div>
        <Grid container spacing={3} >
         {categories.map((sector, index) => (
            <Grid item xs={10} sm={7} md={3} key={index}>
                 <Card className={classes.card}>
                     <CardMedia className={classes.cardMedia}
                        component="img"
                        height="100"
                        image={sector?.image}
                        alt={sector.name}
                      />
                     <CardContent  >

                 <Typography
                   variant="h6"
                   onClick={() => handleSectorClick(sector?.id, sector?.name,index)}
                   style={{ fontWeight: selectedIndex == index ? 'bold' : 'normal' }}
                   >
                   {sector?.name}
                 </Typography>
                 <IconButton
                  className={classes.deleteButton}
                  onClick={() => handleDeleteSectorClick(sector.id)}
              >
                {/* <DeleteIcon /> */}
              </IconButton>
     
              </CardContent>       
            </Card>
           </Grid>
         ))}
          <Dialog open={deleteDialogOpen2}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this sector?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel2} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSectorConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
        </Grid>
          <hr />
                <br>
                </br>
                <Grid container spacing={1}>
                    <Button variant="contained" color="primary"
                    onClick={handleModalOpen}
                    style={{ marginLeft: 880,width:200 }}>
                    Add Problem
                        </Button>
                        <br></br>
                    </Grid>
                    
          <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>Add New Problem </DialogTitle>
        <DialogContent>
          <TextField
            label="Problem Name"
            value={newProblemName}
            onChange={handleNewProblemNameChange}
            fullWidth
            />
          <InputLabel>Select Sector</InputLabel>
        <Select
          value={selectedSector}
          onChange={handleSectorChange}>
          <MenuItem value="">None</MenuItem>
          {categories.map(sector => (
            <MenuItem key={sector.id} value={sector.id}>{sector.name}</MenuItem>
          ))}
        </Select>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">Cancel</Button>
          <Button onClick={handleAddProblem} color="primary">Add</Button>
        </DialogActions>
                </Dialog>
                <br></br>

      <Grid container spacing={3} >
        { selectedCategory ?
         problems?.map((problem, index) => (
           <Grid item xs={10} sm={7} md={3} key={index}>
             <Card className={classes.card2}>
                    <Typography variant="h6"
                         onClick={() => handleProblemClick(problem?.id, problem?.name,index)}
                 style={{ fontWeight: problemIndex == index ? 'bold' : 'normal' }}>
                 {problem?.name}
               </Typography>
               <IconButton
                  className={classes.deleteButton}
                  onClick={() => handleDeleteClick(problem.id)}
              >
                <DeleteIcon />
              </IconButton>
             </Card>
           </Grid>
          ))
         
          :
        (
         allproblems?.map((problem, index) => (
           <Grid item xs={10} sm={7} md={3} key={index}>
             <Card className={classes.card2}>
                    <CardContent className={classes.cardContent}>
                     <Typography variant="h6"
                         onClick={() => handleProblemClick(problem?.id, problem?.name,index)}
                         style={{ fontWeight: problemIndex == index ? 'bold' : 'normal' }}>
                             {problem?.name}
                      </Typography>
                      <Typography className={classes.sectorTypography}>{problem?.sector?.name}</Typography>
                      <IconButton
                         className={classes.deleteButton}
                              onClick={() => handleDeleteClick(problem?.id)}
                           >
                <DeleteIcon />
              </IconButton>
              </CardContent>
             </Card>
           </Grid>
          ))
        )}
      <Dialog open={deleteDialogOpen}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this problem?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

                </Grid>
                <hr />
                <br>
                </br>
            {solutions?.length > 0 &&
            <Paper sx={{ background: theme.palette.background.paper }} variant="outlined">
                <DataGrid
                    rows={rowSolution}
                    columns={columns}
                    autoHeight
                    pagination
                    rowsPerPageOptions={[5, 10, 20]}
                    initialState={{
                        pagination: {
                            pageSize: 10,
                        },
                    }
                }
                components={{
                    Toolbar: GridToolbar,
                }}
                />
                </Paper>
        }
      </Container>

        </>

    );
};

export default SalesView;