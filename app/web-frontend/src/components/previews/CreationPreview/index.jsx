/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Button, Typography,
} from '@mui/material';
import CloseIcon from 'assets/svgs/close.svg';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

function CreationPreview({
  id = '',
  title = '',
  description = '',
  link = '',
  ipfsHash = '',
  date = '',
  authorName = '',
  authorProfileId = '',
  materials = [{
    title: '',
    fileType: '',
    link: '',
    authorName: '',
    authorProfileId: '',
  }],
  onClose = () => {},
}) {
  const [qrcodeBase64, setQrcodeBase64] = useState(null);

  const generateQRCodeBase64 = async (text) => {
    const code = await QRCode.toDataURL(`${window.location.origin}/creations/${text}`, {
      width: 150,
      height: 150,
      margin: 2,
      scale: 8,
    });

    setQrcodeBase64(code);
  };

  useEffect(() => {
    if (id) generateQRCodeBase64(id);
  }, [id]);

  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="creation-preview">
        <div className="creation-preview-header">
          <Typography className="heading h4">Proof Of co-CREation - Status pending</Typography>
          <Button padding="0" minWidth="0" onClick={onClose}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="creation-preview-content">
          <div className={`creation-preview-grid-container ${id && 'creation-preview-grid-container-cols'}`}>
            <div className="creation-preview-grid">
              <span className="heading">Title</span>
              <span>{title || '-'}</span>

              <span className="heading">Description</span>
              <span>{description || '-'}</span>

              <span className="heading">Source</span>
              <span>{link || '-'}</span>

              <span className="heading">IPFS</span>
              <span>{ipfsHash || 'Available after creation is published'}</span>

              <span className="heading">Date</span>
              <span>{date || '-'}</span>

              <span className="heading">Author</span>
              {authorProfileId ? <Link to={`/wallet/${authorProfileId}`}>{authorName}</Link> : <span>{authorName || '-'}</span>}

              {/* <span className="heading">Tags</span>
            <span className="creation-tags">
              {tags.map((x, index) => <Chip key={index} label={x} />)}
            </span> */}
            </div>
            {id && (
              <div className="creation-preview-codes">
                <img className="creation-preview-qr-code" src={qrcodeBase64} alt="Qr Code" />
                <h2>Unique ID</h2>
                <p className="creation-preview-qr-code-id">{id}</p>
              </div>
            )}
          </div>

          {materials && materials?.length > 0 && (
            <>
              <h4 className="heading h4">External materials used</h4>
              <table>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Link</th>
                  <th>Author</th>
                </tr>
                {materials?.map((x) => (
                  <tr>
                    <td>{x.title || '-'}</td>
                    <td className="capitalize">{x.fileType || '-'}</td>
                    <td><a href={x.link}>{x.link || '-'}</a></td>
                    <td>
                      {x?.authorProfileId
                        ? <Link to={`/wallet/${x?.authorProfileId}`}>{x.authorName}</Link>
                        : x.authorName || '-'}
                    </td>
                  </tr>
                ))}
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreationPreview;
