import {
  Grid, Button, Chip, Typography, Rating,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wallet.css';

function Wallet() {
  const [editable, isEditable] = useState(true);
  const [bio, setBio] = useState('User experience designer');
  const [email, emailVerified] = useState(false);
  const [phone, phoneVerified] = useState(false);
  const [emailText, setEmailText] = useState('sm');
  const [phoneText, setPhoneText] = useState('9090XXXXX');
  const [nameText, setNameText] = useState('John smith');
  const [switchToggle, setSwitchToggle] = useState(false);
  const [nameEdit, setNameEdit] = useState(true);
  const [id, idVerified] = useState(false);
  const emailPattern = /^\w+@[A-Z_a-z]+?\.[A-Za-z]{2,3}$/;
  const phonePattern = /^\+?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}$/im;
  function checkEmail(event_) {
    setEmailText(event_.target.value);
    if (emailPattern.test(emailText)) {
      emailVerified(true);
    } else {
      emailVerified(false);
    }
  }

  function saveAll() {
    setSwitchToggle(false);
    setNameEdit(true);
    isEditable(true);
    setEmailText('');
    emailVerified(false);
    setNameEdit(true);
  }
  function checkPhone(event_) {
    setPhoneText(event_.target.value);
    if (phonePattern.test(phoneText)) {
      phoneVerified(true);
    } else {
      phoneVerified(false);
    }
  }
  function checkId() {
    idVerified(false);
  }
  //  Functions to clear the existing data
  function clearEmail() {
    setEmailText('');
    emailVerified(false);
    checkEmail();
  }
  function clearPhone() {
    phoneVerified(false);
    checkPhone();
  }
  function EditBio(event_) {
    if (event_.keyCode === 13) {
      isEditable(true);
      return bio;
    }
    setBio(event_.target.value);
  }
  function EditName() {
    setNameEdit(false);
    isEditable(false);
  }
  function clearAll() {
    setSwitchToggle(true);
    EditName();
    setEmailText('');
    emailVerified(false);
    clearPhone();
    clearEmail();
  }
  function setEditName(event_) {
    setNameText(event_.target.value);
    if (event_.keyCode === 13) {
      setNameEdit(true);
    }
  }
  // function changeText(event_) {
  //   setBio(event_.target.value);
  //   return bio;
  // }
  useEffect(() => {
    isEditable(editable);

    return () => {};
  }, []);
  const navigate = useNavigate();

  const handleClickNewCreation = () => {
    navigate('/creations/create');
  };

  const handleClickSeeCreation = () => {
    navigate('/creations');
  };

  return (
    <div>
      <div className="wallet-div">
        <div className="inner-heading">
          <b>My Wallet</b>
          <button className="Wallet__div--edit"> Switch User </button>
          { switchToggle ? (<button className="Wallet__div--edit2" onClick={saveAll}>Save user</button>) : (<button className="Wallet__div--edit2" onClick={clearAll}>Edit user</button>) }
        </div>
        <div className="front">
          <div className="front__bkg-photo" />
          <div className="Wallet__main--container">
            <div className="Wallet__main">
              <div className="Wallet__layout">
                <div className="Wallet__layout--container">
                  <div className="front__face-photo" />
                  <Grid item className="userDetailsLeft">
                    <div className="userDetailsLeftHeader">
                      { nameEdit ? (<Typography className="Name" variant="h4" onClick={() => setNameEdit(false)}>{nameText}</Typography>) : (
                        <div className="a">
                          <div className="Wallet__layout--name--container">
                            <input placeholder="Name" onChange={setEditName} className="Wallet__layout--text--input name" />
                          </div>
                          <button className="Wallet__layout--buttonName name" id="name_button" onClick={() => setNameEdit(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
                              <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z" />
                            </svg>
                          </button>
                          {' '}
                        </div>
                      )}
                      { editable ? (
                        <div className="Wallet__layout--bio">
                          <Typography
                            onClick={() => isEditable(!editable)}
                            variant="p"
                            className="Wallet__layout--bio--typography"
                          >
                            { bio }
                          </Typography>
                        </div>
                      ) : (
                        <div className="Wallet__layout--bio">
                          <button className="Wallet__layout--button" onClick={() => isEditable(!editable)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
                              <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z" />
                            </svg>
                          </button>
                          <input placeholder="Edit text here" className="Wallet__layout--text--input" onChange={EditBio} />
                        </div>
                      ) }
                    </div>
                    <div className="userDetailsChip">
                      <Chip className="chip" label="Author of 10 Creations" />
                    </div>
                  </Grid>
                </div>
              </div>
              <div className="Wallet__stars">
                <div>
                  Wallet Rating
                </div>
                <Rating
                  name="text-feedback"
                  style={{
                    padding: 6,
                    backgroundColor: '#2f2f2f40',
                    color: 'yellow',
                    borderRadius: 24,
                  }}
                  value={2}
                  readOnly
                  precision={0.5}
                />
              </div>
              <div className="Wallet__layout--frame">
                <div className="Wallet__layout--text">
                  <div className="Wallet__layout--text--email">
                    {email ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          padding: 1, backgroundColor: 'lightgreen', borderRadius: 40, position: 'absolute',
                        }}
                        width="26"
                        height="26"
                        fill="white"
                        className="bi bi-check"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ padding: 1, backgroundColor: 'red', borderRadius: 40 }} width="26" height="26" fill="currentColor" className="bi bi-exclamation-lg" id="war" viewBox="0 0 16 16">
                        <path d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0L7.005 3.1ZM7 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
                      </svg>
                    )}
                    {email ? (
                      <div>
                        <span className="Wallet__layout--text_span">{emailText}</span>
                        {' '}
                        <button className="Wallet__layout--text--button" onClick={clearEmail} style={{ position: 'relative', top: -5 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                          </svg>
                        </button>
                      </div>
                    ) : (<input placeholder="Email" onChange={checkEmail} className="Wallet__layout--text--input" />)}
                  </div>
                  <div className="Wallet__layout--text--phone" onChange={(checkPhone)}>
                    {phone ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          padding: 1, backgroundColor: 'lightgreen', borderRadius: 40, position: 'relative', top: 3,
                        }}
                        width="26"
                        height="26"
                        fill="white"
                        className="bi bi-check"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                      </svg>
                    ) : ((
                      <svg
                        id="warning-sign"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          padding: 2, backgroundColor: 'red', borderRadius: 40, position: 'relative', top: 0,
                        }}
                        fill="currentColor"
                        className="bi bi-exclamation-lg"
                        viewBox="0 0 16 16"
                      >

                        <path d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0L7.005 3.1ZM7 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
                      </svg>
                    ))}
                    {phone ? (
                      <div>
                        <span>{ phoneText }</span>
                        <button onClick={clearPhone} className="Wallet__layout--text--button" style={{ position: 'relative', top: -5 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0   0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                          </svg>
                        </button>
                      </div>
                    ) : (<input placeholder="Phone" onChange={((event_) => setPhoneText(event_.target.value))} className="Wallet__layout--text--input" />) }
                  </div>
                  <div className="Wallet__layout--text--id" onChange={checkId}>
                    {id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          padding: 1, backgroundColor: 'lightgreen', borderRadius: 40, position: 'relative', top: 3,
                        }}
                        width="26"
                        height="26"
                        fill="white"
                        className="bi bi-check"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                      </svg>
                    )
                      : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            padding: 2, backgroundColor: 'red', borderRadius: 40, position: 'relative', top: 0,
                          }}
                          id="warning-sign"
                          fill="currentColor"
                          className="bi bi-exclamation-lg"
                          viewBox="0 0 16 16"
                        >
                          <path d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0L7.005 3.1ZM7 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
                        </svg>
                      ) }
                    <span className="Wallet__Id--verified">
                      ID Verified
                    </span>
                    <button className="Wallet__layout--text--button" onClick={() => { idVerified(!id); }} style={{ position: 'relative', top: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ position: 'absolute', top: 190, left: 14 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-clock-fill" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                    </svg>
                    {' '}
                    <span style={{ position: 'relative', top: 6 }}>
                      1 Week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Grid container className="userDetails">
            <Grid item md={12} spacing={5} className="userDetailsRight">
              <Button className="collectionButton" onClick={handleClickSeeCreation}>
                <svg width="62" height="63" viewBox="0 0 62 63" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.42616 46.3589C7.32032 47.253 7.32032 48.7022 6.42616 49.6272C5.96365 50.0589 5.37783 50.3055 4.79199 50.3055C4.17533 50.3055 3.5895 50.0589 3.15783 49.6272C1.21533 47.6847 0.166992 45.1563 0.166992 42.443V10.9005C0.166992 5.31971 4.73035 0.756348 10.3112 0.756348H41.8536C44.9061 0.756348 47.7737 2.11305 49.6853 4.45639C50.5178 5.44305 50.3636 6.92304 49.377 7.72471C48.3903 8.52638 46.9411 8.37219 46.1086 7.41636C45.0603 6.12136 43.5186 5.38135 41.8536 5.38135H10.3112C7.28952 5.38135 4.79199 7.84804 4.79199 10.9005V42.443C4.79199 43.923 5.37782 45.3105 6.42616 46.3589Z" fill="white" />
                  <path d="M51.6891 10.5918H20.1466C14.5658 10.5918 10.0024 15.1552 10.0024 20.736V52.2784C10.0024 57.8593 14.5658 62.4226 20.1466 62.4226H51.6891C57.2699 62.4226 61.8333 57.8593 61.8333 52.2784V20.736C61.8333 15.1552 57.2699 10.5918 51.6891 10.5918ZM26.0974 20.551C28.4408 20.551 30.3525 22.4626 30.3525 24.8368C30.3525 27.2109 28.4408 29.1227 26.0974 29.1227C23.7233 29.1227 21.8116 27.2109 21.8116 24.8368C21.8116 22.4626 23.7233 20.551 26.0974 20.551ZM57.2083 52.2784C57.2083 55.3309 54.7416 57.7976 51.6891 57.7976H20.1466C17.0941 57.7976 14.6274 55.3309 14.6274 52.2784V51.3535L22.9832 43.0284C23.5999 42.3809 24.6483 42.3809 25.265 43.0284L27.5775 45.3409C29.9208 47.6843 34.0524 47.6843 36.3958 45.3409L46.5707 35.166C47.1874 34.5493 48.2666 34.5493 48.8832 35.166L57.2083 43.4909V52.2784Z" fill="white" />
                </svg>

                View my creations
              </Button>

              <Button className="collectionButton2" onClick={handleClickNewCreation}>
                <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M52.9268 6.90052C55.6123 9.58499 55.6123 13.942 52.9268 16.6276L47.3301 22.2243L33.3652 8.26263L38.9619 2.66488C41.6475 -0.0204541 46.0088 -0.0204541 48.6943 2.66488L52.9268 6.90052ZM25.792 12.9323C24.8789 11.9225 23.2461 11.9225 22.2363 12.9323L11.1826 23.8034C10.2695 24.8991 8.63673 24.8991 7.63019 23.8034C6.62364 22.8903 6.62364 21.2575 7.63019 20.2477L18.5947 9.28744C21.6133 6.26673 26.5117 6.26673 29.5303 9.28744L44.8916 24.652L24.6533 44.901C19.4971 50.0573 12.9229 53.57 5.76857 54.9987L3.08409 55.5358C2.23868 55.7076 1.36427 55.4391 0.755186 54.7409C0.145674 54.2252 -0.118906 53.3551 0.0500687 52.5065L0.587071 49.8209C2.01739 42.6666 5.53439 36.0924 10.6928 30.9362L27.2959 14.3395L25.792 12.9323Z" fill="url(#paint0_linear_166_1939)" />
                  <defs>
                    <linearGradient id="paint0_linear_166_1939" x1="-14.5727" y1="-20.4781" x2="53.8109" y2="-3.32871" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FECE76" />
                      <stop offset="1" stopColor="#F78B88" />
                    </linearGradient>
                  </defs>
                </svg>

                New creation
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
