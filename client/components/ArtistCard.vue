<template>
  <v-card class="mx-auto my-12 rounded-xl hover" max-width="300">
    <nuxt-link
      style="text-decoration: none; color: inherit"
      :to="`/artists/${artist.artistId}`"
    >
      <div v-if="artist">
        <v-img
          class="rounded-t-xl"
          height="250"
          src="https://firebasestorage.googleapis.com/v0/b/protime-4fdd5.appspot.com/o/pexels-hygor-sakai-2311713.jpg?alt=media&token=563b9a55-36d0-4299-8acd-523111386612"
        ></v-img>

        <v-card-title>{{ artist.name }}</v-card-title>

        <v-card-text>
          <v-row align="center" class="mx-0">
            <div class="grey--text">@graphtest</div>
          </v-row>
          <v-row align="center" class="mx-0 mt-4">
            <div class="grey--text">
              Joined: {{ artist.createdAtTimestamp }}
            </div>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text>
          <v-chip-group column>
            <v-chip class="deep-purple accent-4 white--text">#Rap</v-chip>
            <v-chip class="deep-purple accent-4 white--text">#Hip-Hop</v-chip>
          </v-chip-group>
        </v-card-text>

        <!-- <v-card-actions>
        <v-btn color="deep-purple lighten-2" text @click="reserve">
          View on OpenSea
        </v-btn>
      </v-card-actions> -->
      </div>
      <v-skeleton-loader v-else type="card-avatar, article, actions">
      </v-skeleton-loader>
    </nuxt-link>
  </v-card>
</template>

<script>
export default {
  props: ["artist"],
  data() {
    return {
      loading: false,
    };
  },
};
</script>

<style scoped></style>
