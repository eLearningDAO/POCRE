import { Typography } from '@mui/material';
import React from 'react';
import UserImage1 from '../../assets/top-learner-user.png'

export default function OtherContributerCard() {
  return (
    <div className='otherContributorCard'>
        <div className='otherContributorCardImage'>
            <img alt='credit-user' src={UserImage1} />
        </div>

        <div className='otherContributorCardDetials'>
            <Typography variant='h5'>
                John Smith
            </Typography>

            <Typography variant='h6'>
                CEO & Founder
            </Typography>
        </div>
    </div>
  )
}
