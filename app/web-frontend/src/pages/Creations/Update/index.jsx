import {
  useParams,
} from 'react-router-dom';
import CreationForm from '../common/form';

function UpdateCreation() {
  const { id } = useParams();

  return (
    <CreationForm id={id} />
  );
}

export default UpdateCreation;
