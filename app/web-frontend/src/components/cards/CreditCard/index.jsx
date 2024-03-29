import { Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import LinkedinIcon from 'assets/images/linkedin.png';
import TwitterIcon from 'assets/images/twitter2.png';
import GithubIcon from 'assets/svgs/github.svg';
import './index.css';

export default function CreditCard(
  {
    name,
    job,
    bio,
    linkedIn,
    twitter,
    image,
    github,
  },
) {
  const [linkedInPresent, setlinkedInPresent] = useState(true);
  const [twitterPresent, setTwitterPresent] = useState(true);
  const [githubPresent, setGithubPresent] = useState(true);

  useEffect(() => {
    if (linkedIn === '') {
      setlinkedInPresent(false);
    }
    if (twitter === '') {
      setTwitterPresent(false);
    }
    if (github === '') {
      setGithubPresent(false);
    }
  }, []);
  return (
    <div className="creditCard">
      <div className="creditCardImage">
        <img alt="credit-user" src={image} />
      </div>

      <div className="creditCardDetials">
        <Typography variant="h5">
          { name }
        </Typography>

        <Typography variant="h6" className="job">
          {job}
        </Typography>
        <Typography variant="span" className="bio">
          {bio}
        </Typography>
        <div className="creditCardIcons">
          {linkedInPresent
            ? (
              <a href={linkedIn}>
                <img src={LinkedinIcon} alt="LinkedIn profile" width={20} height={20} href={linkedIn} />
              </a>
            ) : null}
          {twitterPresent
            ? (
              <a href={twitter}>
                <img src={TwitterIcon} alt="Twitter profile" width={20} height={20} href={twitter} />
              </a>
            ) : null}
          {githubPresent
            ? (
              <a href={github}>
                <img src={GithubIcon} alt="Github profile" width={20} height={20} href={github} />
              </a>
            ) : null}
        </div>
      </div>
    </div>
  );
}
