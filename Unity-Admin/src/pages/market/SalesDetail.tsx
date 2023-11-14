import PageView from "../../components/PageView";
import { styled } from "@mui/system";
import { useQuery } from "react-query";
import { Divider, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { getSalesDetails } from "../../api/salesApi";
import moment from "moment";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { useMediaQuery,Avatar } from '@mui/material';
import {  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {useState} from  "react"
import axios from "axios";

const api = import.meta.env.VITE_API_URL;
const url = `${api}treatment`;

const token = localStorage.getItem("token");

const SalesDetail = () => {
  const { id }: any = useParams();
  const { data: sales, isLoading } = useQuery(
    ["salesdetail", id],
    () => getSalesDetails(id),
    {
      keepPreviousData: true,
    }
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [actionResult, setActionResult] = useState('');
    const handleApprove = async () => {
    // You would send a PUT request here to approve treatment
    console.log(id,token)
      const data = await axios.put(`${url}/farmer/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "authtoken":`${token}`
        }
      })
    await simulateRequest();
    if (data?.data?.result) {
      setActionResult('Treatment Approved successfully');
    } else {
      setActionResult('Failed To Approve Treatment');
    }
    setOpenDialog(false);
  };

  const handleReject = async () => {
    const data = await axios.delete(`${url}/farmer/${id}`, {
        headers: {
        "Content-Type": "application/json",
        "authtoken":`${token}`

        }
      })
    await simulateRequest();
    if (data?.data?.result) {
      setActionResult('Treatment Rejected successfully');
    } else {
      setActionResult("Failed To Reject Treatment");
    }
    setOpenDialog(false);
  };

  const simulateRequest = async () => {
    // Simulate a delay to mimic API request
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  };

  const handleOpenDialog = (itemId:any) => {
    setSelectedItemId(itemId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedItemId(null);
    setOpenDialog(false);
    setActionResult('');
  };
  const data = [
    {
      name: sales?.result?.nameOne,
      phone: sales?.result?.phoneOne,
      tank: sales?.result?.tankOne
    },    {
      name: sales?.result?.nameTwo,
      phone: sales?.result?.phoneTwo,
      tank: sales?.result?.tankTwo
    },
    {
      name: sales?.result?.nameThree,
      phone: sales?.result?.phoneThree,
      tank: sales?.result?.tankThree
    }
  ]
  const images = [
    sales?.result?.treatment?.imageUrl1,
    sales?.result?.treatment?.imageUrl2,
    sales?.result?.treatment?.imageUrl3]
  console.log(" Get Specific Sales : ",sales)
  if (isLoading) {
    <PageView title="Treatment Detail">
      <LoadingComponent />
    </PageView>;
  }

  if (!sales) {
    return (
      <PageView title="Loading . . .">
        <LoadingComponent />
      </PageView>
    );
  }

 

  return (
    <PageView title="Treatment Detail" backPath="/sales">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
           <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirmation-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="confirmation-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to perform this action?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApprove} color="primary">
            Approve
          </Button>
          <Button onClick={handleReject} color="secondary">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
          <Grid item xs={6}>
            <Paper
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                height: 790,
              }}
              variant="outlined"
            >
              <Typography variant="h4" gutterBottom component="div">
                Treatment Detail
              </Typography>
              <Divider />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <Typography variant="subtitle1" gutterBottom component="div">
                    Treatment Name
                  </Typography>
                  <Typography variant="body2"  component="div">
                    {sales && sales?.result?.treatment?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant="subtitle1" gutterBottom component="div">
                    Treatment Description
                  </Typography>
                  <Typography variant="body2"  component="div">
                    {sales && sales?.result?.treatment?.description}
                  </Typography>
                </Grid>
                <Grid  item xs={12}  sm={12}>
                  <Typography variant="subtitle1" gutterBottom component="div">
                    Problem
                  </Typography>
                  <Typography variant="body2" gutterBottom component="div">
                    {sales && sales?.result?.treatment?.problem?.name}
                  </Typography>
                </Grid>
                <Grid  item xs={12}  sm={12}>
                  <Typography variant="subtitle1" gutterBottom component="div">
                    Sector
                  </Typography>
                  <Typography variant="body2" gutterBottom component="div">
                    {sales && sales?.result?.treatment?.problem?.sector?.name}
                  </Typography>
                </Grid>
                <Grid  item xs={12}  sm={12}>
                  <Typography variant="body1" >
                    Images:
                  </Typography>
                  <Typography>
                    <div>
                      {sales && images.map((imageUrl:any, index:number) => (
                               <a href={imageUrl} target="_blank">
                                 <img src={imageUrl} alt={`Image ${index + 1}`} width="200" height="150" />
                               </a>
                      )) || " No Image "}
                    </div>      
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 200,
              }}
              variant="outlined"
            >
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={8}
                  sm={3}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h6" gutterBottom component="div">
                   Reference Detail
                  </Typography>
                  <Divider />
                </Grid>
               {sales && data.map((user: any, index: number) => (
                        <Grid item key={index} xs={-90}>
             <Avatar alt={`Avatar ${index + 1}`} src={`https://via.placeholder.com/40`} />
            <Typography variant="body1">{user?.name}</Typography>
            <Typography variant="body1"> <a href={`tel:${user?.phone}`}>{user?.phone}</a></Typography> 
            <Typography variant="body1">{user?.tank}</Typography><br></br>
              </Grid>

            ))}
              <Button variant="contained" color="primary" style={{ marginLeft: 'auto', marginRight: '5px' }} onClick={() => handleOpenDialog(id)}>
              Approve
            </Button>
                <Button variant="contained" color="secondary"
                  onClick={() => handleOpenDialog(id)}>
              Reject
            </Button>

              </Grid>
            </Paper>
          </Grid>

        {actionResult && (
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: actionResult.includes('approved') ? '#8BC34A' : '#F44336' }}>
            <Typography variant="body1" style={{ color: 'white' }}>
              {actionResult}
            </Typography>
          </Paper>
        </Grid>
      )}

        </Grid>
      </Container>
    </PageView>
  );
};

export default SalesDetail;
