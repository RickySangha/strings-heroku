//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol';

// Link these as deployed librarys to reduce gas
import '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

/**
 * @title Artist
 * @author Stringsio
 */
contract ArtistV2 is
  ERC721Upgradeable,
  IERC2981Upgradeable,
  OwnableUpgradeable
{
  // todo (optimization): link Strings as a deployed library
  using StringsUpgradeable for uint256;
  using CountersUpgradeable for CountersUpgradeable.Counter;

  // ============ Structs ============

  struct Composition {
    uint256 tokenId;
    address contractId;
  }

  struct Edition {
    // The account that will receive sales revenue.
    address payable fundingRecipient;
    // The price at which each token will be sold, in ETH.
    uint256 price;
    // The number of tokens sold so far.
    uint32 numSold;
    // The maximum number of tokens that can be sold.
    uint32 quantity;
    // Royalty amount in bps
    uint32 royaltyBPS;
    // start timestamp of auction (in seconds since unix epoch)
    uint32 startTime;
    // end timestamp of auction (in seconds since unix epoch)
    uint32 endTime;
    //TODO: anyway we can make this more efficient. Eg save ipfs hashes in bytes32 instead of strings
    string uriHash;
    string imageHash;
    string musicHash;
    // bool isComposable;
    // The child editions this edition is composed of (max 5)
    // Composition[5] composedOf;
    // uint8 numberComposedOf;
  }

  // ============ Storage ============

  string internal baseURI;

  CountersUpgradeable.Counter private atTokenId;
  CountersUpgradeable.Counter private atEditionId;

  // Mapping of edition id to descriptive data.
  mapping(uint256 => Edition) public editions;
  // Mapping of token id to edition id.
  mapping(uint256 => uint256) public tokenToEdition;
  // The amount of funds that have been deposited for a given edition.
  mapping(uint256 => uint256) public depositedForEdition;
  // The amount of funds that have already been withdrawn for a given edition.
  mapping(uint256 => uint256) public withdrawnForEdition;

  // ============ Events ============

  event EditionCreated(
    uint256 indexed editionId,
    address fundingRecipient,
    uint256 price,
    uint32 quantity,
    uint32 royaltyBPS,
    uint32 startTime,
    uint32 endTime,
    string uriHash,
    string imageHash,
    string musicHash
  );

  event EditionPurchased(
    uint256 indexed editionId,
    uint256 indexed tokenId,
    uint32 numSold,
    address indexed buyer
  );

  // ============ Methods ============

  /**
      @param _name Name of artist
    */
  function initialize(
    address _owner,
    string memory _name,
    string memory _symbol,
    string memory _baseURI
  ) public initializer {
    __ERC721_init(_name, _symbol);
    __Ownable_init();

    // Set ownership to original sender of contract call
    transferOwnership(_owner);

    // E.g. https://ipfs.moralis.io:2053/ipfs/
    // baseURI = string(abi.encodePacked(_baseURI, _artistId.toString(), '/'));
    baseURI = string(abi.encodePacked(_baseURI));

    // Set token id start to be 1 not 0
    atTokenId.increment();
    // Set edition id start to be 1 not 0
    atEditionId.increment();
  }

  function createEdition(
    // bool _isComposable
    // address payable _fundingRecipient,
    uint256 _price,
    uint32 _quantity,
    uint32 _royaltyBPS,
    uint32 _startTime,
    uint32 _endTime,
    string memory _uriHash,
    string memory _imageHash,
    string memory _musicHash
  ) external onlyOwner {
    editions[atEditionId.current()] = Edition({
      fundingRecipient: payable(msg.sender),
      price: _price,
      numSold: 0,
      quantity: _quantity,
      royaltyBPS: _royaltyBPS,
      startTime: _startTime,
      endTime: _endTime,
      uriHash: _uriHash,
      imageHash: _imageHash,
      musicHash: _musicHash
      // isComposable: _isComposable
      // composedOf: Composition(),
      // numberComposedOf: 0
    });

    emit EditionCreated(
      atEditionId.current(),
      msg.sender,
      _price,
      _quantity,
      _royaltyBPS,
      _startTime,
      _endTime,
      _uriHash,
      _imageHash,
      _musicHash
    );

    atEditionId.increment();
  }

  // function composeOnEdition(uint256 _tokenId) public view returns (uint256) {
  //   // TODO: use an interface to call other contract functions. Need to create a new interface with the function we need to use
  //   // check if msg.sender is owner of the _tokenId
  //   require(ownerOf(_tokenId) == msg.sender, "You don't own this token");

  //   // check if the tokens/edition is already composed of 5 others
  //   // require(editions[_tokenId].numberComposedOf < 5, 'max composition reached');

  //   // get the edition the token belongs to
  //   uint256 editionId = tokenToEdition[_tokenId];
  //   return editionId;
  // }

  function buyEdition(uint256 _editionId) external payable {
    // Check that the edition exists. Note: this is redundant
    // with the next check, but it is useful for clearer error messaging.
    require(editions[_editionId].quantity > 0, 'Edition does not exist');
    // Check that there are still tokens available to purchase.
    require(
      editions[_editionId].numSold < editions[_editionId].quantity,
      'This edition is already sold out.'
    );
    // Check that the sender is paying the correct amount.
    require(
      msg.value >= editions[_editionId].price,
      'Must send enough to purchase the edition.'
    );
    // Don't allow purchases before the start time
    require(
      editions[_editionId].startTime < block.timestamp,
      "Auction hasn't started"
    );
    // Don't allow purchases after the end time
    require(
      editions[_editionId].endTime > block.timestamp,
      'Auction has ended'
    );

    // Mint a new token for the sender, using the `tokenId`.
    _mint(msg.sender, atTokenId.current());
    // Update the deposited total for the edition
    depositedForEdition[_editionId] += msg.value;
    // Increment the number of tokens sold for this edition.
    editions[_editionId].numSold++;
    // Store the mapping of token id to the edition being purchased.
    tokenToEdition[atTokenId.current()] = _editionId;

    emit EditionPurchased(
      _editionId,
      atTokenId.current(),
      editions[_editionId].numSold,
      msg.sender
    );

    atTokenId.increment();
  }

  // ============ Operational Methods ============

  function withdrawFunds(uint256 _editionId) external {
    // Compute the amount available for withdrawing from this edition.
    uint256 remainingForEdition = depositedForEdition[_editionId] -
      withdrawnForEdition[_editionId];

    // Set the amount withdrawn to the amount deposited.
    withdrawnForEdition[_editionId] = depositedForEdition[_editionId];
    // Send the amount that was remaining for the edition, to the funding recipient.
    _sendFunds(editions[_editionId].fundingRecipient, remainingForEdition);
  }

  function setStartTime(uint256 _editionId, uint32 _startTime)
    external
    onlyOwner
  {
    editions[_editionId].startTime = _startTime;
  }

  function setEndTime(uint256 _editionId, uint32 _endTime) external onlyOwner {
    editions[_editionId].endTime = _endTime;
  }

  // ============ NFT Methods ============

  // Returns e.g. https://sound.xyz/api/metadata/[artistId]/[editionId]/[tokenId]
  function tokenURI(uint256 _tokenId)
    public
    view
    override
    returns (string memory)
  {
    require(
      _exists(_tokenId),
      'ERC721Metadata: URI query for nonexistent token'
    );

    //TODO: Are we doing special editions? If so a different Uri will need to be returned.
    // Concatenate the components, baseURI, editionId and tokenId, to create URI.
    // return
    //   string(
    //     abi.encodePacked(
    //       baseURI,
    //       tokenToEdition[_tokenId].toString(),
    //       '/',
    //       _tokenId.toString()
    //     )
    //   );

    return
      string(
        abi.encodePacked(baseURI, editions[tokenToEdition[_tokenId]].uriHash)
      );
  }

  // Returns e.g. https://sound.xyz/api/metadata/[artistId]/storefront
  function contractURI() public view returns (string memory) {
    // Concatenate the components, baseURI, editionId and tokenId, to create URI.
    return string(abi.encodePacked(baseURI, 'storefront'));
  }

  // ============ Extensions =================

  /**
        @dev Get token ids for a given edition id
        @param _editionId edition id
     */
  function getTokenIdsOfEdition(uint256 _editionId)
    public
    view
    returns (uint256[] memory)
  {
    uint256[] memory tokenIdsOfEdition = new uint256[](
      editions[_editionId].numSold
    );
    uint256 index = 0;

    for (uint256 id = 1; id < atTokenId.current(); id++) {
      if (tokenToEdition[id] == _editionId) {
        tokenIdsOfEdition[index] = id;
        index++;
      }
    }
    return tokenIdsOfEdition;
  }

  /**
        @dev Get owners of a given edition id
        @param _editionId edition id
     */
  function getOwnersOfEdition(uint256 _editionId)
    public
    view
    returns (address[] memory)
  {
    address[] memory ownersOfEdition = new address[](
      editions[_editionId].numSold
    );
    uint256 index = 0;

    for (uint256 id = 1; id < atTokenId.current(); id++) {
      if (tokenToEdition[id] == _editionId) {
        ownersOfEdition[index] = ERC721Upgradeable.ownerOf(id);
        index++;
      }
    }
    return ownersOfEdition;
  }

  /**
        @dev Get royalty information for token
        @param _editionId edition id
        @param _salePrice Sale price for the token
     */
  function royaltyInfo(uint256 _editionId, uint256 _salePrice)
    external
    view
    override
    returns (address fundingRecipient, uint256 royaltyAmount)
  {
    Edition memory edition = editions[_editionId];

    if (edition.fundingRecipient == address(0x0)) {
      return (edition.fundingRecipient, 0);
    }

    uint256 royaltyBPS = uint256(edition.royaltyBPS);

    return (edition.fundingRecipient, (_salePrice * royaltyBPS) / 10_000);
  }

  function totalSupply() external view returns (uint256) {
    return atTokenId.current() - 1; // because atTokenId is 1-indexed
  }

  function supportsInterface(bytes4 _interfaceId)
    public
    view
    override(ERC721Upgradeable, IERC165Upgradeable)
    returns (bool)
  {
    return
      type(IERC2981Upgradeable).interfaceId == _interfaceId ||
      ERC721Upgradeable.supportsInterface(_interfaceId);
  }

  // ============ Private Methods ============

  function _sendFunds(address payable _recipient, uint256 _amount) private {
    require(address(this).balance >= _amount, 'Insufficient balance for send');

    (bool success, ) = _recipient.call{ value: _amount }('');
    require(success, 'Unable to send value: recipient may have reverted');
  }
}
