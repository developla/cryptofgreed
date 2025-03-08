const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const CyrptOfGreed = await ethers.getContractFactory("CyrptOfGreed");
  const myCyrptOfGreed = await CyrptOfGreed.deploy();

  console.log("Contract address:", await myCyrptOfGreed.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
