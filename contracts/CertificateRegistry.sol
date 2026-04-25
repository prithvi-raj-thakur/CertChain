// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @dev Smart contract for issuing and verifying digital certificates on-chain.
 *      Only the contract owner (admin) can issue certificates.
 *      Anyone can verify a certificate by its ID.
 */
contract CertificateRegistry {
    // ─── State Variables ───────────────────────────────────────────────────────

    /// @dev Contract deployer / admin
    address public owner;

    /// @dev Struct storing certificate data
    struct Certificate {
        bytes32 hash;        // SHA-256 hash of the certificate data
        string  studentName; // Name of the certificate recipient
        string  course;      // Course or program name
        uint256 issuedAt;    // Block timestamp of issuance
        bool    exists;      // Guard to detect non-existent certs
    }

    /// @dev Maps a certificate ID (bytes32) to its on-chain data
    mapping(bytes32 => Certificate) private certificates;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @dev Emitted when a new certificate is successfully issued
    event CertificateIssued(
        bytes32 indexed certId,
        bytes32 hash,
        string  studentName,
        string  course,
        uint256 issuedAt
    );

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    /// @dev Restricts a function to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "CertificateRegistry: caller is not the owner");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Core Functions ────────────────────────────────────────────────────────

    /**
     * @notice Issue a new certificate on-chain.
     * @dev Can only be called by the contract owner.
     * @param certId      Unique identifier for the certificate (keccak256 of UUID)
     * @param hash        SHA-256 hash of the certificate JSON/PDF content
     * @param studentName Full name of the student
     * @param course      Name of the course / program
     */
    function issueCertificate(
        bytes32 certId,
        bytes32 hash,
        string calldata studentName,
        string calldata course
    ) external onlyOwner {
        require(!certificates[certId].exists, "CertificateRegistry: certificate already exists");
        require(hash != bytes32(0),           "CertificateRegistry: hash cannot be zero");
        require(bytes(studentName).length > 0,"CertificateRegistry: student name required");
        require(bytes(course).length > 0,     "CertificateRegistry: course required");

        certificates[certId] = Certificate({
            hash:        hash,
            studentName: studentName,
            course:      course,
            issuedAt:    block.timestamp,
            exists:      true
        });

        emit CertificateIssued(certId, hash, studentName, course, block.timestamp);
    }

    /**
     * @notice Verify a certificate by its ID.
     * @param certId Unique certificate identifier
     * @return hash        Stored SHA-256 hash
     * @return studentName Student name recorded on-chain
     * @return course      Course recorded on-chain
     * @return issuedAt    Unix timestamp of issuance
     * @return exists      Whether the certificate exists
     */
    function verifyCertificate(bytes32 certId)
        external
        view
        returns (
            bytes32 hash,
            string memory studentName,
            string memory course,
            uint256 issuedAt,
            bool exists
        )
    {
        Certificate storage cert = certificates[certId];
        return (cert.hash, cert.studentName, cert.course, cert.issuedAt, cert.exists);
    }

    /**
     * @notice Transfer contract ownership to a new address.
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "CertificateRegistry: invalid address");
        owner = newOwner;
    }
}
