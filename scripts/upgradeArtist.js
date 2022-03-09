const { upgrades } = require('hardhat');

const beaconAddress = '0x8eC3D96d6DC2932BF408289322a18374fD5a40a4';

async function main() {
  const owner = await ethers.getSigner();

  const ArtistV2 = await ethers.getContractFactory('ArtistV2');
  const implementation = await upgrades.beacon.getImplementationAddress(
    beaconAddress
  );
  console.log('Current Implementation:', implementation);
  const updatedBeacon = await upgrades.upgradeBeacon(beaconAddress, ArtistV2);
  const newImplementation = await upgrades.beacon.getImplementationAddress(
    updatedBeacon.address
  );
  console.log('New Implementation:', newImplementation);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
