import { Grid, Rating } from '@mui/material';

function UserSuggestions({ wallet = {}, onWalletSelect = () => {} }) {
  return (
    <Grid container direction="column" className="suggestion-text-root">
      <Grid container className="suggestion-text-container" onClick={() => onWalletSelect(wallet)}>
        <p className="suggestion-text-name">{wallet?.user_name}</p>
        <Rating
          key={wallet?.reputation_stars || 0}
          name="simple-controlled"
          color="red"
          className="rating-color"
          readOnly
          value={wallet?.reputation_stars || 0}
        />
      </Grid>
    </Grid>
  );
}
export default UserSuggestions;
