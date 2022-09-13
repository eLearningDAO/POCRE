import { Typography } from '@mui/material';
import React from 'react';
import FacebookIcon from '../../assets/facebook.png';
import InstagramIcon from '../../assets/instagram.png';
import LinkedinIcon from '../../assets/linkedin.png';
import TwitterIcon from '../../assets/twitter.png';
import UserImage1 from '../../assets/user-image-3.png';

export default function CreditCard() {
  return (
    <div className='creditCard'>
        <div className='creditCardImage'>
            <img alt='credit-user' src={UserImage1} />
        </div>

        <div className='creditCardDetials'>
            <Typography variant='h5'>
                John Smith
            </Typography>

            <Typography variant='h6'>
                CEO & Founder
            </Typography>

            <Typography variant='span'>
                Reference site about Lorem Ipsum, giving information
            </Typography>

            <div className='creditCardIcons'>
                <img src={TwitterIcon} alt="" />
                <img src={LinkedinIcon} alt="" />
            </div>
        </div>
    </div>
  )
}
