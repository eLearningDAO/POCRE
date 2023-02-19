import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import LitigationForm from '../common/form';

function UpdateLitigation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleLitigationFetch = (litigation) => {
    if (litigation && !litigation?.is_draft) {
      // redirect to litigation details page if the litigation is published
      navigate(`/litigations/${id}`);
    }
  };

  return (
    <LitigationForm id={id} onLitigationFetch={handleLitigationFetch} />
  );
}

export default UpdateLitigation;
