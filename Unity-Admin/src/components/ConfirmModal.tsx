import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { color } from "@mui/system";
import { useTheme } from "@emotion/react";

type ConfirmModalProps = {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
};


const ConfirmModal = ({ open, handleClose, handleConfirm, title, description, confirmText, cancelText }: ConfirmModalProps) => {
    const theme: any = useTheme();
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent sx={{
                marginTop: "20px",
                textAlign: "center",
            }}>
                <DialogContentText sx={theme.palette.mode === "dark" ? { color: "white" } : { color: "black" }}>
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    {cancelText}
                </Button>
                <Button onClick={handleConfirm} variant="contained" color="error">
                    {confirmText}
                </Button>

            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;