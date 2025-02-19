import hre, { artifacts, viem } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  //get deployers address
  const [walletClient] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  if (!walletClient) {
    throw new Error("No Wallet Client Found");
  }

  const deployer = walletClient.account.address;
  console.log("Deploying Contract from : ", deployer);

  const contractArtifact = await artifacts.readArtifact("BottleGame");

  //deploy the contract

  const hash = await walletClient.deployContract({
    abi: contractArtifact.abi,
    bytecode: contractArtifact.bytecode as `0x${string}`,
    args: [],
  });
  console.log("Deployment Hash :", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) {
    throw new Error("Contract Deployment Failed");
  }

  console.log("Contract deployed at ✅", receipt.contractAddress);

  await verifyContract(receipt.contractAddress);
}

async function verifyContract(address: string) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully ✅");
  } catch (error) {
    console.error("Error verifying Contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
