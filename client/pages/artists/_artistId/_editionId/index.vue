<template>
  <div>
    <div v-if="!loading">
      <v-img max-width="250" :src="`${baseUrl}${edition.imageHash}`"></v-img>
      <audio controls :src="`${baseUrl}${edition.musicHash}`" />
      <p>Artist Name: {{ artist.name }}</p>
      <p>Artist Symbol: {{ artist.symbol }}</p>
      <p>Sale Price: {{ price }} ETH</p>
      <p>Sold: {{ edition.numSold }}/{{ edition.quantity }}</p>
      <v-btn @click.stop="mint()" color="white" class="black--text">
        Mint
      </v-btn>
      <h2>Owners:</h2>
      <v-list>
        <v-list-item v-for="token in edition.tokens" :key="token.id">
          <!-- <v-list-item-avatar>
            <v-img :src="item"></v-img>
          </v-list-item-avatar> -->
          <v-list-item-content>
            <h4>Token Id:{{ token.tokenId }}</h4>
            <v-list-item-title>Owner: {{ token.owner.id }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <v-overlay :value="minting" class="text-center">
      <div class="mb-6">
        <h2>Accept the eth transaction to Mint your NFT!</h2>
        <h3>You will be redirected when this completes.</h3>
      </div>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { ethers } from "ethers";
import gql from "graphql-tag";

import ArtistContract from "~/artificats/contracts/ArtistV2.sol/ArtistV2.json";

export default {
  data() {
    return {
      edition: null,
      artist: null,
      baseUrl: "https://ipfs.moralis.io:2053/ipfs/",
      loading: true,
      minting: false,
    };
  },
  computed: {
    price() {
      return ethers.utils.formatEther(this.edition.price);
    },
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
  methods: {
    async mint() {
      try {
        if (!this.user.artistAddress) {
          return alert("Must log in first");
        }
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let network = await provider.getNetwork();

        if (network.name != "rinkeby") {
          return alert(
            "Wrong netwrok! Please connect to the eth rinkeby network."
          );
        }
        this.minting = true;
        // Instantiate an artist JS contract object
        let artist = new ethers.Contract(
          this.artist.artistAddress,
          ArtistContract.abi,
          signer
        );

        //Create transaction and send eth payment
        let buyEditionTx = await artist.buyEdition(this.edition.editionId, {
          value: this.edition.price,
        });
        // wait until the tx is mined

        await buyEditionTx.wait();

        this.$router.push("/myNFTs");
      } catch (e) {
        if (e.error) {
          alert(e.error.message);
        } else {
          console.log(e.message);
        }
        this.minting = false;
      }
    },
    async getEdition() {
      try {
        const query = gql`
          query ($artistId: BigInt, $editionId: BigInt) {
            artists(where: { artistId: $artistId }) {
              id
              artistId
              name
              symbol
              artistAddress
              editions(where: { editionId: $editionId }) {
                editionId
                price
                quantity
                numSold
                uriHash
                imageHash
                musicHash
                createdAtTimestamp
                tokens {
                  id
                  tokenId
                  owner {
                    id
                  }
                }
              }
            }
          }
        `;
        // const client = this.$apollo.getClient();
        let res = await this.$apollo.query({
          query: query,
          variables: {
            artistId: this.$route.params.artistId,
            editionId: this.$route.params.editionId,
          },
        });

        console.log(res.data.artists[0]);
        this.edition = res.data.artists[0].editions[0];
        this.artist = res.data.artists[0];

        this.loading = false;
      } catch (e) {
        console.log(e);
      }
    },
  },
  async mounted() {
    console.log(this.$route.params);
    this.getEdition();
    // let provider = new ethers.providers.Web3Provider(window.ethereum);
    // let artist = new ethers.Contract(
    //   this.address,
    //   ArtistContract.abi,
    //   provider
    // );
    // this.name = await artist.name();
    // this.symbol = await artist.symbol();
    // let edition = await artist.editions(this.editionId);
    // this.edition = edition;
    // this.price = Moralis.Units.FromWei(edition.price);

    // const res = await fetch(
    //   `https://ipfs.moralis.io:2053/ipfs/${edition.hash}`
    // );
    // this.metadata = await res.json();
    // this.audio = this.metadata.audio_url;
  },
};
</script>

<style></style>
