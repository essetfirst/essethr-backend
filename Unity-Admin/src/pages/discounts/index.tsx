import React from 'react'
import PageView from '../../components/PageView'
import { AddCircleRounded } from "@mui/icons-material";
import { useDiscount } from "../../hooks/useDiscount";
import LoadingComponent from "../../components/LoadingComponent";
import FormDialog from "./DiscountModal";
import ConfirmModal from "../../components/ConfirmModal";
import { Alert, Container } from "@mui/material";
import DiscountView from './DiscountList';


const Discounts = () => {
    const { discounts, isLoading, error, deleteDiscountMutation, createDiscountMutation, updateDiscountMutation } = useDiscount();
    const [selectedDiscount, setSelectedDiscount] = React.useState<any>(null);
    const [open, setOpen] = React.useState(false);
    const [openConfirm, setOpenConfirm] = React.useState(false);

    if (isLoading) return (
        <PageView
            title="Discounts"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Discount",
                    handler: () => {
                        setOpen(true)
                        setSelectedDiscount(null)
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
            title="Discounts"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Discount",
                    handler: () => {
                        setOpen(true)
                        setSelectedDiscount(null)
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
            <Alert severity="error">Error: {error.message}</Alert>
        </PageView>
    )

    return (
        <PageView
            title="Discounts"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Discount",
                    handler: () => {
                        setOpen(true)
                        setSelectedDiscount(null)
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
            {(discounts.discount.length === 0) &&
                <Container maxWidth="sm">
                    <Alert severity="info">No discounts found</Alert>
                </Container>
            }
            
            <FormDialog
                open={open}
                handleClose={() => setOpen(false)}
                selectedDiscount={selectedDiscount}
                setDiscount={setSelectedDiscount}
                handleCreate={createDiscountMutation}
                handleUpdate={updateDiscountMutation}
            />
            <ConfirmModal
                open={openConfirm}
                handleClose={() => setOpenConfirm(false)}
                handleConfirm={() => {
                    deleteDiscountMutation(selectedDiscount._id)
                    setOpenConfirm(false)
                }}

                title="Delete Discount"
                description="Are you sure you want to delete this discount?"
                confirmText="Delete"
                cancelText="Cancel"
            />

            <DiscountView
                discounts={discounts}
                setSelectedDiscount={setSelectedDiscount}
                selectedDiscount={selectedDiscount}
                setOpen={setOpen}
                setOpenConfirm={setOpenConfirm}
            />
        </PageView>
    )
}

export default Discounts


