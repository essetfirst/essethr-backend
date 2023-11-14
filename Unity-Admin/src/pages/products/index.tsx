import React, { useState } from "react";
import PageView from '../../components/PageView'
import { useProduct } from "../../hooks/useProduct";
import LoadingComponent from "../../components/LoadingComponent";
import ProductsView from "./ProductList";
import FormDialog from "./ProductModal";
import { AddCircleRounded } from "@mui/icons-material";
import ConfirmModal from "../../components/ConfirmModal";
import { Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import ProductsDetail from "./ProductDetail";
import CategoryFormDialog from "./CategoryModal";

const Products = () => {
    const { products, isLoading, error, deleteProductMutation, createProductMutation,createProductCategoryMutation ,updateProductMutation, product } = useProduct();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openCategoryConfirm, setOpenCategoryConfirm] = useState(false);

    const { id }: any = useParams();

    if (isLoading) return (
        <PageView
            title="Book"
            backPath="/app/dashboard"
            actions={[
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Category",
                    handler: () => {
                        setOpenCategory(true)
                    },
                    otherProps: {
                        sx: {
                            ml: "auto",
                            fontSize: "10px",
                        },
                        variant: "contained",
                    },
                },
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Book",
                    handler: () => {
                        setOpen(true)
                        setSelectedProduct(null)
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
            title="Books"
            backPath="/app/dashboard"
            actions={[
               {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Category",
                    handler: () => {
                        setOpenCategory(true)
                    },
                    otherProps: {
                        sx: {
                            ml: "auto",
                            fontSize: "10px",
                        },
                        variant: "contained",
                    },
                },
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Book",
                    handler: () => {
                        setOpen(true)
                        setSelectedProduct(null)
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
            <Alert severity="error">{error}</Alert>
        </PageView>
    )

    return (
        <PageView
            title="Books"
            backPath="/app/dashboard"
            actions={[
            {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Category",
                    handler: () => {
                        setOpenCategory(true)
                    },
                    otherProps: {
                        sx: {
                            ml: "auto",
                            fontSize: "10px",
                        },
                        variant: "contained",
                    },
                },
                {
                    icon: <AddCircleRounded style={{ fontSize: "1rem" }} />,
                    label: "Add Book",
                    handler: () => {
                        setOpen(true)
                        setSelectedProduct(null)
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

            <FormDialog
                open={open}
                handleClose={() => {
                    setOpen(false)
                    setSelectedProduct(null)
                }}
                handleAdd={createProductMutation}
                handleEdit={updateProductMutation}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
            /> 

            <CategoryFormDialog 
                open={openCategory}
                handleClose={() => {
                    setOpenCategory(false)
                }}
                handleAdd={createProductCategoryMutation}
            /> 

 
            <ConfirmModal
                open={openConfirm}
                handleClose={() => setOpenConfirm(false)}
                handleConfirm={() => {
                    deleteProductMutation(selectedProduct?.id)
                    setOpenConfirm(false)
                }}
                title="Delete Book"
                description="Are you sure you want to delete book?"
                confirmText="Delete"
                cancelText="Cancel"
            />

            <ProductsView
                products={products}
                setSelectedProduct={setSelectedProduct}
                setOpen={setOpen}
                setOpenConfirm={setOpenConfirm}
            />
        </PageView>
    )
}

export default Products

