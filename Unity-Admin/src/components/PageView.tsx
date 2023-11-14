import React, { useRef } from "react";
import { Transition, SwitchTransition } from "react-transition-group";
import Page from "./Page";
import { ButtonGroup, Button, DialogActions, TextField, IconButton, Box } from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/system";
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';


type Props = {
  children: React.ReactNode;
  title: string;
  icon?: any;
  onBack?: () => void;
  backPath?: string;
  actions?: any;
};

const duration = 300;

const defaultStyle = {
  animation: "fade 0.3s ease-in-out",
  transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
  opacity: 0,
};

const transitionStyles: any = {
  entering: { opacity: 0, transform: "translateX(10px)" },
  entered: { opacity: 1, transform: "translateX(0px)" },
  exiting: { opacity: 0, transform: "translateX(10px)" },
  exited: { opacity: 0, transform: "translateX(10px)" },
};


const PageView = ({ children, title, icon, onBack, backPath, actions, ...rest }: Props) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  return (
    <Page title={title}>
      <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <ButtonGroup
          variant="text"
          color="inherit"
          aria-label="text primary button group"
        >
          <Button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (backPath) {
                navigate(-1);
              }
            }}
          >
            <ArrowBackIos />
          </Button>
          <Button>{title}</Button>
        </ButtonGroup>
        {actions &&
          actions.map(({ icon, label, handler, otherProps }: any) => (
            <Box sx={{ '& > :not(style)': { m: 1 } }} key={label}>

              <Button
                key={label}
                onClick={handler}
                startIcon={icon}
                {...otherProps}
              >
                {label}
              </Button>
            </Box>
          ))}
      </Container>

      <SwitchTransition mode="out-in">
        <Transition
          key={title}
          timeout={duration}
          addEndListener={(node, done) => {
            node.addEventListener("transitionend", done, false);
          }}
          appear
          unmountOnExit
        >
          {(state) => (
            <div style={{ ...defaultStyle, ...transitionStyles[state] }}>
              {children}
            </div>
          )}
        </Transition>
      </SwitchTransition>
    </Page>
  );
};

export default PageView;
