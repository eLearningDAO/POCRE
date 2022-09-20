import { Typography } from '@mui/material';
import React from 'react';
import LinkedinIcon from '../../assets/linkedin.png';
import TwitterIcon from '../../assets/twitter.png';
import UserImage1 from '../../assets/user-image-3.png';

export default function CreditCard(properties) {
  return (
    <div className='creditCard'>
        <div className='creditCardImage'>
            <img alt='credit-user' src={UserImage1} width={300} height={100} />
        </div>

        <div className='creditCardDetials'>
            <Typography variant='h5'>
                {properties.name}
            </Typography>

            <Typography variant='h6'>
            {properties.role}
            </Typography>

            <Typography variant='span'>
                {properties.bio}
            </Typography>

            <div className='creditCardIcons'>
                <img src={TwitterIcon} alt="" />
                <img src={LinkedinIcon} alt="" />
            </div>
        </div>
    </div>
  )
}
