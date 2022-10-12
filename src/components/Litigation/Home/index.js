import {
  Button,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserInfo from '../../../hooks/user/userInfo';
import './index.css';

export default function LitigationClosed() {
  const user = useUserInfo((s) => s.user);
  // console.log(user);
  const navigate = useNavigate();

  const onNewLitigationClick = () => {
    navigate('/litigation/create');
  };

  const onLitigationExploreClick = () => {
    navigate('/litigation/dashboard');
  };

  return (
    <div>
      <div className="inner-div">
        <div className="front">
          <div className="front__bkg-photo" />
          <div className="front__face-photo">
            {user?.avatar && <img src={user?.avatar} alt="alt" className="base-image" />}
          </div>
          <Grid item className="userDetailsLeft">
            <div className="userDetailsLeftHeader">
              <Typography variant="h4">{user?.user_name || 'Loading...'}</Typography>
              <Typography variant="p">User experience designer</Typography>
            </div>

            <div className="userDetailsChip">
              <Chip className="chip" label="Author of 10 collections" />
            </div>
          </Grid>
          <Grid container className="userDetails">
            <Grid item md={12} spacing={5} className="userDetailsRight">
              <Button com className="collectionButton" onClick={onLitigationExploreClick}>
                <svg
                  width="56"
                  height="51"
                  viewBox="0 0 56 51"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M30.6247 2.625C30.6247 1.92881 30.3481 1.26113 29.8558 0.768845C29.3635 0.276562 28.6959 0 27.9997 0C27.3035 0 26.6358 0.276562 26.1435 0.768845C25.6512 1.26113 25.3747 1.92881 25.3747 2.625V7H21.9307C20.8632 7 19.8167 7.28 18.8892 7.805L14.3812 10.3845C14.248 10.4607 14.0971 10.5005 13.9437 10.5H6.12467C5.42848 10.5 4.7608 10.7766 4.26852 11.2688C3.77623 11.7611 3.49967 12.4288 3.49967 13.125C3.49967 13.8212 3.77623 14.4889 4.26852 14.9812C4.7608 15.4734 5.42848 15.75 6.12467 15.75H7.62267L0.230673 32.172C0.0123363 32.6578 -0.0530371 33.1986 0.0432351 33.7225C0.139507 34.2463 0.39287 34.7285 0.769673 35.105L2.62467 33.25L0.769673 35.105V35.1085L0.776673 35.1155L0.783673 35.1225L0.804673 35.1435L0.860673 35.196L1.01817 35.336C1.75426 35.9529 2.56009 36.4815 3.41917 36.911C5.62314 37.9855 8.04789 38.5297 10.4997 38.5C13.5797 38.5 15.9457 37.73 17.5802 36.911C18.4392 36.4815 19.2451 35.9529 19.9812 35.336L20.1387 35.196L20.1947 35.1435L20.2157 35.1225L20.2227 35.1155L20.2262 35.1085L18.3747 33.25L20.2297 35.105C20.6065 34.7285 20.8598 34.2463 20.9561 33.7225C21.0524 33.1986 20.987 32.6578 20.7687 32.172L13.3767 15.75H13.9437C15.0112 15.75 16.0577 15.47 16.9852 14.945L21.4967 12.3655C21.6288 12.2899 21.7784 12.2501 21.9307 12.25H25.3747V45.5H16.6247C15.9285 45.5 15.2608 45.7766 14.7685 46.2688C14.2762 46.7611 13.9997 47.4288 13.9997 48.125C13.9997 48.8212 14.2762 49.4889 14.7685 49.9812C15.2608 50.4734 15.9285 50.75 16.6247 50.75H39.3747C40.0709 50.75 40.7385 50.4734 41.2308 49.9812C41.7231 49.4889 41.9997 48.8212 41.9997 48.125C41.9997 47.4288 41.7231 46.7611 41.2308 46.2688C40.7385 45.7766 40.0709 45.5 39.3747 45.5H30.6247V12.25H34.0687C34.2209 12.2501 34.3705 12.2899 34.5027 12.3655L39.0177 14.9415C39.9417 15.4735 40.9882 15.75 42.0557 15.75H42.6227L35.2307 32.172C35.0123 32.6578 34.947 33.1986 35.0432 33.7225C35.1395 34.2463 35.3929 34.7285 35.7697 35.105L37.6247 33.25L35.7697 35.105V35.1085L35.7767 35.1155L35.7837 35.1225L35.8047 35.1435L35.8607 35.196L36.0182 35.336C36.7543 35.9529 37.5601 36.4815 38.4192 36.911C40.6231 37.9855 43.0479 38.5297 45.4997 38.5C48.5797 38.5 50.9457 37.73 52.5802 36.911C53.4393 36.4816 54.2451 35.953 54.9812 35.336L55.1387 35.196L55.1737 35.161L55.1947 35.1435L55.2157 35.1225L55.2227 35.1155L55.2262 35.1085L53.3747 33.25L55.2297 35.105C55.6065 34.7285 55.8598 34.2463 55.9561 33.7225C56.0524 33.1986 55.987 32.6578 55.7687 32.172L48.3802 15.75H49.8747C50.5709 15.75 51.2385 15.4734 51.7308 14.9812C52.2231 14.4889 52.4997 13.8212 52.4997 13.125C52.4997 12.4288 52.2231 11.7611 51.7308 11.2688C51.2385 10.7766 50.5709 10.5 49.8747 10.5H42.0557C41.9034 10.4999 41.7538 10.4601 41.6217 10.3845L37.1067 7.8085C36.1826 7.27987 35.1367 7.00121 34.0722 7H30.6247V2.625ZM5.93217 32.2945C6.92967 32.767 8.44517 33.25 10.4997 33.25C12.5542 33.25 14.0697 32.767 15.0672 32.2945L10.4997 22.1445L5.93217 32.2945ZM40.9322 32.2945C41.9297 32.767 43.4452 33.25 45.4997 33.25C47.5542 33.25 49.0697 32.767 50.0672 32.2945L45.4997 22.1445L40.9322 32.2945Z"
                    fill="white"
                  />
                </svg>
                Explore your litigations
              </Button>

              <Button className="collectionButton2" onClick={onNewLitigationClick}>
                <svg
                  width="49"
                  height="49"
                  viewBox="0 0 49 49"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M48.1548 43.1201L46.9673 38.1089C46.5161 36.2089 44.8061 34.8789 42.8349 34.8789H40.3411V21.1277H42.0274C45.4711 21.1277 48.2499 18.3252 48.2499 14.8814C48.2499 12.4114 46.8011 10.1552 44.5686 9.15766L27.0411 1.27266C25.4261 0.560156 23.5736 0.560156 21.9586 1.27266L4.43111 9.15766C2.19861 10.1552 0.749855 12.4114 0.749855 14.8814C0.749855 18.3252 3.52859 21.1277 6.97234 21.1277H7.49485V34.8789H6.16485C4.1936 34.8789 2.48359 36.2089 2.03234 38.1089L0.844839 43.1201C0.536089 44.3551 0.821093 45.6377 1.62859 46.6589C2.43609 47.6802 3.64735 48.2739 4.97735 48.2739H44.0224C45.3524 48.2739 46.5636 47.6802 47.3711 46.6589C48.1786 45.6377 48.4636 44.3551 48.1548 43.1201ZM23.2886 10.1789H25.7111C26.7086 10.1789 27.4923 10.9627 27.4923 11.9602C27.4923 12.9339 26.7086 13.7414 25.7111 13.7414H23.2886C22.2911 13.7414 21.5074 12.9339 21.5074 11.9602C21.5074 10.9627 22.2911 10.1789 23.2886 10.1789ZM17.2799 34.8789H11.0573V21.1277H17.2799V34.8789ZM26.9936 34.8789H20.8424V21.1277H26.9936V34.8789ZM36.7786 34.8789H30.5561V21.1277H36.7786V34.8789Z"
                    fill="url(#paint0_linear_194_820)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_194_820"
                      x1="-11.8901"
                      y1="-17.5446"
                      x2="47.2965"
                      y2="-2.69771"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FECE76" />
                      <stop offset="1" stopColor="#F78B88" />
                    </linearGradient>
                  </defs>
                </svg>
                Claim authorship of your creation
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}
