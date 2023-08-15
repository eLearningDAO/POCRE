import React, {
  createContext, useState, useContext, useMemo, useEffect,
} from 'react';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import statusTypes from 'utils/constants/statusTypes';
import { makeLocalStorageManager } from 'hydraDemo/util/localStorage';

const LitigationsContext = createContext();
const idField = 'litigation_id';
const storageManager = makeLocalStorageManager({ storageKey: 'litigations', idField });

const toDate = (dateString) => new Date(dateString);

/**
 * Handles the state and persistence of litigations used in the hydra demo.
 *
 * Example litigation:
 * ```
 * {
 *   litigation_id: 'b1171878-797e-4f8a-a726-961f761bb8fc',
 *   litigation_title: 'my first creation',
 *   litigation_description: 'an example creation',
 *   material_id: 'd91f005d-2037-41b9-b706-0e70c651e4e2',
 *   assumed_author: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36621',
 *   issuer_id: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36629',
 *   winner: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36629',
 *   recognitions: [
 *     '476790e7-a6dc-4aea-8421-06bacfa2daf6',
 *   ],
 *   decisions: [
 *     '7b3439c6-a691-4a60-9e09-8235804c33fe',
 *   ],
 *   voting_start: '2022-09-06T19:00:00.000Z',
 *   voting_end: '2024-09-06T19:00:00.000Z',
 *   reconcilate: false,
 *   created_at: '2022-09-05T19:00:00.000Z',
 *   ownership_transferred: false,
 *   assumed_author_response: statusTypes.START_LITIGATION,
 *   toJudge: false,
 *   is_draft: false,
 * };
 * ```
 */
function LitigationsProvider({ children }) {
  const [litigationsById, setLitigationsById] = useState({});

  const fetchLitigations = () => {
    const newLitigations = storageManager.fetchAll();
    if (newLitigations) setLitigationsById(newLitigations);
  };

  // TODO: improve efficiency by only updating when litigations have changed
  useEffect(() => {
    fetchLitigations();
    setInterval(fetchLitigations, 5000);
  }, []);

  const saveLitigation = (litigation) => {
    const newLitigation = { ...litigation, [idField]: litigation[idField] ?? uuidv4() };

    console.log('Saving litigation', newLitigation);

    const newLitigations = storageManager.save(newLitigation);
    setLitigationsById(newLitigations);
  };

  // Using existing logic from 'pages/Litigations/Home/useHome.jsx'.
  // Could be more efficient by not filtering the entire list for each group
  // but doesn't matter for this demo.
  const groupLitigations = () => {
    const now = moment();
    const litigations = Object.values(litigationsById);

    return {
      inDraft: litigations.filter((x) => x.is_draft),
      // displayed to assumed authors and claimers
      inReconcilation: litigations.filter(
        (x) => (
          moment(toDate(x?.reconcilation_start)).isSameOrBefore(now)
        && moment(toDate(x?.reconcilation_end)).isAfter(now)
        && x?.assumed_author_response === statusTypes.PENDING_RESPONSE
        && !x.is_draft
        ),
      ),
      // displayed to assumed authors and claimers
      inVoting: litigations.filter(
        (x) => (
          moment(toDate(x?.voting_start)).isSameOrBefore(now)
        && moment(toDate(x?.voting_end)).isAfter(now)
        && x?.assumed_author_response === statusTypes.START_LITIGATION
        && !x?.toJudge
        && !x.is_draft
        ),
      ),
      // displayed to jury members only
      toVote: litigations.filter(
        (x) => (
          moment(toDate(x?.voting_start)).isSameOrBefore(now)
        && moment(toDate(x?.voting_end)).isAfter(now)
        && x?.assumed_author_response === statusTypes.START_LITIGATION
        && x?.toJudge
        && !x.is_draft
        ),
      ),
      // displayed to all users
      closed: litigations.filter(
        (x) => (
          !x.is_draft
        && (
          moment(toDate(x?.voting_end)).isBefore(now)
          || x?.assumed_author_response === statusTypes.WITHDRAW_CLAIM
          || (
            // no response from author in reconilation phase (author lost claim)
            moment(toDate(x?.reconcilation_end)).isBefore(now)
            && x?.assumed_author_response === statusTypes.PENDING_RESPONSE
          )
        )
        ),
      ),
    };
  };

  const context = useMemo(() => ({
    litigations: groupLitigations(),
    saveLitigation,
  }), [litigationsById]);

  return (
    <LitigationsContext.Provider value={context}>
      {children}
    </LitigationsContext.Provider>
  );
}

const useLitigationsContext = () => useContext(LitigationsContext);

export { LitigationsProvider, useLitigationsContext };
