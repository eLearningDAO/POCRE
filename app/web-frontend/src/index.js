import { createTheme, ThemeProvider } from '@mui/material/styles';
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

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root'),
);
