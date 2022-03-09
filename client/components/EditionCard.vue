<template>
  <v-card class="mx-auto my-12 rounded-xl hover" max-width="200">
    <div v-if="!loading">
      <nuxt-link
        style="text-decoration: none; color: inherit"
        :to="`/artists/${artist.artistId}/${edition.editionId}`"
      >
        <div>
          <div class="pb-0">
            <v-img
              contain
              class="rounded-xl"
              :src="`${baseUrl}${edition.imageHash}`"
            ></v-img>
            <audio
              style="max-width: 200px"
              controls
              :src="`${baseUrl}${edition.musicHash}`"
            />
          </div>
          <!-- <v-card-title> {{ uri.name }} </v-card-title> -->
          <!-- <v-card-subtitle> {{ uri.description }} </v-card-subtitle> -->
          <v-card-title>Id: {{ edition.editionId }}</v-card-title>
          <v-divider />
          <v-card-text>
            <v-row align="center" class="mx-0 mt-0">
              <div class="grey--text">Price: {{ price }} Eth</div>
            </v-row>
            <v-row align="center" class="mx-0">
              <div class="grey--text">
                Sold: {{ edition.numSold }}/{{ edition.quantity }}
              </div>
            </v-row>
            <v-row align="center" class="mx-0 mt-4">
              <div class="grey--text">
                Created: {{ edition.createdAtTimestamp }}
              </div>
            </v-row>
          </v-card-text>
        </div>
      </nuxt-link>
    </div>
    <v-skeleton-loader v-else type="card-avatar, article, actions">
    </v-skeleton-loader>
  </v-card>
</template>

<script>
import { ethers } from "ethers";
export default {
  props: ["edition", "artist", "loading"],
  data() {
    return {
      uri: {},
      baseUrl: "https://ipfs.moralis.io:2053/ipfs/",
    };
  },
  computed: {
    price() {
      return ethers.utils.formatEther(this.edition.price);
    },
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
