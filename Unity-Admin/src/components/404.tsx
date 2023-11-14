import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                backgroundColor: "background.default",
                display: "flex",
                flexDirection: "column",
                height: "75%",
                justifyContent: "center",
            }}
        >
            <Container maxWidth="xl">
                <Typography align="center" color="primary" variant="h1">
                    <span role="img" aria-label="404"> 404 </span> Page not found
                </Typography>
                <Typography align="center" color="textPrimary" variant="body1">
                    You either tried some shady route or you came here by mistake. Whichever it is, try using the
                    navigation
                </Typography>
                <Box sx={{ textAlign: "center", mt: 6 }}>
                    <Button
                        color="primary"
                        startIcon={<KeyboardDoubleArrowLeftIcon />}
                        onClick={() => {
                            navigate(-1);
                        }}
                        size="large"
                        variant="text"
                    >
                        Back to home
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default NotFound;
