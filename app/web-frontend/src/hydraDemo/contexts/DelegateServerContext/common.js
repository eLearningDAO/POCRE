export const serverStates = {
  disconnected: 'Disconnected',
  connected: 'Connected',
  awaitingCommits: 'AwaitingCommits',
  bidCommitted: 'BidCommitted',
  votingOpen: 'VotingOpen',
  votingClosed: 'VotingClosed',
  unknown: 'Unknown',
};

// TODO: make keys configurable
export const juryKeys = [
  'd480224a7fa30131804dacffa0322d9256092800bd2f3828fb9a77cf',
  'f19e75abc98140c647ae962b7a903c6a2c65520a87467841d435819a',
  '8be4e12dd88a085bcdfbb07763d1dcf8a2a4aaa6646edafe6476e6ac',
];

export const makeTestTerms = (hydraHeadId) => ({
  claimFor: '54657374',
  claimer: juryKeys[0],
  hydraHeadId,
  jury: juryKeys,
  voteDurationMinutes: 1,
  debugCheckSignatures: false,
});
