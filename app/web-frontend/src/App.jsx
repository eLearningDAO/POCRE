import useAppKeys from 'hooks/useAppKeys';
import React from 'react';
import { DelegateServerProvider } from 'contexts/DelegateServerContext';
import Routes from './routes';

function App() {
  const { appKey } = useAppKeys();

  return (
    <React.Fragment key={appKey}>
      <DelegateServerProvider>
        <Routes />
      </DelegateServerProvider>
    </React.Fragment>
  );
}

export default App;
