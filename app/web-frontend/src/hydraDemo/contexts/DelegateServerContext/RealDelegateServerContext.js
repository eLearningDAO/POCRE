import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';
import { DELEGATE_SERVER_URL } from 'config';
import { toHex } from 'hydraDemo/util/hex';
import { serverStates } from './common';

const RealDelegateServerContext = createContext();

const initialVoteInfo = {
  terms: {},
  votes: { Yes: [], No: [], Abstain: [] },
};

const makeSettleMessage = (settleType) => ({
  contents: {
    contents: {
      contents: settleType,
      tag: 'Settle',
    },
    tag: 'MkTxAction',
  },
  tag: 'SubmitTx',
});

function RealDelegateServerProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [serverState, setServerState] = useState(serverStates.disconnected);
  const [headId, setHeadId] = useState(null);
  const [voteInfo, setVoteInfo] = useState(initialVoteInfo);

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
          const { tag: initializedStateType } = contents.initializedState;

          setHeadId(newHeadId);

          switch (initializedStateType) {
            case 'AwaitingCommits':
            case 'Aborted': {
              const { primaryCommitWasSubmitted } = contents.initializedState;
              if (primaryCommitWasSubmitted) {
                setServerState(serverStates.bidCommitted);
              } else {
                setServerState(serverStates.awaitingCommits);
                setVoteInfo(initialVoteInfo);
              }
              break;
            }
            case 'Open': {
              const { terms, votesCastedFor } = contents?.initializedState.contents.disputeDatum;
              const votesObject = {};
              for (const [voteType, voteList] of votesCastedFor.unMap) {
                votesObject[voteType] = voteList;
              }
              setVoteInfo({
                ...voteInfo,
                terms,
                votes: votesObject,
              });
              setServerState(serverStates.votingOpen);
              break;
            }
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

  const settleAllVotesCasted = () => {
    const message = makeSettleMessage('AllVotesCasted');
    socket.send(JSON.stringify(message));
  };

  const settleTimeout = () => {
    const message = makeSettleMessage('Timeout');
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

  // Handle settling automatically once all votes casted or interval has elapsted
  useEffect(() => {
    console.log('new voteInfo', voteInfo);

    if (voteInfo.terms.voteInterval && Date.now() > voteInfo.terms.voteInterval[1]) {
      settleTimeout();
      return;
    }

    let totalVotes = 0;
    for (const votes of Object.values(voteInfo.votes)) totalVotes += votes.length;

    if (!totalVotes || !voteInfo.terms.jury) return;

    if (totalVotes >= voteInfo.terms.jury.length) {
      settleAllVotesCasted();
    }
  }, [voteInfo]);

  const createDispute = ({
    litigationId,
    claimer,
    hydraHeadId,
    jury,
    voteInterval,
    debugCheckSignatures = false,
  }) => {
    const terms = {
      claimFor: toHex(litigationId),
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
          contents: [juryMember, '', vote],
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
      voteInfo,
      createDispute,
      castVote,
      settleAllVotesCasted,
      settleTimeout,
    }),
    [serverState, headId, voteInfo],
  );

  return (
    <RealDelegateServerContext.Provider value={context}>
      {children}
    </RealDelegateServerContext.Provider>
  );
}

const useRealDelegateServer = () => useContext(RealDelegateServerContext);

export { RealDelegateServerProvider, useRealDelegateServer };
