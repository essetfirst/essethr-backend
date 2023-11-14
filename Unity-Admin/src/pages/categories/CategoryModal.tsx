import  { useState,useEffect } from 'react';
import TextField from "@mui/material/TextField";
import MenuItem from '@mui/material/MenuItem';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";
import { ButtonGroup, Button } from "@mui/material";
import { ThreeDots } from "react-loader-spinner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from "react-dropzone";
// import styles from "../styles/Home.module.css";
import { useCallback, useMemo } from "react";
import axios from "axios";
import { Select,InputLabel,Input } from '@material-ui/core';
import FormControl from '@mui/material/FormControl';

const durationTypeList = ["days","hours","months","years"]
const url = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token") || "";

const modules = {
    toolbar:[
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
//   [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction
        ['link', 'image'],

  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': ['red','green','white','black'] }, { 'background': ['white', 'black'] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
],
};
const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];
type FormDialogProps = {
    open: boolean;
    handleClose: () => void;
    handleAdd: (values: any) => void;
    handleEdit: (values: any) => void;
    selectedCategory?: any;
    setSelectedCategory?: any;
};
interface Option {
      [key: string]: string | string[] | Option[] | undefined;
}

const FormDialog = ({
    open,
    handleClose,
    handleAdd,
    handleEdit,
    selectedCategory,
    setSelectedCategory,
}: FormDialogProps) => {
    const initialValues = {
        id: selectedCategory ? selectedCategory.id : "",
        title: selectedCategory ? selectedCategory.title : "",
        description: selectedCategory ? selectedCategory.description : "",
        thumbnail: selectedCategory ? selectedCategory.thumbnail : "",
    };

    const validationSchema = Yup.object({
        title: Yup.string().required(" Title is Required"),
    });
 

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
    const handleOverviewChange = (value: string) => {
      console.log(" Value  Description ",value);
      const { description, ...others } = selectedCategory;
      setSelectedCategory({ ...others, description: value });
      console.log(" Selected Category ",selectedCategory);
    };



    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" sx={{}}>
          {selectedCategory ? "Edit News" : "Add News"}
        </DialogTitle>
        <DialogContent sx={{ marginTop: "2rem" }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              if (selectedCategory) {
                console.log(" Value To BE Edit : ", values, selectedCategory);
                console.log(content, file);
                values.thumbnail = file ? file : "";
                if (selectedCategory?.description) {
                    values.description = selectedCategory.description;
                } else {
                    values.description = content ? content : "";
                }
                handleEdit(values);
                setSelectedCategory(null);
                SetFile(null);
                setContent("");
                console.log(" Value To BE Edit : ", values);
              } else {
                values.thumbnail = file;
                values.description = content;
                handleAdd(values);
                SetFile(null);
                setContent("");
              }
              resetForm();
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
                    marginBottom: 2,
                  }}
                />
                <br></br>
                <h4>Description</h4>
                {selectedCategory ? (
                  <ReactQuill
                    theme="snow"
                    id="content"
                    value={values?.description}
                    onChange={handleOverviewChange}
                    modules={modules}
                    formats={formats}
                  />
                ) : (
                  <ReactQuill
                    theme="snow"
                    id="content"
                    value={content}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                  />
                )}
                <br></br>
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
                <DialogActions>
                  <ButtonGroup>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ThreeDots color="#fff" height={20} width={20} />
                      ) : selectedCategory ? (
                        "Edit"
                      ) : (
                        "Add"
                      )}
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