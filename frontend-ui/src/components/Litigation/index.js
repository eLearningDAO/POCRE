import { Button, Grid, Typography } from '@mui/material';
import React from 'react';
import WithdrawIcon from '../../assets/withdraw-icon.png';
import ApproveIcon from '../../assets/approve-icon.png';
import UserImage from '../../assets/user-image-2.jpeg';
import UserImage2 from '../../assets/top-learner-user.png';
import { useNavigate } from 'react-router-dom';

const Litigation = () => {
  const navigate = useNavigate();
  
  const approve = () => {
    navigate('/litigation/closed');
  };

  return ( 
    <Grid container>

      <Grid item xs={12}>
        <Typography className='inviationHeaderTitle' variant='h6'>Litigation</Typography>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '10px' }}>
        <Typography className='inviationSectionTitle' variant='h6'>Opened</Typography>
      </Grid>

      <table className='litigationBox'>
        <tr className='litigationBoxHeader'>
            <th>Creation Title</th>
            <th className='responsive'>Claimer</th>
            <th className='responsive'>Assumed Author</th>
            <th className='responsive'>Litigation Start</th>
            <th className='responsive'>Deadline</th>
            <th className='responsive'>Availabel jurors</th>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>9/10</td>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>9/10</td>
        </tr>
      </table>


      <Grid item xs={12} style={{ marginTop: '20px' }}>
        <Typography className='inviationSectionTitle' variant='h6'>Opening</Typography>
      </Grid>

      <table className='litigationBox'>
        <tr className='litigationBoxHeader'>
            <th>Creation Title</th>
            <th className='responsive'>Claimer</th>
            <th className='responsive'>Assumed Author</th>
            <th className='responsive'>Litigation Start</th>
            <th className='responsive'>Deadline</th>
            <th className='responsive'>Availabel jurors</th>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>
                <Button className='withdrawButton'>
                    <img src={WithdrawIcon} alt='withdraw' />    Withdraw
                </Button>
            </td>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>
                <Button onClick={approve} className='approveButton'>
                    <img src={ApproveIcon} alt='withdraw' />    Approve
                </Button>
            </td>
        </tr>
      </table>

      <Grid item xs={12} style={{ marginTop: '20px' }}>
        <Typography className='inviationSectionTitle' variant='h6'>Closed</Typography>
      </Grid>

      <table className='litigationBox'>
        <tr className='litigationBoxHeader'>
            <th >Creation Title</th>
            <th className='responsive'>Claimer</th>
            <th className='responsive'>Assumed Author</th>
            <th className='responsive'>Litigation Start</th>
            <th className='responsive'>Deadline</th>
            <th className='responsive'>Availabel jurors</th>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>9/10</td>
        </tr>

        <tr className='litigationBoxBody'>
            <td>I want reclaim my authorship of this media</td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>
                <div className='litigationUser'>
                    <div className='litigationUserImage'>
                        <img src={UserImage2} alt='user-image' />
                    </div>
                    <div className='litigationUserText'>
                        <h6>Bobi</h6>
                        0X 3A5 EE2
                    </div>
                </div>
            </td>
            <td className='responsive'>01/05/2022</td>
            <td className='responsive'>01/07/2022</td>
            <td className='responsive'>9/10</td>
        </tr>
      </table>

    </Grid>
  );
}
 
export default Litigation;