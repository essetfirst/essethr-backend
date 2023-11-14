import React  from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, ButtonGroup, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useState } from 'react';

const validationSchema = Yup.object().shape({
  name: Yup.string().required(" Name is required"),
  phoneNumber: Yup.string().min(10).required(" Phone Number is required"),
  area: Yup.string().min(4).required(" Area is required"),
  cultureType: Yup.string().required(" Culture Type is required"),
  state: Yup.string().required(" State is required"),
  district: Yup.string().required(" District is required"),
});

var allState = 
  [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Mizoram",
    "Meghalaya",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Sikkim",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "West Bengal",
    "Una",
    "Bagalkat",
    "North Delhi",
    "East Delhi",
    "West Delhi",
    "South Delhi",
    "South West Delhi",
    "New Delhi",
  ];
var allDistrict = [
  "Mumbai",
  "Delhi",
  "Kolkata",
  "Chennai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Ahmedabad",
  "Chandigarh",
  "Bhopal",
  "Kanpur",
  "Nagpur",
  "Patna",
  "Kochi",
  "Indore",
  "Thiruvananthapuram",
  "Coimbatore",
  "Guwahati",
  "Varanasi",
  "Visakhapatnam",
  "Agra",
  "Nashik",
  "Amritsar",
];


type FormDialogProps = {
  open: boolean;
  handleClose: () => void;
  handleAdd: (values: any) => void;
  handleUpdate: (values: any) => void;
  selectedCustomer: any;
  setCustomer: any;
};

const FormDialog = (props: FormDialogProps) => {
  const {
    open,
    handleClose,
    handleAdd,
    handleUpdate,
    selectedCustomer,
    setCustomer,
  } = props;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {selectedCustomer ? "Update Farmer" : "Add Farmer"}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            id: selectedCustomer?.id || "",
            name: selectedCustomer?.name || "",
            phoneNumber: selectedCustomer?.phoneNumber || "",
            area: selectedCustomer?.area || "",
            cultureType: selectedCustomer?.cultureType || "",
            state: selectedCustomer?.state || "",
            district: selectedCustomer?.district || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            if (selectedCustomer) {
              handleUpdate(values);
            } else {
              console.log(" Values ", values);
              handleAdd(values);
            }
            setSubmitting(false);
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
          }: /* and other goodies */
          any) => (
            <form onSubmit={handleSubmit}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="name"
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
              <TextField
                margin="dense"
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                type="text"
                fullWidth
                variant="standard"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />
              <TextField
                margin="dense"
                id="state"
                name="state"
                label="State"
                type="text"
                fullWidth
                variant="standard"
                value={values.state}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.state && Boolean(errors.state)}
                helperText={touched.state && errors.state}
                select
              >
                {allState.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                id="area"
                name="area"
                label="Area"
                type="text"
                fullWidth
                variant="standard"
                value={values.area}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.area && Boolean(errors.area)}
                helperText={touched.area && errors.area}
              />
              <TextField
                margin="dense"
                id="district"
                name="district"
                label="District"
                type="text"
                fullWidth
                variant="standard"
                value={values.district}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.district && Boolean(errors.district)}
                helperText={touched.district && errors.district}
                select
              >
                {allDistrict.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                id="cultureType"
                name="cultureType"
                label="Culture Type"
                type="text"
                fullWidth
                variant="standard"
                value={values.cultureType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.cultureType && Boolean(errors.cultureType)}
                helperText={touched.cultureType && errors.cultureType}
                select
              >
                <MenuItem value="Fish">Fish</MenuItem>
                <MenuItem value="Shrimp">Shrimp</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
                <MenuItem value="Poly">Poly</MenuItem>
              </TextField>
              <DialogActions>
                <ButtonGroup>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                  >
                    {selectedCustomer ? "Update" : "Add"}
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
