<template>
  <div>
    <h1 v-if="user.ethAddress">Logged in with: {{ user.ethAddress }}</h1>
    <h1 v-else>Connect your metamask to login and see your profile.</h1>
    <h1 v-if="user.artistAddress">
      Your Artist Contract is: {{ user.artistAddress }}
    </h1>
    <h1 v-else>Your dont have an aritst contract yet. Sign up today!</h1>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
};
</script>

<style></style>
