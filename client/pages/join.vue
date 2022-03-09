<template>
  <v-card v-if="!user.artistAddress">
    <div class="d-flex justify-center">
      <v-progress-circular
        v-if="loading"
        :rotate="90"
        :size="100"
        :width="15"
        indeterminate
        color="red"
        class="mt-6"
      />
    </div>
    <v-card-title class="headline flex justify-center">
      {{ cardTitle }}
    </v-card-title>
    <div v-if="!loading" class="pa-6">
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
          label="Artist Address"
          hide-details="auto"
          v-model="artistAddress"
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
  <h1 v-else>This eth address has already signed up as an Artist.</h1>
</template>

<script>
import { ethers } from "ethers";
import Moralis from "moralis";

import ArtistCreatorContract from "../artificats/contracts/ArtistCreatorV2.sol/ArtistCreatorV2.json";
const ArtistCreatorAddress = "0x31d421cc4d5D767bf9b709C9cEd9F630C20175D4";

export default {
  data() {
    return {
      name: "",
      symbol: "",
      artistAddress: "",
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
    async watchContractEvent(address) {
      let options1 = {
        chainId: "0x1",
        address: address,
        topic:
          "EditionCreated(uint256, address, uint256, uint32, uint32, uint32, uint32, string)",
        sync_historical: false,
        abi: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "editionId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "artistAddress",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "quantity",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "royaltyBPS",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "startTime",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "uint32",
              name: "endTime",
              type: "uint32",
            },
            {
              indexed: false,
              internalType: "string",
              name: "ipfsHash",
              type: "string",
            },
          ],
          name: "NewEditionCreated",
          type: "event",
        },
        tableName: "EditionCreated",
      };

      let options2 = {
        chainId: "0x1",
        address: address,
        topic: "EditionPurchased(uint256, uint256, uint32, address)",
        sync_historical: false,
        abi: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "editionId",
              name: "editionId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "tokenId",
              name: "artistAddress",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "numSold",
              name: "price",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "buyer",
              type: "address",
            },
          ],
          name: "NewEditionPurchases",
          type: "event",
        },
        tableName: "EditionPurchased",
      };

      Moralis.Cloud.run("watchContractEvent", options1, { useMasterKey: true });
      Moralis.Cloud.run("watchContractEvent", options2, { useMasterKey: true });
    },
  },
};
</script>

<style></style>
