import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import CreationForm from '../common/form';

function UpdateCreation() {
  const { id } = useParams();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(null);

  const handleCreationFetch = (creation) => {
    if (creation && creation.original && !creation?.original?.is_draft) {
      // redirect to creation details page if the creation is published
      navigate(`/creations/${id}`);
    }
  };

  useEffect(() => {
    const temporaryStep = Number.parseInt(searchParameters.get('step'), 10);
    setStep(temporaryStep);
    // remove from url
    searchParameters.delete('step');
    setSearchParameters(searchParameters);
  }, []);

  return (
    <CreationForm id={id} activeStep={step} onCreationFetch={handleCreationFetch} />
  );
}

export default UpdateCreation;
