import create from 'zustand';

const useWalletStore = create((set) => ({
  userUpdatedResult: [],
  userData: {},
  userCollectionCount: 0,
  userProfileImageUrl: '',
  updateUser: async (user, userId, imageUrl) => {
    const url = `https://pocre-api.herokuapp.com/v1/users/${userId}`;
    const requestOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: user.name,
        wallet_address: user.walletAddress,
        user_bio: user.bio,
        phone: user.phone,
        email_address: user.email,
        verified_id: '28y9gd27g2g237g80hnibhi',
        reputation_stars: 0,
        image_url: imageUrl,
      }),
    };

    const userResponse = await fetch(url, requestOptions).then((response) => response.json());
    if (userResponse.code >= 400) throw new Error('Failed to fetch material');
    set({ userUpdatedResult: userResponse.results });
  },
  getUserById: async (userId) => {
    const url = `https://pocre-api.herokuapp.com/v1/users/${userId}`;
    const userResponse = await fetch(url).then((response) => response.json());
    if (userResponse.code >= 400) throw new Error('Failed to fetch material');

    const user = {
      name: userResponse.user_name,
      email: userResponse.email_address,
      phone: userResponse.phone,
      bio: userResponse.user_bio,
      walletAddress: userResponse.wallet_address,
      walletType: userResponse.verified_id,
      reputationStars: userResponse.reputation_stars,
    };
    set({ userData: user });
  },

  getUserCollectionCount: async (userId) => {
    const url = `https://pocre-api.herokuapp.com/v1//creations?page=1&limit=100&descend_fields[]=creation_date&query=${userId}&search_fields[]=author_id`;
    const userCollectionResponse = await fetch(url).then((response) => response.json());
    if (userCollectionResponse.code >= 400) throw new Error('Failed to fetch material');
    set({ userCollectionCount: userCollectionResponse.results.length });
  },

  uploadUserImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'zqrypurh');
    const requestOptions = {
      method: 'POST',
      body: formData,
    };
    const userProfileImageUpload = await fetch('https://api.cloudinary.com/v1_1/dia0ztihb/image/upload', requestOptions)
      .then((response) => response.json());
    if (userProfileImageUpload.code >= 400) throw new Error('Failed to fetch material');
    set({ userProfileImageUrl: userProfileImageUpload.url });
  },

}));

export default useWalletStore;
