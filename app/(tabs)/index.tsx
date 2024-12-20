import ImageUpload from '../../components/ImageUploadWrapper';
import { useUser } from '@clerk/clerk-expo';

export default function ImageUploadWrapper() {
  const { user } = useUser();

  return <ImageUpload userId={user?.id} />;
}
