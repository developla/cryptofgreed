// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CyrptOfGreed is ERC721, ERC721URIStorage, Ownable, Pausable {
    uint256 private _nextTokenId;
    uint256 public mintPrice;
    string private baseURI;

    // Asset type tracking
    enum AssetType { CHARACTER, EQUIPMENT, ACHIEVEMENT }
    mapping(uint256 => AssetType) public tokenTypes;
    
    // Events
    event AssetMinted(address indexed to, uint256 tokenId, AssetType assetType);
    event MintPriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);

    constructor() ERC721("CyrptOfGreed", "CRYPT") Ownable(msg.sender) {
        mintPrice = 0.1 ether; // Initial mint price
    }

    // Mint functions for different asset types
    function mintCharacterNFT(address to, string memory uri) public onlyOwner whenNotPaused {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenTypes[tokenId] = AssetType.CHARACTER;
        emit AssetMinted(to, tokenId, AssetType.CHARACTER);
    }

    function mintEquipmentNFT(address to, string memory uri) public onlyOwner whenNotPaused {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenTypes[tokenId] = AssetType.EQUIPMENT;
        emit AssetMinted(to, tokenId, AssetType.EQUIPMENT);
    }

    function mintAchievementNFT(address to, string memory uri) public onlyOwner whenNotPaused {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenTypes[tokenId] = AssetType.ACHIEVEMENT;
        emit AssetMinted(to, tokenId, AssetType.ACHIEVEMENT);
    }

    // Asset management functions
    function getAssetsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }

    // Admin functions
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) public onlyOwner {
        _setTokenURI(tokenId, newURI);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Internal functions
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
