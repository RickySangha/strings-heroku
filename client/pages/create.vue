<template>
  <div>
    <v-row
      v-if="user.ethAddress && user.artistAddress"
      justify="center"
      align="center"
    >
      <v-col cols="12" sm="8" md="6">
        <v-card class="logo py-4 d-flex justify-center">
          <!-- <EthLogo v-else /> -->
        </v-card>
        <v-card>
          <v-card-title class="headline flex justify-center">
            Create an Edition
          </v-card-title>
          <div class="pa-6">
            <v-form
              @submit.prevent="createEdition()"
              ref="form"
              v-model="valid"
            >
              <v-file-input
                label="Upload cover image"
                accept="image/*"
                chips
                show-size
                truncate-length="28"
                v-model="imageFile"
                :rules="[(value) => !!value || 'Required.']"
                required
              ></v-file-input>
              <v-file-input
                label="Upload audio file"
                accept=".mp3"
                chips
                show-size
                truncate-length="28"
                v-model="audioFile"
                :rules="[(value) => !!value || 'Required.']"
                required
              ></v-file-input>
              <v-text-field
                type="text"
                label="Name"
                hide-details="auto"
                v-model="name"
                :rules="[(value) => !!value || 'Required.']"
                required
              ></v-text-field>
              <v-text-field
                type="number"
                label="Price (ETH)"
                :rules="[
                  (value) => !!value || 'Required.',
                  (value) =>
                    (value && value >= 0.01) || 'Min price is 0.01 ETH',
                ]"
                hide-details="auto"
                v-model="price"
                required
              ></v-text-field>
              <v-text-field
                type="number"
                label="Quantity"
                :rules="[(value) => !!value || 'Required.']"
                hide-details="auto"
                v-model="quantity"
                required
              ></v-text-field>
              <!-- <v-text-field
              label="Royalty (%)"
              :rules="inputRules"
              hide-details="auto"
              v-model="royalty"
            ></v-text-field>
            <v-text-field
              label="Start time"
              :rules="inputRules"
              hide-details="auto"
              v-model="startTime"
            ></v-text-field>
            <v-text-field
              label="End time"
              :rules="inputRules"
              hide-details="auto"
              v-model="endTime"
            ></v-text-field> -->
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :disabled="loading || !valid"
                  type="submit"
                  color="primary"
                >
                  Create
                </v-btn>
              </v-card-actions>
            </v-form>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="user.ethAddress && !user.artistAddress">
      <h1>You need to sign up for an Artist account to use this feature.</h1>
    </v-row>
    <v-row v-if="!user.ethAddress">
      <h1>Please connect your wallet.</h1>
    </v-row>
    <v-overlay :value="loading" class="text-center">
      <div class="mb-6">
        <h2>{{ progressMessage }}</h2>
      </div>
      <v-progress-circular v-if="loading" :size="100" :value="progressValue">
        {{ progressValue }}
      </v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { ethers } from "ethers";
import Moralis from "moralis";

import ArtistContract from "../artificats/contracts/ArtistV2.sol/ArtistV2.json";

const baseIPFSURL = "https://ipfs.moralis.io:2053/ipfs/";
// const imageHash = "QmY4qEMgmZXd5NHhgrYnUSwuqJN6c2RvfACYyBrPs6mNqo";
// const mp3Hash = "QmNVunkqGb2rWv5ECPbxT3jtctvNGwswJDPUc78P3Czxi8";
// const metadataHash = "QmeEywLWPrMGA4zCCeZ8zYf6wNwiNpUkjFKdYuSkDsqA6p";

export default {
  data() {
    return {
      contracts: null,
      signer: null,
      balance: 0,
      accounts: null,
      personContract: null,
      person: "",
      inputRules: [
        (value) => !!value || "Required.",
        (value) => (value && value >= 0.01) || "Min contribution is 0.1 ETH",
      ],
      name: "",
      price: null,
      quantity: null,
      royalty: 250,
      startTime: 1643167718,
      endTime: 1846134114,
      hash: "test",
      imageFile: null,
      audioFile: null,
      loading: false,
      valid: false,
      progressValue: 0,
      progressMessage: "",
    };
  },
  computed: {
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
  methods: {
    async uploadFilesToIPFS() {
      // Upload cover photo file to IPFS
      this.progressMessage = "Uploading cover photo to IPFS";
      const imageFileName = "cover.jpg";
      const moralisImageFile = new Moralis.File(imageFileName, this.imageFile);
      await moralisImageFile.saveIPFS();
      console.log(moralisImageFile.ipfs(), moralisImageFile.hash());
      const imageHash = moralisImageFile.hash();
      this.progressValue = 30;

      // Upload cover audio file to IPFS
      this.progressMessage = "Uploading music file to IPFS";
      const audioFileName = "audio.mp3";
      const moralisAudioFile = new Moralis.File(audioFileName, this.audioFile);
      await moralisAudioFile.saveIPFS();
      console.log(moralisAudioFile.ipfs(), moralisAudioFile.hash());
      const audioHash = moralisAudioFile.hash();
      this.progressValue = 60;

      // Upload metadata to IPFS
      this.progressMessage = "Uploading metadata to IPFS";
      const metadata = {
        name: this.name,
        external_url: "google.com",
        image: `${baseIPFSURL}${imageHash}`,
        audio_url: `${baseIPFSURL}${audioHash}`,
        animation_url: `${baseIPFSURL}${audioHash}`,
        attributes: [
          {
            trait_type: "Record",
            value: "Song Edition",
          },
          {
            value: "Genesis",
          },
        ],
      };
      const file = new Moralis.File("metadata.json", {
        base64: btoa(JSON.stringify(metadata)),
      });
      await file.saveIPFS();
      let uriHash = file.hash();
      this.progressValue = 90;
      console.log(file.ipfs(), file.hash());
      return { imageHash, audioHash, uriHash };
    },
    async createEdition() {
      try {
        if (!this.user.artistAddress) {
          return alert("Must log in first");
        }
        // const metadataHash = "lkjl";
        // TODO: put provider and signer functions in store to avoid duplicate code
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let network = await provider.getNetwork();

        if (network.name != "rinkeby") {
          return alert(
            "Wrong netwrok! Please connect to the eth rinkeby network."
          );
        }

        this.loading = true;

        const { imageHash, audioHash, uriHash } =
          await this.uploadFilesToIPFS();

        this.progressMessage = "Waiting for ethereum transaction";

        // Instantiate an artist JS contract object
        let artist = new ethers.Contract(
          this.user.artistAddress,
          ArtistContract.abi,
          signer
        );

        let createEditionTx = await artist.createEdition(
          ethers.utils.parseEther(this.price),
          this.quantity,
          this.royalty,
          this.startTime,
          this.endTime,
          uriHash,
          imageHash,
          audioHash
        );
        // wait until the tx is mined
        const receipt = await createEditionTx.wait();
        this.progressValue = 100;
        // TODO: Find EditionCreated event and use the data to update Moralis DB
        let createdEditionEvent;
        receipt.events.forEach((event) => {
          if (event.event === "CreatedEdition") {
            createdEditionEvent = event;
          }
        });
        console.log(createdEditionEvent);
        this.loading = false;
        this.progressMessage = "Create an Edition";
        this.progressValue = 0;

        // this.$router.push('/editions/')
        // TODO: Add in redirect to mint page of edition
      } catch (e) {
        alert(e.error.message);
      }
    },
  },
};
</script>
