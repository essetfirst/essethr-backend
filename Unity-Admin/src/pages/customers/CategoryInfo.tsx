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

const api = import.meta.env.VITE_API_URL;
const url = `${api}user/`;

//Heders for the request
var token = localStorage.getItem("token");

console.log(" User Token = ",token,localStorage.getItem("user"))

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




const CategoryInfo = ({ category }: any) => {
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
        console.log(" Before API Call ",category?.id,token);
        axios
          .put(`${url}approve/${category?.id}`,null,{
            headers:{
              "authtoken":`${token}`
            }
          })
          .then((response) => {
            // Handle success
            console.log(" Item approved:", response.data);
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

    console.log(" Selected  Category = ", category);
    return (
      <PageView title="User Detail" backPath="/users">
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ height: "100%" }} variant="outlined">
                <CardHeader
                  title="User Information"
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
                        Lab Name
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.labName}
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
                        Qualification
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.qualification}
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
                        {category.status == "2" ? "Date" : "Approved Date"}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: "green" }}
                        gutterBottom
                      >
                        {category?.approvedDate
                          ? moment(category?.approvedDate).format(
                              "MMMM DD, YYYY"
                            )
                          : moment(category?.updatedAt).format("MMMM DD, YYYY")}
                      </Typography>
                    </Grid>
                    {category?.status == "1" && (
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
                          Approved By
                        </Typography>
                        <Typography
                          variant="body1"
                          color="textPrimary"
                          gutterBottom
                        >
                          {category?.approver?.name || "Yafet"}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ height: "100%" }} variant="outlined">
                <CardHeader
                  title="Lab Information"
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
                        Report Type
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {category?.labReport}
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
                  title="Lab Image"
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
                        Lab Logo
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        <img
                          src={category?.labLogo}
                          alt="Logo"
                          width="200"
                          height="200"
                        />
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
                        Lab Image
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        <img
                          src={category?.labImage}
                          alt="Lab Image"
                          width="200"
                          height="200"
                        />
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
                        Lab Report Image
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        <img
                          src={category?.labReportImage}
                          alt="Lab Image"
                          width="200"
                          height="200"
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                {category.status == "2" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenDialog}
                    style={{ marginLeft: "580px" }}
                  >
                    Approve
                  </Button>
                )}
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