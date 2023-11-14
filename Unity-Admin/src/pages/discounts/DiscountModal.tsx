import React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";
import { ButtonGroup, Button } from "@mui/material";
import { ThreeDots } from "react-loader-spinner";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import { Grid } from "@mui/material";
import { useProduct } from "../../hooks/useProduct";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from "@mui/x-date-pickers";

import moment from 'moment';

type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
    selectedDiscount: any;
    setDiscount: any;
    handleCreate: (values: any) => void;
    handleUpdate: (values: any) => void;
};

const FormDialog = ({
    open,
    handleClose,
    selectedDiscount,
    setDiscount,
    handleCreate,
    handleUpdate,
}: FormDialogProps) => {
    const { products } = useProduct();
    const [selectedDate, handleDateChange] = React.useState<Date | null>(
        new Date()
    );
    const [selectedDate2, handleDateChange2] = React.useState<Date | null>(
        new Date()
    );

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        rate: Yup.number().required("Rate is required"),
        startDate: Yup.date().required("Start Date is required"),
        endDate: Yup.date().required("End Date is required"),
        product: Yup.string().required("Product is required"),
    });

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {selectedDiscount ? "Update Discount" : "Create Discount"}
            </DialogTitle>
            <DialogContent>
                <Formik
                    initialValues={{
                        id: selectedDiscount?._id || "",
                        name: selectedDiscount?.name || "",
                        description: selectedDiscount?.description || "",
                        rate: selectedDiscount?.rate || "",
                        startDate: selectedDiscount?.startDate || "",
                        endDate: selectedDiscount?.endDate || "",
                        product: selectedDiscount?.product || "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        try {
                            if (selectedDiscount) {
                                handleUpdate(values);
                                resetForm();
                                handleClose();
                            }
                            if (!selectedDiscount) {
                                handleCreate(values);
                                resetForm();
                                handleClose();
                            }
                            setSubmitting(false);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    }
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        /* and other goodies */
                    }: any
                    ) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        id="description"
                                        label="Description"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.description && Boolean(errors.description)}
                                        helperText={touched.description && errors.description}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        id="rate"
                                        label="Rate"
                                        type="number"
                                        fullWidth
                                        variant="standard"
                                        value={values.rate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.rate && Boolean(errors.rate)}
                                        helperText={touched.rate && errors.rate}
                                    />
                                </Grid>
                                <Grid item xs={12} mb={2} mt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Product</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={values.product}
                                            label="Product"
                                            onChange={(e: any) => {
                                                setFieldValue(
                                                    "product", e.target.value
                                                )
                                            }
                                            }
                                            onBlur={handleBlur}
                                            error={touched.product && Boolean(errors.product)}
                                        >
                                            {products.product.map((item: any, index: number) => (
                                                <MenuItem key={index} value={item._id}>{item.name}</MenuItem>
                                            ))}

                                        </Select>
                                        {touched.product && errors.product ? (
                                            <FormHelperText error>{errors.product}</FormHelperText>
                                        ) : null}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker label="Start Date"
                                            value={selectedDate}
                                            onChange={(newValue) => {
                                                handleDateChange(newValue);
                                                values.startDate = moment(newValue).format("YYYY-MM-DD");
                                            }}
                                            renderInput={(props) => <TextField {...props} />}
                                        />

                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={6} mb={2}>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker label="End Date"
                                            value={selectedDate2}
                                            onChange={(newValue) => {
                                                handleDateChange2(newValue);
                                                values.endDate = moment(newValue).format("YYYY-MM-DD");
                                            }}
                                            renderInput={(props) => <TextField {...props} />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <DialogActions>
                                <ButtonGroup>
                                    <Button onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" color="primary" disabled={isSubmitting} variant="contained">
                                        {selectedDiscount ? "Update" : "Create"}
                                    </Button>
                                </ButtonGroup>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;