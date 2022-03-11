<template>
  <div>
    <v-overlay :value="loading">
      <h2>Waiting for eth transaction.</h2>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-card v-if="!loading && user.ethAddress && !user.artistAddress">
      <v-card-title class="headline flex justify-center">
        {{ cardTitle }}
      </v-card-title>
      <div class="pa-6">
        <v-form @submit.prevent="createArtist()" ref="form" lazy-validation>
          <v-text-field
            type="text"
            label="Artist Name"
            hide-details="auto"
            v-model="name"
          ></v-text-field>
          <v-text-field
            type="text"
            label="Artist Symbol"
            hide-details="auto"
            v-model="symbol"
          ></v-text-field>

          <v-text-field
            type="text"
            label="Base URI"
            hide-details="auto"
            v-model="baseURI"
          ></v-text-field>
          <v-card-actions>
            <v-spacer />
            <v-btn type="submit" color="primary"> Create </v-btn>
          </v-card-actions>
        </v-form>
      </div>
    </v-card>
    <h1 v-if="!loading && user.ethAddress && user.artistAddress">
      This eth address has already signed up as an Artist.
    </h1>
    <h1 v-if="!loading && !user.ethAddress">Please connect your wallet.</h1>
  </div>
</template>

<script>
import { ethers } from "ethers";

import ArtistCreatorContract from "../artificats/contracts/ArtistCreatorV2.sol/ArtistCreatorV2.json";
const ArtistCreatorAddress = "0xE4EC7897312bA977d2AE18874A3bCA9274371B63";

export default {
  data() {
    return {
      name: "",
      symbol: "",
      baseURI: "https://ipfs.moralis.io:2053/ipfs/",
      loading: false,
      cardTitle: "Join as Artist!",
    };
  },
  computed: {
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
  methods: {
    async createArtist() {
      try {
        this.loading = true;
        this.cardTitle = "Waiting for eth transaction to complete.";
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let network = await provider.getNetwork();

        if (network.name != "rinkeby") {
          return alert(
            "Wrong netwrok! Please connect to the eth rinkeby network."
          );
        }
        // Instantiate an artist JS contract object
        let artist = new ethers.Contract(
          ArtistCreatorAddress,
          ArtistCreatorContract.abi,
          signer
        );

        let createEditionTx = await artist.createArtist(
          this.name,
          this.symbol,
          this.baseURI
        );
        // wait until the tx is mined
        const receipt = await createEditionTx.wait();
        console.log(receipt.events);

        let createdArtistEvent;

        receipt.events.forEach((event) => {
          if (event.event === "CreatedArtist") {
            createdArtistEvent = event;
          }
        });
        this.$router.go();

        this.loading = false;
      } catch (e) {
        alert(e.error.message);
      }
    },
  },
};
</script>

<style></style>
