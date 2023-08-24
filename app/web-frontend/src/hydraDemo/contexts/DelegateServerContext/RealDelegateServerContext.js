import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';
import { DELEGATE_SERVER_URL } from 'config';
import { serverStates } from './common';

const RealDelegateServerContext = createContext();

function RealDelegateServerProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [serverState, setServerState] = useState(serverStates.disconnected);
  const [headId, setHeadId] = useState(null);

  const queryState = () => {
    const query = {
      tag: 'QueryCurrentDelegateState',
    };

    socket?.send(JSON.stringify(query));
  };

  useEffect(() => {
    const ws = new WebSocket(DELEGATE_SERVER_URL);

    console.log('Connecting to websocket server');

    ws.addEventListener('open', () => {
      setServerState(serverStates.connected);
      console.log('Connected to websocket server');
    });

    ws.addEventListener('message', (event) => {
      console.log('Received message', event.data);

      if (typeof event.data !== 'string') return;

      const message = JSON.parse(event.data);

      console.log('Parsed Message:', message);

      if (message.tag === 'CurrentDelegateState') {
        const [contentType, contents] = message.contents;

        if (
          (contentType === 'WasQueried' || contentType === 'Updated')
          && contents.tag === 'Initialized'
        ) {
          const newHeadId = contents.headId;
          const { primaryCommitWasSubmitted, tag } = contents.initializedState;

          setHeadId(newHeadId);

          switch (tag) {
            case 'AwaitingCommits':
              setServerState(
                primaryCommitWasSubmitted
                  ? serverStates.bidCommitted
                  : serverStates.awaitingCommits,
              );
              break;
            case 'Open':
              setServerState(serverStates.votingOpen);
              break;
            case 'Closed':
              setServerState(serverStates.votingClosed);
              break;
            default:
              setServerState(serverStates.unknown);
          }
        }
      }
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    ws.addEventListener('close', () => {
      console.log('Disconnected from the WebSocket server');
      setServerState(serverStates.disconnected);
    });

    setSocket(ws);

    // return () => {
    //   ws.close();
    // };
  }, []);

  const settle = () => {
    const message = {
      contents: {
        contents: {
          contents: 'AllVotesCasted',
          tag: 'Settle',
        },
        tag: 'MkTxAction',
      },
      tag: 'SubmitTx',
    };

    socket.send(JSON.stringify(message));
  };

  const timeout = () => {
    const message = {
      contents: {
        contents: {
          contents: 'Timeout',
          tag: 'Settle',
        },
        tag: 'MkTxAction',
      },
      tag: 'SubmitTx',
    };

    socket.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (socket && serverState === serverStates.connected) queryState();
  }, [socket, serverState]);

  useEffect(() => {
    if (headId) console.log('Hydra head ID', headId);
  }, [headId]);

  useEffect(() => {
    if (serverState) console.log('Server state', serverState);
  }, [serverState]);

  const createDispute = ({
    claimFor,
    claimer,
    hydraHeadId,
    jury,
    voteInterval,
    debugCheckSignatures = false,
  }) => {
    const terms = {
      claimFor,
      claimer,
      hydraHeadId,
      jury,
      voteInterval,
      debugCheckSignatures,
    };

    const commit = {
      contents: [terms, ''],
      tag: 'SubmitCommit',
    };

    socket?.send(JSON.stringify(commit));
  };

  const castVote = ({ juryMember, vote }) => {
    const voting = {
      contents: {
        contents: {
          contents: [
            juryMember,
            '',
            vote,
          ],
          tag: 'Vote',
        },
        tag: 'MkTxAction',
      },
      tag: 'SubmitTx',
    };

    socket?.send(JSON.stringify(voting));
  };

  const context = useMemo(
    () => ({
      state: serverState,
      headId,
      createDispute,
      castVote,
      settle,
      timeout,
    }),
    [serverState, headId],
  );

  return (
    <RealDelegateServerContext.Provider value={context}>
      {children}
    </RealDelegateServerContext.Provider>
  );
}

const useRealDelegateServer = () => useContext(RealDelegateServerContext);

export { RealDelegateServerProvider, useRealDelegateServer };
