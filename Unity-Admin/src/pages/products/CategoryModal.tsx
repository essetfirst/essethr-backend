import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";
import { ButtonGroup, Button } from "@mui/material";
import { ThreeDots } from "react-loader-spinner";
import { useCategory } from "../../hooks/useCategory";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
// import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from "@mui/material/FormHelperText";
import { Grid } from "@mui/material";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Select,InputLabel,Input } from '@material-ui/core';
const url = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token") || "";
import axios from 'axios';
type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
  handleAdd: (values: any) => void;
};

const createCategory = async (dataValue:{}) => {
    try {
    console.log(" Create Category ",`${url}/`,dataValue)
      const response = await axios.post(`${url}/`, dataValue);
      const data = response.data;
      console.log(" Result ",data,data?.result)
      // setMessage(data.message);

      if (data?.message == "OK") {
        // setCategories(data?.result);
        // setMessage("Category Created")
        // setCategoryName('')

      }
       if (data?.message != "OK") {
        // setMessage("Category Already Exist")
      }
    } catch (error) {
    //   setMessage("Category Already Exist");
    }
  };
const CategoryFormDialog = ({
    open,
    handleClose,
    handleAdd,
}: FormDialogProps) => {
    const initialValues = {
        // id: selectedProduct ? selectedProduct.id : "",
        name: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("Required"),
    });
 


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle
                id="form-dialog-title"
            >
          { "Add Category"}
        </DialogTitle>
            <DialogContent sx={{ marginTop: "1rem" }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        
                            console.log(" values :",values)
                           setSubmitting(true);
                        // const result = await createCategory(values)
                            handleAdd({
                                ...values
                            });
                            setSubmitting(false);
                            resetForm();
                            handleClose();
                        
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
                        setFieldValue,
                    }: any) => (
                        <form onSubmit={handleSubmit}>
                               
                            <TextField
                                autoFocus
                                id="name"
                                label="name"
                                type="text"
                                // fullWidth
                                style={{ width: 400 }} // set the width to 300px
                                variant="standard"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(touched.name && errors.name)}
                                helperText={touched.name && errors.name}
                                sx={{
                                    marginBottom:2
                                }}
                            />
                            
                            <br></br>
                            
                            <br></br>

                                {/* <Grid item xs={12} sm={12}> */}
                                    <DialogActions>
                                        <ButtonGroup>
                                            <Button onClick={handleClose}>Cancel</Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                variant="contained"
                                            >
                                                {isSubmitting ? (
                                                    <ThreeDots color="#fff" height={20} width={20} />
                                                ) :" Add"}
                                            </Button>
                                        </ButtonGroup>
                                    </DialogActions>
                                {/* </Grid> */}
                            {/* </Grid> */}
                        </form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryFormDialog;
