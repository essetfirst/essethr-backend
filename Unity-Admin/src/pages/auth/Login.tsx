import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Link } from "react-router-dom";
import PageView from "../../components/PageView";
import { useAuth } from "../../hooks/useAuth";
import { Formik } from "formik";
import * as Yup from "yup";
import { ThreeDots } from "react-loader-spinner";


const Login = () => {
    const { loginAction } = useAuth();
    const validationSchema = Yup.object({
        phoneNumber: Yup.string()
            .required("Phone Number is required"),
        pin: Yup.string()
            .min(4, "Pin should be of minimum 4 characters length")
            .required("Pin is required"),
    });

    return (
        <PageView title="Login">
            <Container component="main" maxWidth="md">
                <CssBaseline />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "85vh",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Formik
                        initialValues={{
                            phoneNumber: "",
                            pin: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            // console.log(values);
                            try {
                                await loginAction(values);
                                resetForm();
                            } catch (error: any) {
                                throw new Error(error);
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="phoneNumber"
                                    label="Phone Number"
                                    name="phoneNumber"
                                    autoComplete="phoneNumber"
                                    autoFocus
                                    value={values.phoneNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                                    helperText={touched.phoneNumber && errors.phoneNumber}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="pin"
                                    label="Pin"
                                    type="text"
                                    id="pin"
                                    autoComplete="current-password"
                                    value={values.pin}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.pin && errors.pin)}
                                    helperText={touched.pin && errors.pin}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {isSubmitting ? (
                                        <ThreeDots
                                            color="#fff"
                                            height={20}
                                            width={20}
                                        />
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                        <Link to="#" >
                                            Forgot password?
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        {/* <Link to="/auth/register" >
                                            {"Don't have an account? Sign Up"}
                                        </Link> */}
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Container>
        </PageView>
    );
};

export default Login;


