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
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
DialogContentText
} from "@mui/material"; 
import { useTheme } from "@mui/material"; 
import React, { useState, useEffect } from 'react';
import AddCategory from "./AddCategory"; 
import ViewAllCategories from "./ViewAllCategory"; 
import axios from 'axios';
import { number } from "yup";
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@mui/icons-material/Delete';

const api = import.meta.env.VITE_API_URL; 
const url = `${api}topic`; 
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
}));
 
const ProductsView = ({ 
    products, 
    setSelectedProduct, 
    setOpen, 
    setOpenConfirm, 
}: any) => { 
 
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({id:0,name:''});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([{ id: '', name: ''}]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    async function fetchTopic() {
      console.log("Method Called ", url)
      const response = await fetch(`${url}/`, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      console.log(" Get All Topic : ", data?.result)
      setCategories(data?.result);
    }
    fetchTopic();
  }, []);
  const [selectedBookId, setSelectedBookId] = useState('0');
  const [filterBook,setFilterBook] = useState([])

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
    console.log(" Delete Selected Category  Done ")
  };

    const handleConfirmDelete = async () => {
      try {
      console.log(" Welcome to API ",selectedCategory,url);
      // Replace with your actual API endpoint and logic
      const response = await fetch(`${url}/${selectedCategory?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(" Delete Response ",response)
      if (response.ok) {
        setSnackbarMessage('Category deleted successfully');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to delete category');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred');
      setSnackbarOpen(true);
    }

    setOpenDeleteDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

    console.log("   products ", products) 
    const theme = useTheme();  
    const classes = useStyles(); // Assign the classes object to a variable
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setSelectedBookId(value);
      console.log(" value ", value,value=='0')
      if (value == '0') {
        console.log("All")
        setFilterBook(products?.result);
      } else {
        const datas = products?.result?.filter((item: any) => item?.topicId == value)
        console.log(" Other ",value,datas)
        setFilterBook(datas)
      }
  };

 
    return ( 
      <div> 
      <Container maxWidth="md" >
      
      <Typography variant="subtitle1" component="div" id="message">
      </Typography>
            <br></br>
      <Grid container spacing={2} >
        {categories.map((category, index) => (
          <Grid item xs={10} sm={7} md={3} key={index}>
            <Card className={classes.card}>
              <CardContent>{category?.name}</CardContent>
                 <IconButton onClick={() => handleDeleteClick(category)}>
                     <DeleteIcon color="error" />
                 </IconButton>
            </Card>
          </Grid>
        ))}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      </Grid>
      </Container>
        <br>
        </br>
        <div>
          <select value={selectedBookId} onChange={handleSelectChange}>
            <option value="0">All</option>
            {categories && categories?.map((item) => (
              <option value={item?.id}>{item?.name}</option>
            ))}
        </select>
        </div>
        <br></br>

        <Grid container spacing={2}>
        { selectedBookId == "0" ? ( products?.result.map((item: any) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item?.id}>
          <Card sx={{ maxWidth: 300 }}>
            <CardMedia component="img" height="250" image={item?.thumbnailUrl} alt={item?.title} />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {item?.title}
            </Typography>
                <Button variant="outlined"
                  onClick={() => {
                                        console.log(
                                          " Edit Selected Product ",
                                          item
                                        );
                     setSelectedProduct(item); 
                                setOpen(true); 
                            }} >Edit</Button>
                <Button variant="outlined"
                  onClick={() => { 
                                        console.log(
                                          " Delete Selected Product ",
                                          item
                                        );
                                setSelectedProduct(item); 
                                setOpenConfirm(true); 
                            }}>Delete</Button>
          </CardContent>
          </Card>
          </Grid>
          

                    
                ))) : (filterBook?.map((item: any) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item?.id}>
          <Card sx={{ maxWidth: 300 }}>
            <CardMedia component="img" height="250" image={item?.thumbnailUrl} alt={item?.title} />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {item?.title}
            </Typography>
                <Button variant="outlined"
                  onClick={() => { 
                    console.log(" Edit Selected Product ",item)
                    setSelectedProduct(item); 
                                setOpen(true); 
                            }} >Edit</Button>
                <Button variant="outlined"
                  onClick={() => { 
                                console.log(" Delete Selected Product ", item);
                                setSelectedProduct(item); 
                                setOpenConfirm(true); 
                            }}>Delete</Button>
          </CardContent>
          </Card>
          </Grid>          
        )))}
          
        </Grid>
        
          </div>
)
}; 
 
export default ProductsView;