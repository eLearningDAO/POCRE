import { Grid, Rating } from '@mui/material';

function UserSuggestions({ user = {}, onWalletSelect = () => {} }) {
  return (
    <Grid container direction="column">
      <Grid container className="suggestion-text-container" onClick={() => onWalletSelect(user)}>
        <p className="suggestion-text-name">{user?.user_name}</p>
        <Rating
          key={user?.reputation_stars || 0}
          name="simple-controlled"
          color="red"
          className="rating-color"
          readOnly
          value={user?.reputation_stars || 0}
        />
      </Grid>
    </Grid>
  );
}
export default UserSuggestions;
