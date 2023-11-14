import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Chip } from '@mui/joy';
import { CssVarsProvider } from '@mui/joy/styles';
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


const ProductInfo = ({ product }: any) => {
    const theme = useTheme();
    // console.log(" Selected ", product);
    // console.log(" Product Info - ",product.user)
    return (
        <Grid container spacing={2}>

            <Grid item xs={12} md={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    ID:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'} >
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user._id.substring(0, 8)}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Full Name:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user.fullName}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Email:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                   <a  href={"mailto:"+product.user?.email}>
                                    {product && product.user?.email}
                                    </a> 
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Phone Number:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    <a  href={"tel:"+product.user?.phoneNumber}>
                                    {product && product.user?.phoneNumber}
                                    </a>
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    City:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user?.city || "-"}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Address:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user?.address|| "-"}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                    

                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Role:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user.role}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Item>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Updated At:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {product && product.user?.updatedAt}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ProductInfo