import Moralis from "moralis";

export const state = () => {
  return {
    loadedArtists: [],
  };
};

export const mutations = {
  setLoadedArtists(state, _artists) {
    state.loadedArtists = _artists;
  },
};

export const actions = {
  async setLoadedArtists({ commit }) {
    try {
      const Artist = Moralis.Object.extend("Artist");
      const query = new Moralis.Query(Artist);
      const results = await query.find();
      let artists = [];
      results.forEach((res) => {
        artists.push(res.attributes);
      });
      commit("setLoadedArtists", artists);
    } catch (e) {
      console.log(e.message);
    }
  },
};

export const getters = {
  getLoadedArtists(state) {
    return state.loadedArtists;
  },
};
