import { MeshProvider } from '@meshsdk/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    <MeshProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </MeshProvider>
  </QueryClientProvider>,
  document.getElementById('root'),
);
