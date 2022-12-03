import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import CreationForm from '../common/form';

function UpdateCreation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCreationFetch = (creation) => {
    if (creation && creation.original && !creation?.original?.is_draft) {
      // redirect to 404 page if the creation is published
      navigate('/404');
    }
  };

  return (
    <CreationForm id={id} onCreationFetch={handleCreationFetch} />
  );
}

export default UpdateCreation;
