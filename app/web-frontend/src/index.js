import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Gliroy',
      textTransform: 'none',
      fontSize: 16,
    },
  },
});

// react query client
const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById('root'),
);
