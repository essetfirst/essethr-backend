import { createTheme } from "@mui/material/styles";
import { colors } from "@mui/material";
import { typography } from "./typography";

const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#eef2f6",
            paper: colors.common.white,
        },
        primary: {
            main: "#1e88e5",
            contrastText: "#fff",
        },

        secondary: {
            main: "#FF9800",
            contrastText: "#000",
        },
        text: {
            primary: colors.blueGrey[900],
            secondary: colors.blueGrey[600],
        },
    },
    typography,
    shape: {
        borderRadius: 8,
    },

    components: {
        MuiDialog: {
            styleOverrides: {
                root: {
                    backdropFilter: "blur(4px)",
                },
            },
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#121212",
            paper: "#1c1c1c",
        },
        primary: {
            dark: "#1c1c1c",
            main: "#fff",
            contrastText: "#fff",
        },
        secondary: {
            main: "#FF9800",
            contrastText: "#000",
        },
        text: {
            primary: "#fff",
            secondary: colors.blueGrey[600],
        },
    },
    typography,
    shape: {
        borderRadius: 8,
    },

    components: {
        MuiDialog: {
            styleOverrides: {
                root: {
                    backdropFilter: "blur(4px)",
                },

                paper: {
                    backgroundColor: "#121212",
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    color: "#fff",
                },

                contained: {
                    backgroundColor: "#1c4b7a",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#1c4b7a",
                        color: "#fff",
                    },
                },
            },
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "#e4e4e4",
                },
            },
        },


        MuiInputBase: {
            styleOverrides: {
                root: {
                    "& $notchedOutline": {
                        borderColor: colors.blueGrey[400],
                    },
                    "&:hover:not($disabled):not($focused):not($error) $notchedOutline": {
                        borderColor: colors.blueGrey[400],
                        "@media (hover: none)": {
                            borderColor: colors.blueGrey[400],
                        },
                    },
                },
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#e4e4e4",
                    "&$focused": {
                        color: "#e4e4e4",
                    },
                },

                outlined: {
                    color: "#e4e4e4",
                    "&$focused": {
                        color: "#e4e4e4",
                    },
                },

                standard: {
                    color: "#e4e4e4",
                    "&$disabled": {
                        color: "#e4e4e4",
                    },

                    "&$error": {
                        color: "#e4e4e4",
                    },

                    "&$focused": {
                        color: "#e4e4e4",
                        backgroundColor: "#e4e4e4",

                    },
                },


                filled: {
                    color: "#e4e4e4",
                    "&$focused": {
                        color: "#e4e4e4",
                    },
                },

                shrink: {
                    color: "#e4e4e4",
                    "&$focused": {
                        color: "#e4e4e4",
                    },
                },
            },
        },


        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& $notchedOutline": {
                        borderColor: "#e4e4e4",
                    },
                    "&:hover:not($disabled):not($focused):not($error) $notchedOutline": {
                        borderColor: "#e4e4e4",
                        "@media (hover: none)": {
                            borderColor: "#e4e4e4",
                        }
                    }
                }
            }
        },



        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "#1c1c1c",
                },
            },
        },
    },
});


export { lightTheme, darkTheme };
