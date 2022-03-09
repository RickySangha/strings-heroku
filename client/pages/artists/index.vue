<template>
  <v-container fluid>
    <v-row dense>
      <v-col v-for="artist in artists" :key="artist.artistId">
        <ArtistCard :artist="artist" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
export default {
  apollo: {
    artists: gql`
      query {
        artists {
          name
          symbol
          artistId
          createdAtTimestamp
        }
      }
    `,
  },
  // computed: {
  //   // artists() {
  //   //   return this.$store.getters["artists/getLoadedArtists"];
  //   // },
  // },
  // methods: {},
  // async mounted() {
  //   await this.$store.dispatch("artists/setLoadedArtists");
  // },
};
</script>

<style></style>
