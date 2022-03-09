<template>
  <v-container flex>
    <div v-if="tokens.length">
      <h1>My NFTs</h1>
      <v-row dense>
        <v-col v-for="token in tokens" :key="token.tokenId">
          <TokenCard :loading="loading" :token="token" />
        </v-col>
      </v-row>
    </div>
    <h1 v-else>You do not have any minted tokens yet.</h1>
  </v-container>
</template>

<script>
import gql from "graphql-tag";

export default {
  data() {
    return {
      loading: true,
      tokens: [],
    };
  },
  computed: {
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
  methods: {
    async getTokens() {
      try {
        const query = `
          query($userId: ID) {
            user(id:$userId) {
              tokens{
                tokenId
                mintedAtTimestamp
                edition{
                  editionId
                  uriHash
                  imageHash
                  musicHash
                }
                owner{
                  id
                }
              }
            }
          }`;
        let res = await this.$apollo.query({
          query: gql(query),
          variables: { userId: this.user.ethAddress },
        });
        console.log("res", res.data);
        this.tokens = res.data.user.tokens;
        this.loading = false;
      } catch (e) {
        console.log(e.message);
      }
    },
  },
  created() {
    this.getTokens();
  },
};
</script>
