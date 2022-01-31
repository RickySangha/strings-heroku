// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const owner = await ethers.getSigner();
  console.log('deploying with:', owner.address);
  // Deploy the Artist contract (implementation)
  const Artist = await ethers.getContractFactory('Artist');
  const artist = await Artist.deploy();
  // Wait until the contract is deployed
  await artist.deployed();
  console.log('Artist Implementation:', artist.address);

  //Create a beacon contract that points to the Artist implementation
  const beacon = await upgrades.deployBeacon(Artist);
  await beacon.deployed();
  console.log('Beacon:', beacon.address);

  // Deploy the artist creator contract (implementation and proxy)
  const ArtistCreator = await ethers.getContractFactory('ArtistCreator');
  const artistCreatorProxy = await upgrades.deployProxy(
    ArtistCreator,
    [beacon.address],
    {
      initializer: 'initialize',
      kind: 'uups',
    }
  );
  await artistCreatorProxy.deployed();
  console.log('ArtistCreator Proxy:', artistCreatorProxy.address);

  // Create a new ArtistProxy contract through the ArtistCreatorProxy contract
  const createArtistTx = await artistCreatorProxy.createArtist(
    'Rick',
    'RSS',
    'https://ipfs.moralis.io:2053/ipfs/'
  );
  // Wait until the transaction is mined
  await createArtistTx.wait();
  // After the tx has been mined address of the created ArtistProxy
  const artistProxyAddress = await artistCreatorProxy.artistContracts(0);
  console.log('Artist Proxy:', artistProxyAddress);

  //Get a new artistproxy contract  instance (js objecy) by attaching the created artistproxy address to the artist contract
  const artistProxy = await artist.attach(artistProxyAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
