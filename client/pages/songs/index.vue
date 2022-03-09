<template>
  <v-container fluid>
    <h1>All Songs</h1>
    <v-row dense>
      <v-col v-for="edition in editions" :key="edition.uriHash">
        <EditionCard :edition="edition" :artist="edition.artist" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
export default {
  apollo: {
    editions: gql`
      query {
        editions {
          artist {
            name
            symbol
            artistId
          }
          editionId
          price
          quantity
          numSold
          uriHash
          imageHash
          musicHash
          startTime
          endTime
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
