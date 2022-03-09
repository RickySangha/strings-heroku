<template>
  <v-container fluid>
    <v-row dense>
      <v-col v-for="nft in nfts" :key="nft.tokenId">
        <EditionCard :nft="nft" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Moralis from "moralis";
import { ethers } from "ethers";

export default {
  data() {
    return {
      nfts: [],
    };
  },
  methods: {
    async getEditions() {
      const query = `
  query($artistId: BigInt) {
    editions(where:{artistId:$artistId}) {
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
      }
    }
  }
`;
      const client = this.$apollo.getClient();
      let res = await this.$apollo.query({
        query: gql(query),
        variables: { artistId: this.$route.params.artistId },
      });
      this.artist = res.data.artists[0];
    },
  },
  async mounted() {
    console.log("Query:");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log(provider);
      // this.getEditions();
      // const res = await Moralis.Cloud.run("usersNfts", {
      //   tokenAddress: "0x8746d80b767b86b4314e19b19783c5f60a5733e3",
      // });

      // res.forEach((nft) => {
      //   this.nfts.push(nft);
      //   console.log(nft.tokenUri);
      // });
      // // this.nfts = res;
      // // console.log(res);
    } catch (e) {
      console.log(e.message);
    }
  },
  methods: {},
};
</script>

<style></style>
