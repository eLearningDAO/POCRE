export const serverStates = {
  disconnected: 'Disconnected',
  connected: 'Connected',
  awaitingCommits: 'AwaitingCommits',
  bidCommitted: 'BidCommitted',
  votingOpen: 'VotingOpen',
  votingClosed: 'VotingClosed',
  unknown: 'Unknown',
};

export const makeVoteInterval = (voteDurationMinutes) => {
  const startDate = new Date();
  const voteStart = startDate.getTime();
  const voteEnd = voteStart + voteDurationMinutes * 60_000;

  return [voteStart, voteEnd];
};

export const voteIntervalToISO = (voteInterval) => voteInterval.map(
  (epochTime) => new Date(epochTime).toISOString(),
);
