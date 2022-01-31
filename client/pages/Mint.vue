<template>
  <div>
    <v-img max-width="250" :src="metadata.image"></v-img>
    <audio controls :src="audio" />
    <p>Name: {{ name }}</p>
    <p>Symbol: {{ symbol }}</p>
    <p>Price: {{ price }} ETH</p>
    <p>Sold: {{ edition.numSold }}/{{ edition.quantity }}</p>
    <v-btn @click.stop="mint()" color="white" class="black--text"> Mint </v-btn>
  </div>
</template>

<script>
import { ethers } from "ethers";
import Moralis from "moralis";

import ArtistContract from "../artificats/contracts/Artist.sol/Artist.json";

export default {
  data() {
    return {
      address: "0x2eF0399c5E2a38262a167BafEd51715e69Cf2c95",
      editionId: 1,
      name: "",
      symbol: "",
      price: "",
      edition: {},
      metadata: {},
      audio: "",
    };
  },
  methods: {
    async mint() {
      try {
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // Instantiate an artist JS contract object
        let artist = new ethers.Contract(
          this.address,
          ArtistContract.abi,
          signer
        );
        console.log(signer);

        //Create transaction and send eth payment
        let priceInWei = Moralis.Units.ETH(this.price);
        let buyEditionTx = await artist.buyEdition(this.editionId, {
          value: priceInWei,
        });
        // wait until the tx is mined
        await buyEditionTx.wait();

        this.$router.push("/edition");
      } catch (e) {
        console.log(e.message);
      }
    },
  },
  async mounted() {
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let artist = new ethers.Contract(
      this.address,
      ArtistContract.abi,
      provider
    );
    this.name = await artist.name();
    this.symbol = await artist.symbol();
    let edition = await artist.editions(this.editionId);
    this.edition = edition;
    this.price = Moralis.Units.FromWei(edition.price);

    const res = await fetch(
      `https://ipfs.moralis.io:2053/ipfs/${edition.hash}`
    );
    this.metadata = await res.json();
    this.audio = this.metadata.audio_url;
  },
};
</script>

<style></style>
