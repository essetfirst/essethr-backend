import React from 'react';
import PageView from '../../components/PageView';
import ConfirmModal from "../../components/ConfirmModal";
import LoadingComponent from "../../components/LoadingComponent";
import { useFarmer } from '../../hooks/useFarmer';
import { AddCircleRounded } from "@mui/icons-material";
import CustomersView from "./CustomerList";
import FormDialog from "./CustomerModal";
import { Alert } from '@mui/material';

const Customers = () => {
    const { customers, isLoading, error, deleteTankMutation,deleteCustomerMutation, createCustomerMutation, updateCustomerMutation } = useFarmer();
    const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
    const [open, setOpen] = React.useState(false);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    const [openConfirm2, setOpenConfirm2] = React.useState(false);
    if (isLoading) return (
        <PageView
            title="Farmers"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Farmers",
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

    if (error) return (
        <PageView
            title="Farmers"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Farmers",
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
        title="Farmers"
        backPath="/app/dashboard"
        actions={[
          {
            icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
            label: "Add Farmers",
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
          setOpenConfirm2={setOpenConfirm2}
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
            deleteCustomerMutation(selectedCustomer?.id);
            setOpenConfirm(false);
          }}
          title="Delete Farmer"
          description="Are you sure you want to delete this farmer?"
          confirmText="Delete"
          cancelText="Cancel"
        />
        <ConfirmModal
          open={openConfirm2}
          handleClose={() => setOpenConfirm2(false)}
          handleConfirm={() => {
            deleteTankMutation(selectedCustomer?.id);
            setOpenConfirm2(false);
          }}
          title="Delete Tank"
          description="Are you sure you want to delete this Tank?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </PageView>
    );
}


export default Customers
