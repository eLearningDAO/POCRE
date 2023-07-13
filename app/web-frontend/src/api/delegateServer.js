import { DELEGATE_SERVER_URL } from 'config';

let ws;

const queryState = () => {
  const query = {
    tag: 'QueryCurrentDelegateState',
  };

  ws.send(JSON.stringify(query));
};

const createDispute = ({
  claimFor,
  claimer,
  hydraHeadId,
  jury,
  voteDurationHours,
  debugCheckSignatures = false,
}) => {
  const dateNow = new Date();
  const voteStart = dateNow.getTime();
  const voteEnd = new Date().setHours(dateNow.getHours + voteDurationHours).getTime();
  const voteInterval = [voteStart, voteEnd];

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

  ws.send(JSON.stringify(commit));
};

const castVote = ({ juryMember, vote }) => {
  const voting = {
    contents: {
      contents: [juryMember, '', vote],
      tag: 'Vote',
    },
    tag: 'SubmitTx',
  };

  ws.send(JSON.stringify(voting));
};

const settle = () => {
  const settling = {
    contents: {
      contents: 'AllVotesCasted',
      tag: 'Settle',
    },
    tag: 'SubmitTx',
  };

  ws.send(JSON.stringify(settling));
};

const connectWebsocket = () => {
  ws = new WebSocket(DELEGATE_SERVER_URL);

  ws.addEventListener('message', (event) => {
    console.log('Received:', event.data);

    // const response = JSON.parse(event.data);
  });
};

export const getDelegateServerApi = () => {
  if (!ws) connectWebsocket();

  return {
    queryState,
    createDispute,
    castVote,
    settle,
  };
};
