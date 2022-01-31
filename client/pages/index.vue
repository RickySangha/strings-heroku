<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card class="logo py-4 d-flex justify-center">
        <EthLogo />
      </v-card>
      <v-card>
        <v-card-title class="headline"> Create an Edition </v-card-title>
        <div class="pa-6">
          <v-form
            @submit.prevent="createEdition()"
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-file-input
              label="Upload cover image"
              accept="image/*"
              chips
              show-size
              truncate-length="28"
              v-model="imageFile"
            ></v-file-input>
            <v-file-input
              label="Upload audio file"
              accept=".mp3"
              chips
              show-size
              truncate-length="28"
              v-model="audioFile"
            ></v-file-input>
            <v-text-field
              type="number"
              label="Price (ETH)"
              :rules="inputRules"
              hide-details="auto"
              v-model="price"
            ></v-text-field>
            <v-text-field
              type="number"
              label="Quantity"
              :rules="inputRules"
              hide-details="auto"
              v-model="quantity"
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
              <v-btn type="submit" color="primary"> Create </v-btn>
            </v-card-actions>
          </v-form>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ethers, providers } from "ethers";
import Moralis from "moralis";

import ArtistContract from "../artificats/contracts/Artist.sol/Artist.json";

const ArtistAddress = "0x2eF0399c5E2a38262a167BafEd51715e69Cf2c95";
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
        (value) => (value && value >= 0.1) || "Min contribution is 0.1 ETH",
      ],
      valid: true,
      price: null,
      quantity: null,
      royalty: 250,
      startTime: 1643167718,
      endTime: 1646134114,
      hash: "test",
      imageFile: null,
      audioFile: null,
    };
  },
  methods: {
    async uploadFilesToIPFS() {
      // Upload cover photo file to IPFS
      const imageFileName = "cover.jpg";
      const moralisImageFile = new Moralis.File(imageFileName, this.imageFile);
      await moralisImageFile.saveIPFS();
      console.log(moralisImageFile.ipfs(), moralisImageFile.hash());
      const imageHash = moralisImageFile.hash;

      // Upload cover audio file to IPFS
      const audioFileName = "audio.mp3";
      const moralisAudioFile = new Moralis.File(audioFileName, this.audioFile);
      await moralisAudioFile.saveIPFS();
      console.log(moralisAudioFile.ipfs(), moralisAudioFile.hash());
      const audioHash = moralisAudioFile.hash;

      // Upload metadata to IPFS
      const metadata = {
        name: "Shook Ones, Part II",
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
      console.log(file.ipfs(), file.hash());
      return file.hash();
    },
    async createEdition() {
      try {
        const metadataHash = await this.uploadFilesToIPFS();

        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // Instantiate an artist JS contract object
        let artist = new ethers.Contract(
          ArtistAddress,
          ArtistContract.abi,
          signer
        );
        console.log(signer);

        let createEditionTx = await artist.createEdition(
          Moralis.Units.ETH(this.price),
          this.quantity,
          this.royalty,
          this.startTime,
          this.endTime,
          metadataHash
        );
        // wait until the tx is mined
        await createEditionTx.wait();
        // TODO: Add in redirect to mint page of edition
      } catch (e) {
        console.log(e.message);
      }
    },
  },
};
</script>
