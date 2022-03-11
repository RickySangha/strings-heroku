import Moralis from "moralis";
import gql from "graphql-tag";

export const state = () => {
  return {
    user: null,
    ethAddress: "",
    artistAddress: null,
  };
};

export const mutations = {
  setUser(state, _user) {
    state.user = _user.user;
    state.ethAddress = _user.address;
    state.artistAddress = _user.artistAddress;
  },
};

export const actions = {
  async login({ commit }) {
    try {
      let user = Moralis.User.current();
      if (!user) {
        user = await Moralis.authenticate({
          signingMessage: "Log in to Strings",
        });
      }
      let address = user.get("ethAddress");

      const query = `
        query($userId: ID) {
          user(id:$userId) {
            artist{
              artistId
              artistAddress
            }
            tokens{
              tokenId
            }
          }
        }
      `;
      const client = this.app.apolloProvider.defaultClient;
      let res = await client.query({
        query: gql(query),
        variables: { userId: address },
      });
      let artistAddress = null;
      if (res.data.user) {
        artistAddress = res.data.user.artist.artistAddress;
      }

      commit("setUser", { user, address, artistAddress });
    } catch (e) {
      console.log(e.message);
    }
  },

  async checkLoggedIn({ dispatch }) {
    try {
      let user = Moralis.User.current();
      if (user) {
        dispatch("login");
      }
    } catch (e) {
      console.log(e.message);
    }
  },

  async logout({ commit }) {
    try {
      await Moralis.User.logOut();
      commit("setUser", { user: null, address: "" });
    } catch (e) {
      console.log(e);
    }
  },
};

export const getters = {
  getUser(state) {
    return {
      user: state.user,
      ethAddress: state.ethAddress,
      artistAddress: state.artistAddress,
    };
  },
};
