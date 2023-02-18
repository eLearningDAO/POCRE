import { useParams } from 'react-router-dom';
import LitigationForm from '../common/form';

function CreateLitigation() {
  const { creationId, materialId } = useParams();
  return (
    <LitigationForm creationId={creationId} materialId={materialId} />
  );
}

export default CreateLitigation;
