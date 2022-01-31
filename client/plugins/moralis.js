const Moralis = require("moralis");

const VUE_APP_MORALIS_APP_ID = "MJprZH0yV8zOIWPwxpPpU4BOGSo1mRhbgbuNpYE8";
const VUE_APP_MORALIS_SERVER_URL =
  "https://dhsgucezdnqh.usemoralis.com:2053/server";

Moralis.start({
  serverUrl: VUE_APP_MORALIS_SERVER_URL,
  appId: VUE_APP_MORALIS_APP_ID,
});

export default { Moralis };
