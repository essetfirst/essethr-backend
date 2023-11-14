import React from "react";
import {
  ArrowDropDown,
  RefreshRounded,
  WarningRounded,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import { Typography, Button, Container, Box } from "@mui/material";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
            sx={{ height: "70vh" }}
          >
            <Grid item>
              <WarningRounded sx={{ fontSize: 200, color: "primary.main" }} />
            </Grid>
            <Grid item mb={5}>
              <Typography
                variant="h2"
                sx={{ fontFamily: "Montserrat" }}
              >
                <span
                  style={{
                    color: "#f44336",
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: "Montserrat",
                  }}
                >
                  Oops!{" "}
                </span>
                Something went wrong
              </Typography>
            </Grid>
            <Grid item mt={2} mb={2} sx={{ fontSize: 12 , overflow: "auto"}}>
              <details style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}>
                <strong style={{ color: "#f44336" }}>
                  {this.state?.error && this.state?.error.toString()}
                </strong>
                <br />
                {this.state.errorInfo?.componentStack}
              </details>
            </Grid>
              <Button variant="contained" color="primary" 
                sx={{fontSize: 10, fontWeight: 700, fontFamily: "Montserrat"}}
                onClick={() => {
                  window.location.reload();
              }}>
                <RefreshRounded sx={{
                    fontSize: 15,
                    mr: 1,
                }} /> Reload
              </Button>
          </Grid>
        </Container>
      );
    }
    return this.props.children;
  }
}
