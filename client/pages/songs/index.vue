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
  data() {
    return {
      editions: [],
      loading: false,
    };
  },
  methods: {
    async getEditions() {
      try {
        const query = gql`
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
        `;
        // const client = this.$apollo.getClient();
        let res = await this.$apollo.query({
          query: query,
        });

        this.editions = res.data.editions;

        this.loading = false;
      } catch (e) {
        console.log(e.message);
      }
    },
  },
  mounted() {
    this.getEditions();
  },
};
</script>

<style></style>
