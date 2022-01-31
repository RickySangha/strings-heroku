<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" fixed app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn @click.stop="login()" color="white" class="black--text">
        {{ user.user ? user.ethAddress : "Connect Wallet" }}
      </v-btn>
      <v-btn
        v-if="user"
        @click.stop="logout()"
        color="white"
        class="black--text"
      >
        Logout
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" temporary fixed>
    </v-navigation-drawer>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>
<script>
export default {
  data() {
    return {
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Create Edition",
          to: "/",
        },
        {
          icon: "mdi-chart-bubble",
          title: "Mint Edition",
          to: "/mint",
        },
        {
          icon: "mdi-chart-bubble",
          title: "My Minted Editions",
          to: "/edition",
        },
      ],
      miniVariant: false,
      rightDrawer: false,
      title: "My Strings",
    };
  },
  computed: {
    user() {
      return this.$store.getters["auth/getUser"];
    },
  },
  methods: {
    async login() {
      await this.$store.dispatch("auth/login");
    },
    async logout() {
      await this.$store.dispatch("auth/logout");
    },
  },
};
</script>
