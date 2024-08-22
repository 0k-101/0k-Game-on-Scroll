async function main() {
    if (network.name === "sepolia") {
        console.log("Deploying contracts to the sepolia network");
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);
        const OK_101 = await ethers.getContractFactory("OK_101");
        const contract = await OK_101.deploy();
        console.log("OK_101 contract deployed to:", await contract.getAddress());

    } else {
        console.log("Deploying to local network");
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);
        const OK_101 = await ethers.getContractFactory("OK_101");
        const contract = await OK_101.deploy();
        console.log("OK_101 contract deployed to:", await contract.getAddress());
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
