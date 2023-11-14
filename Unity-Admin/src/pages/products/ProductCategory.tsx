import React from 'react'
import { Box, Button, Card, CardContent, Container, CardHeader, Divider, IconButton, Typography, CardMedia, CardActions, CardActionArea, CardProps, CardHeaderProps, CardContentProps, CardActionsProps, CardMediaProps, CardActionAreaProps } from "@mui/material";
import Grid from '@mui/material/Grid';
import moment from 'moment'
import { useTheme } from '@mui/material/styles';

export default function ProductCategory({ product }: any) {
    const theme : any = useTheme();
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
                <Card variant='outlined' sx={{ boxShadow: 'none', borderRadius: 0, '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)' } }}>
                    <CardHeader
                        title={
                            <Typography variant="h5" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <strong>Product Category:   </strong>
                                {product && product.category.name}
                            </Typography>
                        }
                        subheader={
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'} mt={2}>
                                <strong>Created At:   </strong>
                                {product && moment(product.category.createdAt).format('MMMM Do YYYY')}
                            </Typography>
                        }

                    />
                    <CardMedia
                        component="img"
                        height="394"
                        image={product && product.category.image}
                        alt={product && product.category.name}
                    />
                    <CardContent>
                        <Typography variant="h4" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                            <strong>Description:   </strong>
                            {product && product.category.description}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}