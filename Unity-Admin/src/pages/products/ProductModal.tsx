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

type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
    handleAdd: (values: any) => void;
    handleEdit: (values: any) => void;
    selectedProduct?: any;
    setSelectedProduct?: any;
};

const FormDialog = ({
    open,
    handleClose,
    handleAdd,
    handleEdit,
    selectedProduct,
    setSelectedProduct,
}: FormDialogProps) => {
    const { categories } = useCategory();
    const initialValues = {
        id: selectedProduct ? selectedProduct.id : "",
        title: selectedProduct ? selectedProduct.title : "",
        topicId: selectedProduct ? selectedProduct.topicId : "",
        thumbnailUrl: selectedProduct ? selectedProduct.thumbnailUrl : "",
        file : selectedProduct ? selectedProduct.file:''
    };

    const validationSchema = Yup.object({
        title: Yup.string().required(" Title is Required"),
    });
 

    const [topicId, setTopicId] = useState('');
    const [allTopics,setTopics] = useState([{id:'',name:''}]);
    const [file, SetFile] = useState<File | null>(null);
    const [pdf, SetPdf] = useState<File | null >(null);
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
        SetFile(file)
    }
        const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
        SetPdf(file)
    }

    const handleParent = (event: React.ChangeEvent<{ value?: string | unknown}>) => {
     setTopicId(event.target.value as string);
    }
    const handleParentChange = (
          event: React.ChangeEvent<{ value?: string | unknown }>
        ) => {
          console.log(
            " Welcome Before  ",
            event.target.value,
            selectedProduct.topic
          );
          // const { _id, name, image, url } = selectedCategory.location
          const others = selectedProduct;
          var selectedParen = event.target.value;
          console.log(" Selected Topic ",selectedParen);
          var parent = allTopics.filter((item) => item.id == selectedParen)[0];
          console.log(" After  Change", parent, { ...others, topic: parent,topicId:parent.id });
          setSelectedProduct({ ...others, topic: parent });
    };


    useEffect(() => {
        async function fetchTopic() {
            console.log("Method Called ",url)
            const response = await fetch(`${url}topic/`, {
                headers: {
                "Content-Type": "application/json",
                "authtoken":`${token}`
            }});
            const data = await response.json();
            console.log(" Get All Topic : ", data?.result)
            setTopics(data?.result);
        }
        fetchTopic();
       }, []);


    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">
          {selectedProduct ? "Edit Book" : "Add Book"}
        </DialogTitle>
        <DialogContent sx={{ marginTop: "1rem" }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              console.log(
                " Data ",
                values,
                " Selected Product ",
                selectedProduct
              );
              if (selectedProduct) {
                values.file = pdf ? pdf : "";
                values.thumbnailUrl = file ? file : "";
                values.topicId = selectedProduct?.topic ? selectedProduct?.topic?.id : "";
                values.id = selectedProduct?.id
                console.log(" Edit Book values : ", values,file,pdf);
                setSubmitting(true);
                handleEdit({
                  ...values,
                });
                setSelectedProduct(null);
                setSubmitting(false);
                resetForm();
                handleClose();
              } else {
                values.file = pdf;
                values.thumbnailUrl = file;
                values.topicId = topicId;
                console.log(" Add Book values : ", values);
                setSubmitting(true);
                handleAdd({
                  ...values,
                });
                setSelectedProduct(null);
                setSubmitting(false);
                resetForm();
                handleClose();
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
              setFieldValue,
            }: any) => (
              <form onSubmit={handleSubmit}>
                {/* <Grid container spacing={2} mt={1}> */}

                <TextField
                  autoFocus
                  id="title"
                  label="Title"
                  type="text"
                  // fullWidth
                  style={{ width: 400 }} // set the width to 300px
                  variant="standard"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                  sx={{
                    marginBottom: 2,
                  }}
                />

                <br></br>

                {!selectedProduct && (
                  <FormControl margin="normal" sx={{ m: 1, minWidth: 200 }}>
                    <InputLabel> Select Category</InputLabel>
                    <Select
                      value={topicId}
                      id="topicId"
                      onChange={handleParent}
                      label="Select Topic"
                    >
                      {allTopics?.map((loc) => (
                        <MenuItem key={loc?.id} value={loc?.id}>
                          {loc?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {selectedProduct && (
                  <FormControl margin="normal" sx={{ m: 1, minWidth: 200 }}>
                    <InputLabel> Select Category</InputLabel>
                    <Select
                      value={
                        selectedProduct?.topic
                          ? selectedProduct?.topic?.id
                          : topicId
                      }
                      id="topicId"
                      onChange={
                        selectedProduct?.topic
                          ? handleParentChange
                          : handleParent
                      }
                      label="Select Topic"
                    >
                      {allTopics?.map((loc) => (
                        <MenuItem key={loc?.id} value={loc?.id}>
                          {loc?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <br></br>
                <br></br>
                <Button variant="contained" component="label">
                  {" "}
                  Upload PDF
                  <Input
                    type="file"
                    style={{ display: "none" }}
                    onChange={handlePdfSelect}
                  />
                </Button>

                <br></br>
                <br></br>
                <Button variant="contained" component="label">
                  {" "}
                  Upload Thumbnail
                  <Input
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                </Button>

                <div>
                  <div>
                    {file && (
                      <img
                        key={file?.name}
                        src={URL.createObjectURL(file)}
                        alt={file?.name}
                        width="200"
                      />
                    )}
                  </div>
                </div>

                <br></br>

                <Grid item xs={12} sm={12}>
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
                        ) : selectedProduct ? (
                          "Update"
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </ButtonGroup>
                  </DialogActions>
                </Grid>
                {/* </Grid> */}
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    );
};

export default FormDialog;
