import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';

const LitigationsContext = createContext();

const initialLitigations = {
  inDraft: [],
  inReconcilation: [],
  inVoting: [],
  toVote: [],
  closed: [],
};

const testLitigation = {
  assumed_author: null,
  winner: null,
  issuer_id: 1,
  creation_id: 1,
  creation_id_author_id: 1,
  decisions: [],
  material_id_author_id: 1,
  transactions: [],
};

function LitigationsProvider({ children }) {
  const [litigations, setLitigations] = useState(initialLitigations);

  const addLitigation = () => {
    setLitigations({ ...litigations, inVoting: [...litigations.inVoting, testLitigation] });
  };

  const context = useMemo(() => ({
    litigations,
    addLitigation,
  }), [litigations]);

  return (
    <LitigationsContext.Provider value={context}>
      {children}
    </LitigationsContext.Provider>
  );
}

const useLitigationsContext = () => useContext(LitigationsContext);

export { LitigationsProvider, useLitigationsContext };
