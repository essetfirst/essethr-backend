import React from 'react'
import PageView from '../../components/PageView'
import ConfirmModal from "../../components/ConfirmModal";
import LoadingComponent from "../../components/LoadingComponent";
import { useCustomer } from '../../hooks/useCustomer';
import { AddCircleRounded } from "@mui/icons-material";

import CustomersView from "./CustomerList";
import FormDialog from "./CustomerModal";
import { Alert } from '@mui/material';



const Customers = () => {
    const { customers, isLoading, isError, deleteCustomerMutation, createCustomerMutation, updateCustomerMutation } = useCustomer();
    const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
    const [open, setOpen] = React.useState(false);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    if (isLoading) return (
        <PageView
            title="Users"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Users",
                    handler: () => {
                        setOpen(true)
                        setSelectedCustomer(null)
                    },
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

    if (isError) return (
        <PageView
            title="Users"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Users",
                    handler: () => {
                        setOpen(true)
                        setSelectedCustomer(null)
                    },
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
            <Alert severity="error">Something went wrong</Alert>
        </PageView>
    )

    return (
      <PageView
        title="Users"
        backPath="/app/dashboard"
        actions={[
          {
            icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
            label: "Add Users",
            handler: () => {
              setOpen(true);
              setSelectedCustomer(null);
            },
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
        <CustomersView
          customers={customers}
          setSelectedCustomer={setSelectedCustomer}
          setOpen={setOpen}
          setOpenConfirm={setOpenConfirm}
          handleUpdate={updateCustomerMutation}
        />
        <FormDialog
          open={open}
          handleClose={() => setOpen(false)}
          selectedCustomer={selectedCustomer}
          handleAdd={createCustomerMutation}
          handleUpdate={updateCustomerMutation}
          setCustomer={setSelectedCustomer}
        />
        <ConfirmModal
          open={openConfirm}
          handleClose={() => setOpenConfirm(false)}
          handleConfirm={() => {
            deleteCustomerMutation(selectedCustomer.id);
            setOpenConfirm(false);
          }}
          title="Delete User"
          description="Are you sure you want to delete this user?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </PageView>
    );
}


export default Customers
