import { Chip, Typography } from '@mui/material';
import React from 'react';

export default function UserCard() {
  return (
    <div className='userCard'>
        <div className='userCardImage'>
            <img width={70} alt='user-image' src={'https://s3-us-west-2.amazonaws.com/s.cdpn.io/156905/profile/profile-512.jpg?1530296477'} />
        </div>

        <div className='userCardDetails'>
            <Typography variant='h6'>John Doe</Typography>
            <Typography variant='span'>User experience designer</Typography>

            <div className='userCardChips'>
                <Chip className='chip' label='10 Collections' />
                <Chip className='chip' label='120 Followers' />
            </div>
        </div>
    </div>
  );
}
