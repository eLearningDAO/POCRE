import { RealDelegateServerProvider, useRealDelegateServer } from './RealDelegateServerContext';
import { MockDelegateServerProvider, useMockDelegateServer } from './MockDelegateServerContext';

export { serverStates, makeVoteInterval, voteIntervalToISO } from './common';

// TODO: Move to config
const useMock = true;

export function DelegateServerProvider({ children }) {
  return useMock ? (
    <MockDelegateServerProvider>{children}</MockDelegateServerProvider>
  ) : (
    <RealDelegateServerProvider>{children}</RealDelegateServerProvider>
  );
}

export const useDelegateServer = useMock ? useMockDelegateServer : useRealDelegateServer;
