const { ethers } = require("hardhat");
require("dotenv");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Adresse du wallet écologique (à remplacer par une vraie adresse)
  const ecologicalWallet = process.env.ECOLOGICAL_WALLET || deployer.address;
  
  console.log("\nDeploying GreenHashToken...");
  
  // Deployer le token GREENHASH
  const GreenHashToken = await ethers.getContractFactory("GreenHashToken");
  const greenHashToken = await GreenHashToken.deploy(ecologicalWallet);
  
  await greenHashToken.deployed();
  
  console.log("GreenHashToken deployed to:", greenHashToken.address);
  console.log("Total supply:", (await greenHashToken.totalSupply()).toString());
  console.log("Ecological wallet:", ecologicalWallet);

  console.log("\nDeploying GreenStakingPool...");
  
  // Calculer les récompenses par seconde pour 65% APR
  // 100M tokens * 65% / 365 jours / 86400 secondes = ~20.55 tokens/seconde
  const rewardPerSecond = ethers.utils.parseEther("20.55");
  
  // Deployer le pool de staking
  const GreenStakingPool = await ethers.getContractFactory("GreenStakingPool");
  const stakingPool = await GreenStakingPool.deploy(
    greenHashToken.address, // Token de récompense
    greenHashToken.address, // Token à staker (le même)
    rewardPerSecond
  );
  
  await stakingPool.deployed();
  
  console.log("GreenStakingPool deployed to:", stakingPool.address);
  
  // Transférer des tokens au pool pour les récompenses
  const rewardAmount = ethers.utils.parseEther("50000000"); // 50M tokens pour 2.4 ans
  await greenHashToken.transfer(stakingPool.address, rewardAmount);
  
  console.log("Transferred", rewardAmount.toString(), "GREENHASH to staking pool for rewards");
  
  // Vérifier les déploiements
  console.log("\n=== Deployment Summary ===");
  console.log("GreenHashToken:", greenHashToken.address);
  console.log("GreenStakingPool:", stakingPool.address);
  console.log("Ecological Wallet:", ecologicalWallet);
  console.log("Reward per second:", rewardPerSecond.toString());
  
  // Sauvegarder les adresses pour le frontend
  const deploymentInfo = {
    greenHashToken: greenHashToken.address,
    stakingPool: stakingPool.address,
    ecologicalWallet: ecologicalWallet,
    deployer: deployer.address,
    network: network.name,
    timestamp: new Date().toISOString()
  };
  
  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Optionnel: Vérifier les permissions et les paramètres
  const poolOwner = await stakingPool.owner();
  console.log("\nStaking pool owner:", poolOwner);
  
  const tokenOwner = await greenHashToken.owner();
  console.log("Token owner:", tokenOwner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });