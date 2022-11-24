/* eslint-disable indent */
import CameraIcon from 'assets/svgs/cameraIcon.svg';
import { useEffect, useState } from 'react';

function UserAvatar({
  imageUrl = '',
  editable = false,
  onAvatarFilePicked = () => {},
}) {
  const [image, setImage] = useState('');

  const handleSelectedFile = (file) => {
    onAvatarFilePicked(file);
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      setImage(event.target.result);
    });
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setImage(imageUrl);
  }, [imageUrl]);

  return (
    <div className="user-profile-avatar">
      <img src={image} alt="alt" loading="lazy" />
      {editable && (
        <label htmlFor="file-input" className="user-profile-avatar-picker-btn">
          <img src={CameraIcon} alt="camera" loading="lazy" />
          <input
            type="file"
            id="file-input"
            accept="image/*"
            onChange={(event) => handleSelectedFile(event.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}
export default UserAvatar;
