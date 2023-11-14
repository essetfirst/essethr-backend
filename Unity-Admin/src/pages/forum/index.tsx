import React, { useState } from "react";
import PageView from "../../components/PageView";
import { useForum } from "../../hooks/useForum";
import LoadingComponent from "../../components/LoadingComponent";
import CategoriesView from "./CategoryList";
import FormDialog from "./CategoryModal";
import { AddCircleRounded } from "@mui/icons-material";
import ConfirmModal from "../../components/ConfirmModal";


const Forums = () => {
  const { forums, isLoading, error, deleteForumMutation, createForumMutation, updateForumMutation } = useForum();
  const [ selectedForum, setSelectedForum] = useState<any>(null);
  const [ open, setOpen] = useState(false);
  const [ openConfirm, setOpenConfirm] = useState(false);


  console.log(" Get All Forums ",forums)
  if (isLoading) return (
    <PageView
      title="Forums"
      backPath="/app/dashboard"
      actions={[
        {
          icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
          label: "Add Forum",
          handler: () => setOpen(true),
          otherProps: {
            sx: {
              ml: "auto",
              fontSize: "10px",
            },
            variant: "contained",
          },
        },
      ]}
    >
      <LoadingComponent />
    </PageView>
  )

  return (
    <PageView
      title="Forums"
      backPath="/app/dashboard"
      actions={[
        {
          icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
          label: "Add Forums",
          handler: () => setOpen(true),
          otherProps: {
            sx: {
              ml: "auto",
              fontSize: "10px",
            },
            variant: "contained",
          },
        },
      ]}
    >
      <FormDialog
        open={open}
        handleClose={() => {
          setOpen(false)
          setSelectedForum(null)
        }
        }
        handleAdd={createForumMutation}
        selectedForum={selectedForum}
        handleEdit={updateForumMutation}
        setSelectedForum={setSelectedForum}


      />

      <ConfirmModal
        open={openConfirm}
        handleClose={() => setOpenConfirm(false)}
        handleConfirm={() => {
          deleteForumMutation(selectedForum?.id);
          setOpenConfirm(false);
        }}
        title="Delete Forum"
        description="Are you sure you want to delete this forum?"
        confirmText="Delete"
        cancelText="Cancel"
      />


      <CategoriesView
        forums={forums}
        setSelectedForum={setSelectedForum}
        setOpen={setOpen}
        setOpenConfirm={setOpenConfirm}
      />

      
    </PageView>
  );
};



export default Forums;