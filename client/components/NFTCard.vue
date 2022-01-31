<template>
  <v-card class="mx-auto my-12" max-width="300">
    <v-img :src="uri.image" contain></v-img>
    <audio controls :src="uri.audio_url" />
    <v-card-title> {{ uri.name }} </v-card-title>
    <v-card-subtitle> {{ uri.description }} </v-card-subtitle>
    <v-card-actions>
      <v-btn
        :href="`https://testnets.opensea.io/assets/${nft.tokenAddress}/${nft.tokenId}`"
        target="_blank"
        color="white"
        class="black--text"
      >
        View on OpenSea
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ["nft"],
  data() {
    return {
      uri: {},
    };
  },
  async created() {
    let res = await fetch(this.nft.tokenUri, {
      type: "GET" /* or type:"GET" or type:"PUT" */,
      dataType: "json",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let uri = await res.json();
    this.image = uri.image;
    this.uri = uri;
  },
};
</script>

<style></style>
