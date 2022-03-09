const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Artist', function () {
  before(async function () {
    this.owner = await ethers.getSigner();
    this.buyers = await ethers.getSigners();
    // Deploy the Artist contract (implementation)
    const Artist = await ethers.getContractFactory('Artist');
    const artist = await Artist.deploy();
    // Wait until the contract is deployed
    await artist.deployed();
    console.log('Artist Implementation:', artist.address);

    //Create a beacon contract that points to the Artist implementation
    this.beacon = await upgrades.deployBeacon(Artist);
    await this.beacon.deployed();
    console.log('Beacon:', this.beacon.address);

    // Deploy the artist creator contract (implementation and proxy)
    const ArtistCreator = await ethers.getContractFactory('ArtistCreator');
    this.artistCreatorProxy = await upgrades.deployProxy(
      ArtistCreator,
      [this.beacon.address],
      {
        initializer: 'initialize',
        kind: 'uups',
      }
    );
    await this.artistCreatorProxy.deployed();
    console.log('ArtistCreator Proxy:', this.artistCreatorProxy.address);

    // Create a new ArtistProxy contract through the ArtistCreatorProxy contract
    const createArtistTx = await this.artistCreatorProxy.createArtist(
      'Rick',
      'RSS',
      'https://ipfs.moralis.io:2053/ipfs/'
    );
    // Wait until the transaction is mined
    await createArtistTx.wait();
    // After the tx has been mined address of the created ArtistProxy
    this.artistProxyAddress = await this.artistCreatorProxy.artistContracts(0);
    console.log('Artist Proxy:', this.artistProxyAddress);

    //Get a new artistproxy contract  instance (js objecy) by attaching the created artistproxy address to the artist contract
    this.artistProxy = await artist.attach(this.artistProxyAddress);
  });

  it('Create an ArtistProxy and log the name', async function () {
    // Check if the name was set correctly
    expect(await this.artistProxy.name()).to.equal('Rick');
    console.log(await this.artistProxy.name());
  });

  it('Create an edition', async function () {
    const createEditionTx = await this.artistProxy.createEdition(
      100000000000000,
      30,
      250,
      1643167718,
      1746134114,
      'uriHash'
      // 'imageHash',
      // 'musicHash'
    );
    let edition = await this.artistProxy.editions(1);
    expect(edition.fundingRecipient).to.equal(this.owner.address);
  });

  it('Buy editions and check balance', async function () {
    const buyer1ArtistInstance = await this.artistProxy.connect(this.buyers[1]);
    const buyer2ArtistInstance = await this.artistProxy.connect(this.buyers[2]);
    const buyTx1 = await buyer1ArtistInstance.buyEdition(1, {
      value: ethers.utils.parseEther('0.1'),
    });
    const buyTx2 = await buyer2ArtistInstance.buyEdition(1, {
      value: ethers.utils.parseEther('0.1'),
    });
    await buyTx1.wait();
    await buyTx2.wait();
  });

  it('Upgrade Artist Beacon', async function () {
    const ArtistV2 = await ethers.getContractFactory('ArtistV2');
    const implementation = await upgrades.beacon.getImplementationAddress(
      this.beacon.address
    );
    console.log('Current Implementation:', implementation);
    const updatedBeacon = await upgrades.upgradeBeacon(
      this.beacon.address,
      ArtistV2
    );
    const newImplementation = await upgrades.beacon.getImplementationAddress(
      updatedBeacon.address
    );
    console.log('New Implementation:', newImplementation);
    this.artistProxyV2 = ArtistV2.attach(this.artistProxyAddress);
  });
  it('Upgrade ArtistCreator Proxy', async function () {
    const ArtistCreatorV2 = await ethers.getContractFactory('ArtistCreatorV2');

    const artistCreatorProxyV2 = await upgrades.upgradeProxy(
      this.artistCreatorProxy.address,
      ArtistCreatorV2
    );
    console.log('Upgraded ArtitCreator Proxy', artistCreatorProxyV2.address);
    const createArtistTx = await artistCreatorProxyV2.createArtist(
      'Rick',
      'RSS',
      'https://ipfs.moralis.io:2053/ipfs/'
    );
    await createArtistTx.wait();
  });

  it('Returns the correct URI', async function () {
    const tokenURI1 = await this.artistProxy.tokenURI(1);
    const tokenURI2 = await this.artistProxy.tokenURI(2);
    console.log(tokenURI1);
    console.log(tokenURI2);
    expect(tokenURI1).to.equal(tokenURI2);
  });

  it('Create an edition after update', async function () {
    const createEditionTx = await this.artistProxyV2.createEdition(
      100000000000000,
      30,
      250,
      1643167718,
      1646134114,
      'uriHash',
      'imageHash',
      'musicHash'
    );
    let edition = await this.artistProxy.editions(1);
    expect(edition.fundingRecipient).to.equal(this.owner.address);
  });

  it('Buy editions and check balance after udate', async function () {
    const buyer1ArtistInstance = await this.artistProxyV2.connect(
      this.buyers[1]
    );
    const buyer2ArtistInstance = await this.artistProxyV2.connect(
      this.buyers[2]
    );
    const buyTx1 = await buyer1ArtistInstance.buyEdition(1, {
      value: ethers.utils.parseEther('0.1'),
    });
    const buyTx2 = await buyer2ArtistInstance.buyEdition(1, {
      value: ethers.utils.parseEther('0.1'),
    });
    await buyTx1.wait();
    await buyTx2.wait();

    const tokenBalance = await buyer1ArtistInstance.balanceOf(
      this.buyers[1].address
    );
    expect(tokenBalance).to.equal(2);
  });
});
