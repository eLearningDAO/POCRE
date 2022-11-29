import { Button } from '@mui/material';
import { ReactComponent as GalleryIcon } from 'assets/svgs/gallery.svg';
import { ReactComponent as PencilIcon } from 'assets/svgs/pencil.svg';
import './index.css';

function Tile({
  onClick = () => {},
  label = '',
  icon = 'gallery', // can be gallery or pencil, TODO: handle it better when implementing typescript,
  variant = 'filled', // can be filled or outlined, TODO: handle it better when implementing typescript,
}) {
  return (
    <Button
      className={`
        tile 
        ${variant === 'filled' && 'tile-filled'} 
        ${variant === 'outlined' && 'tile-outlined'}
      `}
      onClick={onClick}
    >
      {icon === 'gallery' && <GalleryIcon />}
      {icon === 'pencil' && <PencilIcon />}
      {label}
    </Button>
  );
}

export default Tile;
