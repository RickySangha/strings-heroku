<template>
  <v-container fluid>
    <v-row dense>
      <v-col v-for="nft in nfts" :key="nft.tokenId">
        <NFTCard :nft="nft" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Moralis from "moralis";

export default {
  data() {
    return {
      nfts: [],
    };
  },
  async mounted() {
    this.nfts = await Moralis.Cloud.run("usersNfts", {
      tokenAddress: "0x2ef0399c5e2a38262a167bafed51715e69cf2c95",
    });
    console.log(this.nfts);
  },
  methods: {},
};
</script>

<style></style>
