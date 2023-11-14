import React, { useReducer } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { Link } from "react-router-dom";
import PageView from "../../components/PageView";
import { Formik } from "formik";
import * as Yup from "yup";
import { register } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import { ThreeDots } from "react-loader-spinner";
import { Divider } from "@mui/material";
import { SendSharp } from "@mui/icons-material";


const initialState = {
    loading: false,
    token: null,
    user: null,
    error: null,
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case "REQUEST":
            return {
                ...state,
                loading: true,
            };
        case "SUCCESS":
            return {
                ...state,
                loading: false,
                token: action.payload.token,
                user: action.payload.user,
            };
        case "ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

const Register = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleSubmit = async (values: any) => {
        dispatch({ type: "REQUEST" });
        try {
            const response = await register(values);
            dispatch({ type: "SUCCESS", payload: response });
            showNotification(response.message, "success");
            // navigate("/login");
        } catch (error: any) {
            dispatch({ type: "ERROR", payload: error });
            showNotification(error.message, "error");
        }
    };

    return (
        <PageView title="Register">
            <Container component="main" maxWidth="lg">
                <CssBaseline />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "95vh",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Register
                    </Typography>
                    <Formik
                        initialValues={{
                            //userDat
                            fullName: "",
                            email: "",
                            password: "",
                            phoneNumber: ""
                        }}
                        validationSchema={Yup.object().shape({
                            fullName: Yup.string().required("Full Name is required"),
                            email: Yup.string()
                                .email("Email is invalid")
                                .required("Email is required"),
                            password: Yup.string()
                                .min(6, "Password must be at least 6 characters")
                                .required("Password is required"),
                            phoneNumber: Yup.string().required("Phone Number is required")
                        })}
                        onSubmit={(values, { resetForm }) => {
                            const signUpData = {
                                    fullName: values.fullName,
                                    email: values.email,
                                    password: values.password,
                                    phoneNumber: values.phoneNumber,
                            };
                            handleSubmit(signUpData);
                            resetForm();

                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                        }) => (
                            <>
                                <form onSubmit={handleSubmit} noValidate>
                                    <Box display="flex">
                                        <Box p={2}>
                                            <Grid item xs={12} sm={12}>
                                                <Typography variant="h5" gutterBottom>
                                                    User Details
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        autoComplete="fname"
                                                        name="fullName"
                                                        required
                                                        fullWidth
                                                        id="fullName"
                                                        label="Full Name"
                                                        autoFocus
                                                        value={values.fullName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.fullName && errors.fullName)}
                                                        helperText={touched.fullName && errors.fullName}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="email"
                                                        label="Email Address"
                                                        name="email"
                                                        autoComplete="email"
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.email && errors.email)}
                                                        helperText={touched.email && errors.email}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        name="phoneNumber"
                                                        label="Phone Number"
                                                        type="text"
                                                        id="phoneNumber"
                                                        autoComplete="phone-number"
                                                        value={values.phoneNumber}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(
                                                            touched.phoneNumber && errors.phoneNumber
                                                        )}
                                                        helperText={touched.phoneNumber && errors.phoneNumber}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        name="password"
                                                        label="Password"
                                                        type="password"
                                                        id="password"
                                                        autoComplete="current-password"
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.password && errors.password)}
                                                        helperText={touched.password && errors.password}
                                                    />
                                                </Grid>

                                            </Grid>
                                        </Box>
                                        <Box flexGrow={1} mb={2} style={{ marginBottom: "auto" }} />
                                        <Divider orientation="vertical" />
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mt: 3,
                                        mb: 2,
                                    }}>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            {
                                                state.loading ?
                                                    <ThreeDots
                                                        height="20"
                                                        width="30"
                                                        radius="9"
                                                        color="#fff"
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle={{}}
                                                        visible={true} />
                                                    :
                                                    "Sign Up"
                                            }
                                        </Button>


                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}>
                                        <Link to="/auth/login">
                                            {"Already have an account? Sign in"}
                                        </Link>
                                    </Box>
                                </form>
                            </>
                        )}
                    </Formik>
                </Box>
            </Container>
        </PageView>
    );
};

export default Register;
