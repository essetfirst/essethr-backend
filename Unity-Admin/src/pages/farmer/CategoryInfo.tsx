import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Card,
  CardContent,
  Container,
  CardMedia,
  CardHeader,
  Divider,
  CardActions,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery,Avatar } from '@mui/material';
import { Chip } from '@mui/joy';
import { CssVarsProvider } from '@mui/joy/styles';
import { useState } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PageView from "../../components/PageView";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify components and CSS
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

const api = import.meta.env.VITE_API_URL;
const url = `${api}user/`;

//Heders for the request
const token = localStorage.getItem("token");

const Item = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: 'none',
    borderRadius: 0,
    '&:hover': {
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    },
}));

const ItemMedia = styled(CardMedia)(({ theme }) => ({
    height: 300,
    backgroundSize: 'fit',

}));




const CategoryInfo = ({ category,tank }: any) => {
    const theme = useTheme();
      const [open, setOpen] = useState(false);
      const handleOpenDialog = () => {
        setOpen(true);
      };

      const handleCloseDialog = () => {
        setOpen(false);
      };

      const handleApprove = () => {
        setOpen(false); // Close the dialog

        axios
          .put(`${url}approve/${category.id}`)
          .then((response) => {
            // Handle success
            console.log("Item approved:", response.data);
                    toast.success("User approved successfully", {
                      position: "top-right",
                      autoClose: 3000, // Auto-close the notification after 3 seconds
                    });
            // You can add more logic here, such as updating your UI
          })
          .catch((error) => {
            // Handle error
            console.error("Error approving item:", error);
                    toast.error("Error approving User", {
                      position: "top-right",
                      autoClose: 3000,
                    });

          });
      };

    const findSum = (num:[]) =>  num.reduce((acc, obj:{size:""}) => acc + Number(obj.size), 0);

    console.log(" Selected  Category = ", category);
    return (
      <PageView title="Farmer Detail" backPath="/users">
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ height: "100%" }} variant="outlined">
                <CardHeader
                  title="Farmer Profile"
                  subheader={
                    <Typography
                      variant="caption"
                      color="secondary"
                      gutterBottom
                    >
                      {category?.name}
                    </Typography>
                  }
                />
                <Divider />
                <ToastContainer />

                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Name
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Mobile
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.phoneNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        State
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.state}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        District
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.district}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Area
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.area}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Date
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: "green" }}
                        gutterBottom
                      >
                        {moment(category?.createdAt).format("MMMM DD, YYYY")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Created By
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.user?.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ height: "100%" }} variant="outlined">
                <CardHeader
                  title="Farmer Tank Info"
                  subheader={
                    <Typography
                      variant="caption"
                      color="secondary"
                      gutterBottom
                    >
                      {category?.labName}
                    </Typography>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Total Culture
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {findSum(tank?.poly) +
                          findSum(tank?.fish) +
                          findSum(tank?.shrimp) || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Fish
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {findSum(tank?.fish) || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Shrimp
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {findSum(tank?.shrimp) || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Poly
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {findSum(tank?.poly) || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenDialog}
                >
                  Approve
                </Button> */}
                <Dialog open={open} onClose={handleCloseDialog}>
                  <DialogTitle>Confirm Approval</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to approve this user?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleApprove} color="primary">
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ height: "100%" }} variant="outlined">
                <CardHeader
                  title="Tanks"
                  subheader={
                    <Typography
                      variant="caption"
                      color="secondary"
                      gutterBottom
                    >
                      {/* {category?.labName} */}
                    </Typography>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Fish
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {tank?.fish?.length > 0 && (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Size</TableCell>
                                  <TableCell>Area</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tank?.fish?.map(
                                  (
                                    tank: {
                                      name: string;
                                      size: string;
                                      area: string;
                                    },
                                    index: number
                                  ) => (
                                    <TableRow key={index}>
                                      <TableCell>{tank.name}</TableCell>
                                      <TableCell>{tank.size}</TableCell>
                                      <TableCell>{tank.area}</TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Shrimp
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {tank?.shrimp?.length > 0 && (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Size</TableCell>
                                  <TableCell>Area</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tank?.shrimp?.map(
                                  (
                                    tank: {
                                      name: string;
                                      size: string;
                                      area: string;
                                    },
                                    index: number
                                  ) => (
                                    <TableRow key={index}>
                                      <TableCell>{tank.name}</TableCell>
                                      <TableCell>{tank.size}</TableCell>
                                      <TableCell>{tank.area}</TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body1"
                        color={
                          theme.palette.mode === "dark"
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        gutterBottom
                      >
                        Poly
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {tank?.poly?.length > 0 && (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Size</TableCell>
                                  <TableCell>Area</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tank?.poly?.map(
                                  (
                                    tank: {
                                      name: string;
                                      size: string;
                                      area: string;
                                    },
                                    index: number
                                  ) => (
                                    <TableRow key={index}>
                                      <TableCell>{tank.name}</TableCell>
                                      <TableCell>{tank.size}</TableCell>
                                      <TableCell>{tank.area}</TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenDialog}
                  style={{ marginLeft: "920px" }}
                >
                  Approve
                </Button> */}
                <Dialog open={open} onClose={handleCloseDialog}>
                  <DialogTitle>Confirm Approval</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to approve this user?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleApprove} color="primary">
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </PageView>
    );
}

export default CategoryInfo