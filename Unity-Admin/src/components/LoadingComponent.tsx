import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Container } from '@mui/system';

export default function LoadingComponent() {
  return (
    <Container maxWidth="lg">
      <LinearProgress color="info" />
    </Container>
  );
}