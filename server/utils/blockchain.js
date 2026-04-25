// server/utils/blockchain.js
// ─────────────────────────────────────────────────────────────────────────────
// Ethers.js v6 wrapper for interacting with the CertificateRegistry contract.
// Provides issueCertificate() and verifyCertificate() helpers.
// ─────────────────────────────────────────────────────────────────────────────

const { ethers } = require("ethers");
const path        = require("path");
const fs          = require("fs");

// Load compiled ABI from Hardhat artifacts
const getABI = () => {
  const artifactPath = path.join(
    __dirname,
    "../../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      "Contract ABI not found. Run `npx hardhat compile` first from the project root."
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  return artifact.abi;
};

/**
 * Returns an Ethers.js contract instance connected with a signer (for write ops)
 * or provider (for read ops).
 * @param {boolean} withSigner - if true, uses a wallet signer for write operations
 */
const getContract = (withSigner = false) => {
  const rpcUrl          = process.env.INFURA_URL || "http://127.0.0.1:7545";
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const abi      = getABI();

  if (withSigner) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, abi, wallet);
  }

  return new ethers.Contract(contractAddress, abi, provider);
};

/**
 * Issues a certificate on the blockchain.
 * @param {string} certId       UUID string (will be hashed to bytes32)
 * @param {string} hash         hex string of SHA-256 hash (0x prefixed)
 * @param {string} studentName  Student's full name
 * @param {string} course       Course name
 * @returns {Promise<string>}   Transaction hash
 */
const issueCertificate = async (certId, hash, studentName, course) => {
  const contract = getContract(true); // needs signer

  // Convert certId string → bytes32 (keccak256)
  const certIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(certId));

  // Hash is already a hex string from SHA-256; pad/convert to bytes32
  const hashBytes32 = "0x" + hash.padStart(64, "0");

  const tx = await contract.issueCertificate(
    certIdBytes32,
    hashBytes32,
    studentName,
    course
  );

  const receipt = await tx.wait();
  return receipt.hash; // transaction hash
};

/**
 * Verifies a certificate from the blockchain.
 * @param {string} certId UUID string
 * @returns {Promise<Object>} Certificate data from blockchain
 */
const verifyCertificateOnChain = async (certId) => {
  const contract = getContract(false); // read-only

  const certIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(certId));

  const [hash, studentName, course, issuedAt, exists] =
    await contract.verifyCertificate(certIdBytes32);

  return {
    hash:        hash,
    studentName: studentName,
    course:      course,
    issuedAt:    Number(issuedAt) > 0 ? new Date(Number(issuedAt) * 1000).toISOString() : null,
    exists:      exists,
  };
};

module.exports = { issueCertificate, verifyCertificateOnChain };
