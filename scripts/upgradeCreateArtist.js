const { upgrades } = require('hardhat');

async function main() {
  const owner = await ethers.getSigner();
  const ArtistCreatorV2 = await ethers.getContractFactory('ArtistCreatorV2');

  const artistCreatorProxy = await upgrades.upgradeProxy(
    '0x58fA26f75e7bfA63D3c8b43d2F40BaE78326ebcC',
    ArtistCreatorV2
  );
  console.log('Upgraded ArtitCreator Proxy', artistCreatorProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
