import useAppKeys from 'hooks/useAppKeys';
import React from 'react';
import { DelegateServerProvider } from 'hydraDemo/contexts/DelegateServerContext';
import { LitigationsProvider } from 'hydraDemo/contexts/LitigationsContext';
import Routes from './routes';

function App() {
  const { appKey } = useAppKeys();

  return (
    <React.Fragment key={appKey}>
      <DelegateServerProvider>
        <LitigationsProvider>
          <Routes />
        </LitigationsProvider>
      </DelegateServerProvider>
    </React.Fragment>
  );
}

export default App;
