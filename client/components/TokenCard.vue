<template>
  <v-card class="mx-auto my-12 rounded-xl hover" max-width="200">
    <div v-if="!loading">
      <div>
        <div class="pb-0">
          <v-img
            contain
            class="rounded-xl"
            :src="`${baseUrl}${token.edition.imageHash}`"
          ></v-img>
          <audio
            style="max-width: 200px"
            controls
            :src="`${baseUrl}${token.edition.musicHash}`"
          />
        </div>
        <!-- <v-card-title> {{ uri.name }} </v-card-title> -->
        <!-- <v-card-subtitle> {{ uri.description }} </v-card-subtitle> -->
        <v-card-title>Id: {{ token.tokenId }}</v-card-title>

        <v-card-text>
          <v-row align="center" class="mx-0 mt-0">
            <div class="grey--text">
              owner: {{ token.owner.id.slice(0, 12) }}..
            </div>
          </v-row>
          <v-row align="center" class="mx-0 mt-4">
            <div class="grey--text">
              Minted On: {{ token.edition.mintedAtTimestamp }}
            </div>
          </v-row>
        </v-card-text>
      </div>
      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          href="https://testnets.opensea.io/collection/graph-test-v2"
          target="_blank"
          class="black--text"
          color="white"
          >View on OpenSea</v-btn
        >
      </v-card-actions>
    </div>
    <v-skeleton-loader v-else type="card-avatar, article, actions">
    </v-skeleton-loader>
  </v-card>
</template>

<script>
import { ethers } from "ethers";
export default {
  props: ["token", "loading"],
  data() {
    return {
      uri: {},
      baseUrl: "https://ipfs.moralis.io:2053/ipfs/",
    };
  },
  async created() {
    // TODO: Commented out fornow due to CORS error. In future we should index this onto the graph
    // let res = await fetch(`${this.baseUrl}${this.edition.uriHash}`, {
    //   type: "GET" /* or type:"GET" or type:"PUT" */,
    //   dataType: "json",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   });
    //   let uri = await res.json();
    //   // this.image = uri.image;
    //   this.uri = uri;
  },
};
</script>

<style></style>
