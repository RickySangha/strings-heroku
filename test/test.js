const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Artist', function () {
  before(async function () {
    this.owner = await ethers.getSigner();
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
    this.artistProxy = await artist.attach(artistProxyAddress);
  });

  it('Create an ArtistProxy and log the name', async function () {
    // Check if the name was set correctly
    expect(await this.artistProxy.name()).to.equal('Rick');
    console.log(await this.artistProxy.name());
  });

  it('Create an edition', async function () {
    const createEditionTx = await this.artistProxy.createEdition(
      100000000000000000,
      30,
      250,
      1643167718,
      1646134114,
      'testhash'
    );
    await createEditionTx.wait();
    let edition = await this.artistProxy.editions(1);
    console.log(edition);
    expect(edition.fundingRecipient).to.equal(this.owner.address);
  });
});
