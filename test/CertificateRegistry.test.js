// test/CertificateRegistry.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Hardhat + Chai unit tests for the CertificateRegistry smart contract.
// Run: npx hardhat test
// ─────────────────────────────────────────────────────────────────────────────

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let contract;
  let owner;
  let other;

  // Sample test data
  const certId      = ethers.keccak256(ethers.toUtf8Bytes("test-cert-uuid-123"));
  const certHash    = "0x" + "a".repeat(64);  // 32 bytes of 0xaa...
  const studentName = "Jane Doe";
  const course      = "Blockchain Development";

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Factory  = await ethers.getContractFactory("CertificateRegistry");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ─────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  // ── issueCertificate ───────────────────────────────────────────────────────
  describe("issueCertificate()", function () {
    it("should allow owner to issue a certificate", async function () {
      const tx = await contract.issueCertificate(certId, certHash, studentName, course);
      const receipt = await tx.wait();
      // Verify the event was emitted with correct main args (ignore timestamp)
      const event = receipt.logs.find(
        (log) => log.fragment?.name === "CertificateIssued"
      );
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(certId);
      expect(event.args[1]).to.equal(certHash);
      expect(event.args[2]).to.equal(studentName);
      expect(event.args[3]).to.equal(course);
    });

    it("should reject duplicate certificate IDs", async function () {
      await contract.issueCertificate(certId, certHash, studentName, course);
      await expect(
        contract.issueCertificate(certId, certHash, studentName, course)
      ).to.be.revertedWith("CertificateRegistry: certificate already exists");
    });

    it("should reject non-owner callers", async function () {
      await expect(
        contract.connect(other).issueCertificate(certId, certHash, studentName, course)
      ).to.be.revertedWith("CertificateRegistry: caller is not the owner");
    });

    it("should reject zero hash", async function () {
      await expect(
        contract.issueCertificate(certId, ethers.ZeroHash, studentName, course)
      ).to.be.revertedWith("CertificateRegistry: hash cannot be zero");
    });

    it("should reject empty student name", async function () {
      await expect(
        contract.issueCertificate(certId, certHash, "", course)
      ).to.be.revertedWith("CertificateRegistry: student name required");
    });

    it("should reject empty course", async function () {
      await expect(
        contract.issueCertificate(certId, certHash, studentName, "")
      ).to.be.revertedWith("CertificateRegistry: course required");
    });
  });

  // ── verifyCertificate ──────────────────────────────────────────────────────
  describe("verifyCertificate()", function () {
    it("should return correct data after issuance", async function () {
      await contract.issueCertificate(certId, certHash, studentName, course);
      const [hash, name, crs, , exists] = await contract.verifyCertificate(certId);

      expect(hash).to.equal(certHash);
      expect(name).to.equal(studentName);
      expect(crs).to.equal(course);
      expect(exists).to.be.true;
    });

    it("should return exists=false for unknown certificate", async function () {
      const unknownId = ethers.keccak256(ethers.toUtf8Bytes("unknown"));
      const [, , , , exists] = await contract.verifyCertificate(unknownId);
      expect(exists).to.be.false;
    });
  });

  // ── transferOwnership ──────────────────────────────────────────────────────
  describe("transferOwnership()", function () {
    it("should transfer ownership to a new address", async function () {
      await contract.transferOwnership(other.address);
      expect(await contract.owner()).to.equal(other.address);
    });

    it("should reject zero address", async function () {
      await expect(
        contract.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("CertificateRegistry: invalid address");
    });
  });
});

// Helper to get the latest block timestamp
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
