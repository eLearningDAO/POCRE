import {
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import CreationForm from '../common/form';

function UpdateCreation() {
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const step = Number.parseInt(query.get('step'), 10);
  const navigate = useNavigate();

  const handleCreationFetch = (creation) => {
    if (creation && creation.original && !creation?.original?.is_draft) {
      // redirect to 404 page if the creation is published
      navigate('/404');
    }
  };

  return (
    <CreationForm id={id} activeStep={step} onCreationFetch={handleCreationFetch} />
  );
}

export default UpdateCreation;
