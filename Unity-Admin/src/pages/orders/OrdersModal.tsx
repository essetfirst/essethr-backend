import React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import { Button, ButtonGroup } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { Grid } from "@mui/material";
import { useProduct } from "../../hooks/useProduct";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import  { useState,useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Input } from '@material-ui/core';

 
const url = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token") || "";


const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3,4,5, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};
const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

type FormDialogProps = {
  order: any;
  open: boolean;
  handleClose: () => void;
  handleAdd: (values: any) => void;
  handleEdit: (values: any) => void;
  selectedOrder?: any;
  setSelectedOrder?: any;
};

const FormDialog = ({
  open,
  handleClose,
  handleAdd,
  handleEdit,
  selectedOrder,
  setSelectedOrder,
}: FormDialogProps) => {
  const { products } = useProduct();
 const validationSchema = Yup.object({
        title: Yup.string().required(" Title is Required"),
        url:Yup.string().required(" Url is Required")
    });
 const initialValues = {
        // id: selectedOrder ? selectedOrder.id : "",
        title: selectedOrder ? selectedOrder.title : "",
        description: selectedOrder ? selectedOrder.description : "",
        topicId: selectedOrder ? selectedOrder.topicId : "",
        thumbnail: selectedOrder ? selectedOrder.thumbnail : "",
        url:selectedOrder ? selectedOrder.url : "",
 };


    const [content, setContent] = useState('');
    const [topicId, setTopicId] = useState('');
    const [allTopics,setTopics] = useState([{id:'',name:''}]);
    const [file, SetFile] = useState<File | null>(null);
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
        SetFile(file)
    }
    const handleParent = (event: React.ChangeEvent<{ value?: string | unknown}>) => {
     setTopicId(event.target.value as string);
    }

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


    
    const handleEditorChange = (value:string) => {
       setContent(value);
    }


console.log(" Selected Order ",selectedOrder)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
    >
      <DialogTitle id="form-dialog-title">
        {selectedOrder ?  "Edit Video":"Add Video" }
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log(" Selected  Video : ",selectedOrder)
            if (selectedOrder) {
              handleEdit(values);
              resetForm();
              handleClose();
            } else {
              values.thumbnail = file;
              values.description = content;
              console.log(" Value Added : ",values)
              handleAdd(values);
              resetForm();
              handleClose();
            }
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
              <TextField
                                autoFocus
                                id="title"
                                label="Title"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(touched.title && errors.title)}
                                helperText={touched.title && errors.title}
                                sx={{
                                    marginBottom:2
                                }}
                            />
                            <br></br>
              <h4>Description</h4>
              {!selectedOrder ?
                (<ReactQuill theme="snow" id="content" value={content} onChange={handleEditorChange} modules={modules} formats={formats} />) :
                (<ReactQuill theme="snow" id="content" value={values.description} onChange={handleChange} modules={modules} formats={formats} />
                ) 
}
                            <br></br>
                            <br></br>

            
            

              <br></br>
              <TextField
                                autoFocus
                                id="url"
                                label="Video URL"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={values.url}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(touched.url && errors.url)}
                                helperText={touched.url && errors.url}
                                sx={{
                                    marginBottom:2
                                }}
              />
              {values?.url && (
                <video controls>
                  <source src={values?.url} type="video/mp4" />
  Your browser does not support the video tag.
</video>

              )}
                            <br></br>
              <br></br>
                           <Button variant="contained" component="label">  Upload Thumbnail
                                <Input type="file"  style={{ display: 'none' }}  inputProps={{ required:true }} onChange={handleFileSelect}   />
                            </Button>

                    

                <div >
      <div>
                                    {file &&
                                        (<img key={file?.name} src={URL.createObjectURL(file)} alt={file?.name} width="200" />)}
      </div>
      
    </div>
                            
                            <br></br>
              <DialogActions>
                <ButtonGroup>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {selectedOrder ? "Update" : "Create"}
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
