import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import LitigationForm from '../common/form';

function UpdateLitigation() {
  const { id } = useParams();
  const [searchParameters] = useSearchParams();
  const materialId = searchParameters.get('materialId');
  const navigate = useNavigate();

  const handleLitigationFetch = (litigation) => {
    if (litigation && !litigation?.is_draft) {
      // redirect to litigation details page if the litigation is published
      navigate(`/litigations/${id}`);
    }
  };

  return (
    // eslint-disable-next-line max-len
    <LitigationForm id={id} autofillClaim={{ materialId }} onLitigationFetch={handleLitigationFetch} />
  );
}

export default UpdateLitigation;
