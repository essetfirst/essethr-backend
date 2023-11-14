import React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import { Button, ButtonGroup, CircularProgress } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { Grid,Typography } from "@mui/material";
import { useProduct } from "../../hooks/useProduct";
import { useCustomer } from "../../hooks/useCustomer";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState, useEffect } from 'react';
// import { SelectChangeEvent } from '@mui/material/Select';

const ValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
});
const api = import.meta.env.VITE_API_URL; 
const url = `${api}market`; 
const token = localStorage.getItem("token") || "";

type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
    handleAdd: (data: any) => void;
    handleUpdate: (data: any) => void;
    selectedSales: any;
    setSelectedSales: any;
};

const FormDialog = ({
    open,
    handleClose,
    handleAdd,
    handleUpdate,
    selectedSales,
    setSelectedSales,
}: FormDialogProps) => {
    const {
        products,
        isLoading: isLoadingProduct,
        error: errorProduct,
    } = useProduct();
    const {
        customers,
        isLoading: isLoadingCustomer,
        error: errorCustomer,
    } = useCustomer();
    const [allproblems, setAllProblem] = useState([{ id: '', name: '', sector: { name: '' } }]);
    const [selectedSector, setSelectedSector] = useState<number | ''>('');

    const handleSectorChange = (event: SelectChangeEvent<number>) => {
          const value = event.target.value;
        setSelectedSector(value === '' ? '' : Number(value));
    };
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setSelectedImages(filesArray);
      }
  };



   useEffect(() => {
        async function fetchProblems() {
            console.log("Method Called ", url)
            const response = await fetch(`${url}/zone/all`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            console.log(" Get All Market : ", data?.result)
            setAllProblem(data?.result);
        }
        fetchProblems();
    }, []);
    console.log(" Selected Sales ",selectedSales)
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <Formik
            initialValues={{
              id: selectedSales?.id || "",
              name: selectedSales?.name || "",
              marketId: selectedSales?.marketId || "",
            }}
            validationSchema={ValidationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              setSubmitting(true);
              if (selectedSales) {
                handleUpdate(values);
              } else {
                values.marketId = selectedSector;
                console.log(" Values ", values);
                handleAdd(values);
              }
              handleClose();
              resetForm();
              setSelectedSector("");
              setSubmitting(false);
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
                <DialogTitle id="form-dialog-title">
                  {selectedSales ? "Update Zone" : "Add Zone"}
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
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
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    
                    {!selectedSales && 
                    <Grid item xs={12}>
                      <InputLabel>Select Market</InputLabel>
                      <Select
                        value={selectedSector}
                        onChange={handleSectorChange}
                        >
                        <MenuItem value="1">Fish</MenuItem>
                        <MenuItem value="2">Shrimp</MenuItem>
                      </Select>
                    </Grid>
                      }
                    <Grid item xs={12}></Grid>
                  </Grid>
                  <DialogActions>
                    <ButtonGroup>
                      <Button onClick={handleClose} color="primary">
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" variant="contained">
                        {isSubmitting ? (
                          <CircularProgress size={24} />
                        ) : selectedSales ? (
                          "Update"
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </ButtonGroup>
                  </DialogActions>
                </DialogContent>
              </form>
            )}
          </Formik>
        </Dialog>
      </div>
    );
};

export default FormDialog;
