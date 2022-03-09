<template>
  <div>
    <h3>Name: {{ artist.name }}</h3>
    <h3>Symbol: {{ artist.symbol }}</h3>
    <h3>Address: {{ artist.artistAddress }}</h3>
    <v-container flex>
      <div class="d-flex justify-space-around">
        <div v-for="edition in artist.editions" :key="edition.editionId">
          <EditionCard :edition="edition" :artist="artist" :loading="loading" />
        </div>
      </div>
      <h1 v-if="!hasEditions">This Artist does not have any editions yet.</h1>
    </v-container>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  data() {
    return {
      artist: {},
      loading: true,
      hasEditions: true,
    };
  },
  methods: {
    async getArtist() {
      try {
        const query = `
  query($artistId: BigInt) {
    artists(where:{artistId:$artistId}) {
      id
      artistId
      name
      symbol
      artistAddress
      editions{
        editionId
        price
        quantity
        numSold
        uriHash
        imageHash
        musicHash
        createdAtTimestamp
      }
    }
  }
`;
        // const client = this.$apollo.getClient();
        let res = await this.$apollo.query({
          query: gql(query),
          variables: { artistId: this.$route.params.artistId },
        });

        this.artist = res.data.artists[0];
        if (!this.artist.editions.length) {
          this.hasEditions = false;
        }

        this.loading = false;
      } catch (e) {
        console.log(e.message);
      }
    },
  },

  mounted() {
    this.getArtist();
  },
};
</script>

<style></style>
