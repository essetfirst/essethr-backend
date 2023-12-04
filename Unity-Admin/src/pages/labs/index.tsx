import React from 'react';
import PageView from '../../components/PageView';
import ConfirmModal from "../../components/ConfirmModal";
import LoadingComponent from "../../components/LoadingComponent";
import { useLab } from '../../hooks/useLab';
import { AddCircleRounded } from "@mui/icons-material";
import CustomersView from "./CustomerList";
import FormDialog from "./CustomerModal";
import { Alert } from '@mui/material';

const Customers = () => {
    const { labs,isLoading,error, deleteLabAssistantMutation,updateLabAssistantMutation } = useLab();
    const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
    const [open, setOpen] = React.useState(false);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    console.log(labs," Lab Assistants ",isLoading,error);
    // if (isLoading) return (
    //   <PageView
    //     title="Lab Assistants"
    //     backPath="/app/dashboard"
    //     actions={[
    //       {
    //         handler: () => {
    //           setOpen(true);
    //           setSelectedCustomer(null);
    //         },
    //       },
    //     ]}
    //   >
    //     <LoadingComponent />
    //   </PageView>
    // );

    // if (error) return (
    //   <PageView
    //     title="Lab Assistant"
    //     backPath="/app/dashboard"
    //     actions={[
    //       {
    //         // icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
    //         // label: "Add Farmers",
    //         handler: () => {
    //           setOpen(true);
    //           setSelectedCustomer(null);
    //         },
    //         // otherProps: {
    //         //   sx: {
    //         //     ml: "auto",
    //         //     fontSize: "10px",
    //         //   },
    //         //   variant: "contained",
    //         // },
    //       },
    //     ]}
    //   >
    //     <Alert severity="error">Something went wrong</Alert>
    //   </PageView>
    // );

    return (
      <PageView
        title="Lab Assistants"
        backPath="/app/dashboard"
        actions={[
          {
            handler: () => {
              setOpen(true);
              setSelectedCustomer(null);
            },
          },
        ]}
      >
        <CustomersView
          setSelectedCustomer={setSelectedCustomer}
          setOpen={setOpen}
          handleUpdate={updateLabAssistantMutation}
          setOpenConfirm={setOpenConfirm}
        />

        {/* <FormDialog
          open={open}
          handleClose={() => setOpen(false)}
          selectedCustomer={selectedCustomer}
          handleAdd={createCustomerMutation}
          handleUpdate={updateCustomerMutation}
          setCustomer={setSelectedCustomer}
        /> */}

        <ConfirmModal
          open={openConfirm}
          handleClose={() => setOpenConfirm(false)}
          handleConfirm={() => {
            deleteLabAssistantMutation(selectedCustomer?.id);
            setOpenConfirm(false);
          }}
          title="Delete Lab Assistant"
          description="Are you sure you want to delete this assistant?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </PageView>
    );
}


export default Customers
