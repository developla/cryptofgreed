// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptOfGreedNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from tokenId to tier
    mapping(uint256 => string) private _tokenTiers;
    
    // Mapping from tokenId to invested status
    mapping(uint256 => bool) private _tokenInvested;

    constructor() ERC721("CryptOfGreedNFT", "CRYPT") Ownable(msg.sender) {}

    function mintGameItem(address player, string memory uri, string memory tier) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(player, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenTiers[tokenId] = tier;
        _tokenInvested[tokenId] = false;
        return tokenId;
    }

    function investToken(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!_tokenInvested[tokenId], "Token already invested");
        _tokenInvested[tokenId] = true;
    }

    function burnToken(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_tokenInvested[tokenId], "Token not invested");
        _burn(tokenId);
    }

    function getTokenTier(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenTiers[tokenId];
    }

    function isTokenInvested(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenInvested[tokenId];
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
