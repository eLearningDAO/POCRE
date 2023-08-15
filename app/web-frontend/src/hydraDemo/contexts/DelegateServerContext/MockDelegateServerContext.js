import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';
import { serverStates } from './common';

const MockDelegateServerContext = createContext();

const mockHeadId = 'MOCK_HYDRA_HEAD_ID';

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
    console.log('New delegate server state', serverState);

    if (serverState === serverStates.connected) {
      queryState();
    }
  }, [serverState]);

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
    }, 2000);
  };

  const castVote = ({ juryMember, vote }) => {
    setTimeout(() => setServerState(serverStates.votingClosed), 5000);
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
      castVote,
      settle,
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
