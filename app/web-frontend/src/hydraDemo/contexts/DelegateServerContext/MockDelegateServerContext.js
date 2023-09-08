import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';
import { serverStates } from './common';

const MockDelegateServerContext = createContext();

const mockHeadId = '5aa21c47a57d105d4eed6dc9c136ec5a8fdf71688ef36ba5762e8bc2';

function MockDelegateServerProvider({ children }) {
  const [serverState, setServerState] = useState(serverStates.disconnected);
  const [headId, setHeadId] = useState(null);
  const [terms, setTerms] = useState(null);

  const queryState = () => {
    if (serverState === serverStates.connected) {
      setTimeout(() => {
        setServerState(serverStates.awaitingCommits);
        setHeadId(mockHeadId);
      }, 300);
    }
  };

  useEffect(() => {
    setTimeout(() => setServerState(serverStates.connected), 300);
  }, []);

  useEffect(() => {
    if (serverState === serverStates.connected) {
      console.log('Connected to websocket server');
      queryState();
    }
    console.log(`Delegate server state: ${serverState}`);
  }, [serverState]);

  useEffect(() => {
    if (headId) console.log('Hydra head ID:', headId);
  }, [headId]);

  const createDispute = ({
    claimFor,
    claimer,
    hydraHeadId,
    jury,
    voteInterval,
    debugCheckSignatures = false,
  }) => {
    setTimeout(() => setServerState(serverStates.bidCommitted), 1000);
    setTimeout(() => {
      setTerms({
        claimFor,
        claimer,
        hydraHeadId,
        jury,
        voteInterval,
        debugCheckSignatures,
      });
      setServerState(serverStates.votingOpen);
    }, 5000);
  };

  const settle = () => {
    setTimeout(() => setServerState(serverStates.awaitingCommits), 1000);
  };

  const context = useMemo(
    () => ({
      state: serverState,
      headId,
      terms,
      createDispute,
      castVote: ({ juryMember, vote }) => {
        console.log('vote casted', { juryMember, vote });
      },
      settleTimeout: settle,
      settleAllVotesCasted: settle,
    }),
    [serverState, headId],
  );

  return (
    <MockDelegateServerContext.Provider value={context}>
      {children}
    </MockDelegateServerContext.Provider>
  );
}

const useMockDelegateServer = () => useContext(MockDelegateServerContext);

export { MockDelegateServerProvider, useMockDelegateServer };
