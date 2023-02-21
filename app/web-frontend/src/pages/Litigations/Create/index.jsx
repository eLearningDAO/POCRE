import { useSearchParams } from 'react-router-dom';
import LitigationForm from '../common/form';

function CreateLitigation() {
  const [searchParameters] = useSearchParams();
  const creationId = searchParameters.get('creationId');
  const materialId = searchParameters.get('materialId');
  return (
    <LitigationForm autofillClaim={{ creationId, materialId }} />
  );
}

export default CreateLitigation;
