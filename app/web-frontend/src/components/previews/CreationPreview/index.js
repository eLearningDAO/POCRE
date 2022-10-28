/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Button, Typography,
} from '@mui/material';
import React from 'react';
import CloseIcon from '../../../assets/svgs/close.svg';
import './index.css';

function CreationPreview({
  title = '',
  description = '',
  link = '',
  date = '',
  authorName = '',
  materials = [{
    title: '',
    fileType: '',
    link: '',
    authorName: '',
  }],
  onClose = () => {},
}) {
  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="creation-preview">
        <div className="creation-preview-header">
          <Typography className="heading h4">Preview</Typography>
          <Button padding="0" minWidth="0" onClick={onClose}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="creation-preview-content">
          <div className="creation-preview-grid">
            <span className="heading">Title</span>
            <span>{title}</span>

            <span className="heading">Description</span>
            <span>{description}</span>

            <span className="heading">Source</span>
            <span>{link}</span>

            <span className="heading">Date</span>
            <span>{date}</span>

            <span className="heading">Author</span>
            <span>{authorName}</span>

            {/* <span className="heading">Tags</span>
            <span className="creation-tags">
              {tags.map((x, index) => <Chip key={index} label={x} />)}
            </span> */}
          </div>

          {materials && materials?.length > 0 && (
          <>
            <h4 className="heading h4">Materials Submitted</h4>
            <table>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Link</th>
                <th>Author</th>
              </tr>
              {materials?.map((x) => (
                <tr>
                  <td>{x.title}</td>
                  <td className="capitalize">{x.fileType}</td>
                  <td><a href={x.link}>{x.link}</a></td>
                  <td>{x.authorName}</td>
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
