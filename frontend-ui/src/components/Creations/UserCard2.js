import { Chip, Typography } from '@mui/material';
import React from 'react';
import TopLearnerImg1 from '../../assets/top-learner-user.png';

export default function UserCard() {
  return (
    <div className='userCard userCard2'>
        <div className='userCardImage'>
            <img width={70} alt='user-image' src={TopLearnerImg1} />
        </div>

        <div className='userCardDetails'>
            <Typography variant='h6'>Andrzej Smith</Typography>
            <Typography variant='span'>User experience designer</Typography>

            <div className='userCardChips'>
                <Chip className='chip' label='10 Collections' />
                <Chip className='chip' label='120 Followers' />
            </div>
        </div>
    </div>
  );
}
