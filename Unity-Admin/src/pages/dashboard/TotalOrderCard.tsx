import { useState } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Avatar, Box, Button, Grid, Menu, MenuItem, Typography } from '@mui/material';

import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import MainCard from '../../components/MainCard';

const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: "#1e88e5",
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    '&>div': {
        position: 'relative',
        zIndex: 5
    },
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: "#1565c0",
        borderRadius: '50%',
        zIndex: 1,
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        zIndex: 1,
        width: 210,
        height: 210,
        background: "#1976d2",
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));



const TotalOrder = ({ totalOrder }: any) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme: any = useTheme();
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
      <CardWrapper border={false} content={false}>
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.mediumAvatar,
                      backgroundColor: "#1565c0",
                      color: theme.palette.primary[200],
                      zIndex: 1,
                      opacity: 0.9,
                    }}
                  >
                    <SlowMotionVideoIcon fontSize="inherit" />
                  </Avatar>
                </Grid>
                <Grid item>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.mediumAvatar,
                      backgroundColor: "#1565c0",
                      color: theme.palette.primary[200],
                      zIndex: 1,
                    }}
                    aria-controls="menu-earning-card"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <ArrowDownwardIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-earning-card"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    variant="selectedMenu"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem onClick={handleClose}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Export
                    </MenuItem>
                  </Menu>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography
                    sx={{
                      fontSize: "2.125rem",
                      fontWeight: 500,
                      mr: 1,
                      mt: 1.75,
                      mb: 0.75,
                    }}
                  >
                    {totalOrder}
                  </Typography>
                </Grid>
                <Grid item>
                  <Avatar
                    sx={{
                      cursor: "pointer",
                      ...theme.typography.smallAvatar,
                      backgroundColor: theme.palette.secondary.dark,
                      color: theme.palette.secondary[100],
                      opacity: 0.7,
                    }}
                  >
                    <ArrowDownwardIcon
                      fontSize="inherit"
                      sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                    />
                  </Avatar>
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{ mb: 1.25 }}>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: theme.palette.secondary[200],
                }}
              >
                Total Videos
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    );
};


export default TotalOrder;