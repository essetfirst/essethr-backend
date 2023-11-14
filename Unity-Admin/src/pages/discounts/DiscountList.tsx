import React, { useState } from 'react';
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Grid, Button, Container, Chip, Divider, styled, Typography, Tooltip } from "@mui/material";
import moment from "moment";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Discount from '@mui/icons-material/Discount';

import {
    DeleteForeverRounded,
    EditRounded,
    VisibilityRounded,
} from "@mui/icons-material";

const DiscountRate = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(10),
    lineHeight: 1,
    height: 22,
    minWidth: 12,
}));


export default function DiscountView({
    discounts,
    setSelectedDiscount,
    setOpen,
    setOpenConfirm,
    selectedDiscount
}: any) {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {discounts.discount.map((discount: any) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={discount._id}>
                        <Tooltip title={discount.description} placement="top">
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    width: "95%",
                                    "&:hover": {
                                        opacity: 1,
                                        transition: "all 0.3s ease-in-out",
                                        shadow: 3,
                                        cursor: "pointer",
                                    },

                                }}
                                variant="outlined"
                                aria-label="discount-card"
                            >
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={discount.product.image}
                                    alt={discount.product.name}
                                    sx={{
                                        "&:hover": {
                                            opacity: 0.9,
                                            transition: "all 0.3s ease-in-out",
                                            shadow: 3,
                                            cursor: "pointer",
                                        },
                                    }}
                                />
                                <CardHeader
                                    action={
                                        <IconButton
                                            aria-label="settings"
                                            onClick={handleClick}
                                            id="discount-menu"
                                            aria-controls="discount-menu"
                                            aria-haspopup="true"
                                            aria-expanded={open ? "true" : undefined}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                    title={discount.name}
                                    subheader={
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 10 }}>
                                            created  {moment(discount.createdAt).fromNow()}
                                        </Typography>
                                    }
                                />
                                <Divider />
                                <CardContent sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Chip label={`${moment(discount.startDate).format("MMM Do YY")} --- ${moment(discount.endDate).format("MMM Do YY")}`} />
                                    <DiscountRate>
                                        <Discount sx={{ fontSize: 14 }} />
                                        {discount.rate}% OFF
                                    </DiscountRate>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Menu
                                        id="discount-menu"
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                        MenuListProps={{
                                            "aria-labelledby": "discount-menu",
                                        }}

                                        sx={{
                                            "& .MuiPaper-root": {
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        <MenuItem
                                            onClick={() => {
                                                console.log(discount._id);
                                                setSelectedDiscount(discount);
                                                setOpen(true);
                                            }}
                                        >
                                            <EditRounded sx={{ color: "primary.main" }} />
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                setSelectedDiscount(discount);
                                                setOpenConfirm(true);
                                            }}
                                        >
                                            <DeleteForeverRounded sx={{ color: "error.main" }} />
                                        </MenuItem>
                                    </Menu>
                                </CardActions>
                            </Card>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
