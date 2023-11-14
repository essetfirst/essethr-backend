import  { createContext, useContext } from "react";
import { useSnackbar } from "notistack";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

type VariantType = "success" | "warning" | "error" | "info" | "default";

type NotificationContextType = {
    showNotification: (
        message: string,
        variant: VariantType,
        autoHideDuration?: number
    ) => void;
};

export const NotificationContext = createContext({} as NotificationContextType);

export const NotificationProvider = ({ children }: any) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showNotification = (
        message: string,
        variant: VariantType,
        autoHideDuration = 3000
    ) => {
        const action = (key: any) => (
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => closeSnackbar(key)}
            >
                <Close fontSize="small" />
            </IconButton>
        );

        enqueueSnackbar(message, {
            variant,
            action,
            autoHideDuration,
        });
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);

