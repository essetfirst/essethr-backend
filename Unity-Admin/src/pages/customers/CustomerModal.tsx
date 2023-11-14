import React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, ButtonGroup, MenuItem } from "@mui/material";


const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
  pin: Yup.string().min(4).required("Pin is required"),
  qualification: Yup.string().required("Qualification is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  area: Yup.string().required("Area is required"),
  labName: Yup.string().required("Lab Name is required"),
  role: Yup.string().required("Role is required"),
});


type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
    handleAdd: (values: any) => void;
    handleUpdate: (values: any) => void;
    selectedCustomer: any;
    setCustomer: any;
}



const FormDialog = (props: FormDialogProps) => {
    const { open, handleClose, handleAdd, handleUpdate, selectedCustomer, setCustomer } = props;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {selectedCustomer ? "Update User" : "Add User"}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              id: selectedCustomer?.id || "",
              name: selectedCustomer?.name || "",
              phoneNumber: selectedCustomer?.phoneNumber || "",
              qualification: selectedCustomer?.qualification || "",
              pin: selectedCustomer?.pin || "",
              state: selectedCustomer?.state || "",
              district: selectedCustomer?.district || "",
              area: selectedCustomer?.area || "",
              labName: selectedCustomer?.labName || "",
              role: selectedCustomer?.role || "",
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
                  label="Full Name"
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
                  id="pin"
                  name="pin"
                  label="Pin"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={values.pin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.pin && Boolean(errors.pin)}
                  helperText={touched.pin && errors.pin}
                />
                <TextField
                  margin="dense"
                  id="qualification"
                  name="qualification"
                  label="Qualification"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={values.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.qualification && Boolean(errors.qualification)}
                  helperText={touched.qualification && errors.qualification}
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
                />
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
                  id="labName"
                  name="labName"
                  label="Lab Name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={values.labName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.labName && Boolean(errors.labName)}
                  helperText={touched.labName && errors.labName}
                />
                {/* paymentMethod will be a dropdown  */}
                <TextField
                  margin="dense"
                  id="role"
                  name="role"
                  label="Role"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                  select
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
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
