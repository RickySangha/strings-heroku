import Moralis from "moralis";

export const state = () => {
  return {
    user: null,
    ethAddress: "",
  };
};

export const mutations = {
  setUser(state, _user) {
    state.user = _user.user;
    state.ethAddress = _user.address;
  },
};

export const actions = {
  async login({ commit }) {
    try {
      let user = Moralis.User.current();
      if (!user) {
        user = await Moralis.authenticate({
          signingMessage: "Log in using Moralis",
        });
      }
      console.log("logged in user:", user);
      console.log(user.get("ethAddress"));
      let address = user.get("ethAddress");
      commit("setUser", { user, address });
    } catch (error) {
      console.log(error);
    }
  },

  async logout() {
    await Moralis.User.logOut();
    commit("setUser", { user: null, address: "" });
  },
};

export const getters = {
  getUser(state) {
    return { user: state.user, ethAddress: state.ethAddress };
  },
};
