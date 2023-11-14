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
    open: boolean;
    handleClose: () => void;
    handleAdd: (values: any) => void;
    handleEdit: (values: any) => void;
    selectedForum?: any;
    setSelectedForum?: any;
};
interface Option {
      [key: string]: string | string[] | Option[] | undefined;
}

const FormDialog = ({
    open,
    handleClose,
    handleAdd,
    handleEdit,
    selectedForum,
    setSelectedForum,
}: FormDialogProps) => {
    const initialValues = {
        title: selectedForum ? selectedForum?.title : "",
        description: selectedForum ? selectedForum?.description : "",
        topicId: selectedForum ? selectedForum?.topicId : "",
    };

    const validationSchema = Yup.object({
        title: Yup.string().required("Required"),
        description: Yup.string().required("Required"),
        topicId: Yup.string().required("Required")
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
            console.log(" Get All Topic ",url)
            const response = await fetch(`${url}forum/topic`, {
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



    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title" sx={{
            }}>
                {selectedForum ? "Edit Forum" : "Add Forum"}
            </DialogTitle>
            <DialogContent sx={{ marginTop: "2rem" }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        if (selectedForum) {
                            handleEdit(values);
                            setSelectedForum(null);
                        } else {
                            values.topicId = topicId
                            values.description = content;
                            console.log(" Value Added : ",values)
                            handleAdd(values);
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
                                    marginBottom:2
                                }}
                            />
                            <br></br>
                            <h4>Description</h4>
                            <ReactQuill theme="snow"  id="content" value={content} onChange={handleEditorChange}  modules={modules} formats={formats} />
                            <br></br>
                            <br></br>

            
            <FormControl margin='normal'  sx={{ m: 1, minWidth: 200 }}>
                 <InputLabel> Select Category</InputLabel>
                 <Select value={topicId} id="topicId" onChange={handleParent} label="Select Topic">
                   {allTopics?.map((loc) => (
                    <MenuItem key={loc?.id} value={loc?.id}>{loc?.name}</MenuItem>
                    ))}
                </Select>
            </FormControl> 
           

                            <br></br>
                           
                            
                            <br></br>
                            <DialogActions>
                                <ButtonGroup>
                                    <Button onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ThreeDots
                                                color="#fff"
                                                height={20}
                                                width={20}
                                            />
                                        ) : selectedForum ? (
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