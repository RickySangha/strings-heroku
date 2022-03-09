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
      <v-btn
        v-if="!user.ethAddress"
        @click.stop="login()"
        color="white"
        class="black--text"
      >
        Connect Wallet
      </v-btn>
      <!-- <v-btn v-else @click.stop="logout()" color="white" class="black--text">
        {{ user.ethAddress.slice(0, 9) }}..
      </v-btn> -->
      <v-menu v-else offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="white" class="black--text" v-bind="attrs" v-on="on">
            {{ user.ethAddress.slice(0, 9) }}..
            <v-icon dark right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item
              v-for="(dropDownItem, index) in dropDownItems"
              :key="index"
              :to="dropDownItem.to"
              router
              exact
            >
              <v-list-item-content>
                <v-list-item-title
                  v-text="dropDownItem.title"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  @click="logout"
                  class="red--text"
                  v-text="'LOGOUT'"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt v-if="!loading" />
        <v-overlay :value="loading">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
      <!-- <v-footer :absolute="!fixed">
        <span>&copy; {{ new Date().getFullYear() }}</span>
      </v-footer> -->
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" temporary fixed>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
      fixed: true,
      loading: true,
      items: [
        {
          icon: "mdi-apps",
          title: "Create Edition",
          to: "/create",
        },
        {
          icon: "mdi-apps",
          title: "All Artists",
          to: "/artists",
        },
        {
          icon: "mdi-chart-bubble",
          title: "All Songs",
          to: "/songs",
        },
        {
          icon: "mdi-chart-bubble",
          title: "My NFTs",
          to: "/myNFTs",
        },
        {
          icon: "mdi-chart-bubble",
          title: "Join as Artist ",
          to: "/join",
        },
      ],
      dropDownItems: [
        { title: "Dashboard", to: "/dashboard" },
        { title: "Profile", to: "/profile" },
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
  async mounted() {
    await this.login();
    this.loading = false;
  },
};
</script>
