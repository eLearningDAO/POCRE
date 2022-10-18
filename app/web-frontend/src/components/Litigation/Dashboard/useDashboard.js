import Cookies from 'js-cookie';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../../config';

const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const useDashboard = () => {
  const [isFetchingLitigations, setIsFetchingLitigations] = useState(false);
  const [litigations, setLitigations] = useState({
    opening: [],
    closed: [],
    openedAgainstMe: [],
    toJudge: [],
  });
  const [fetchLitigationsStatus, setFetchLitigationsStatus] = useState({
    success: false,
    error: null,
  });

  const fetchLitigations = useCallback(async () => {
    try {
      setIsFetchingLitigations(true);

      // get litigations
      let litigationResponse = await fetch(
        `${API_BASE_URL}/litigations?query=${authUser?.user_id}&search_fields[]=issuer_id&search_fields[]=assumed_author&page=${1}&limit=1000`,
      )
        .then((x) => x.json());

      if (litigationResponse.code >= 400) throw new Error('Failed to fetch litigations');

      // get details for each litigation
      litigationResponse = {
        ...litigationResponse,
        results: await Promise.all(litigationResponse?.results?.map(async (x) => {
          const litigation = { ...x };

          // get issuer details
          const issuer = x.issuer_id === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${x.issuer_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.issuer_id;

          // get assumed author details
          const assumedAuthor = x.assumed_author === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${x.assumed_author}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.assumed_author;

          const winner = x.winner === x.issuer_id ? issuer : assumedAuthor;

          // get creation details
          const creation = await fetch(
            `${API_BASE_URL}/creations/${x.creation_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.creation_id;

          // get creation author
          creation.author = creation.author_id === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${creation.author_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete creation.author_id;

          // get creation details
          let material = null;
          if (litigation.material_id) {
            // get material details
            material = await fetch(
              `${API_BASE_URL}/materials/${x.material_id}`,
            ).then((y) => y.json()).catch(() => null);

            // get material author
            material.author = material.author_id === authUser?.user_id ? authUser : await fetch(
              `${API_BASE_URL}/users/${material.author_id}`,
            ).then((y) => y.json()).catch(() => null);
            delete material.author_id;
          }
          delete litigation.material_id;

          return {
            ...litigation,
            issuer,
            assumed_author: assumedAuthor,
            creation,
            material,
            winner,
          };
        })),
      };

      // calculate open/closed and in progress litigations
      litigationResponse = {
        ...litigationResponse,
        results: {
          closed: litigationResponse?.results?.filter(
            (x) => moment(x.litigation_end).isBefore(new Date().toISOString()),
          ),
          opening: litigationResponse?.results?.filter(
            (x) => moment(x.litigation_start).isAfter(new Date().toISOString()),
          ),
          openedAgainstMe: litigationResponse?.results?.filter(
            (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
            && moment(x.litigation_end).isAfter(new Date().toISOString())
            && x?.assumed_author?.user_id === authUser?.user_id,
          ),
        },
      };

      setFetchLitigationsStatus({
        success: true,
        error: null,
      });
      setLitigations({ ...litigationResponse });
      // eslint-disable-next-line sonarjs/no-identical-functions
      setTimeout(() => setFetchLitigationsStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchLitigationsStatus({
        success: false,
        error: 'Failed to fetch litigations',
      });
    } finally {
      setIsFetchingLitigations(false);
    }
  }, []);

  return {
    isFetchingLitigations,
    fetchLitigationsStatus,
    fetchLitigations,
    litigations,
  };
};

export default useDashboard;
