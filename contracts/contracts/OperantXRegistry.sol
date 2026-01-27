// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OperantXRegistry {
    event ProfileRegistered(address indexed wallet, bytes32 indexed profileId);
    event MachineListed(address indexed owner, bytes32 indexed machineId, bytes32 metadataHash);
    event JobRecorded(bytes32 indexed jobId, address indexed creator, bytes32 jobHash);
    event JobAccepted(bytes32 indexed jobId, address indexed accepter);
    event JobCompleted(bytes32 indexed jobId, address indexed confirmer);

    mapping(address => bytes32) public profileOf;
    mapping(bytes32 => address) public jobCreator;
    mapping(bytes32 => address) public jobAccepter;
    mapping(bytes32 => bytes32) public jobHashOf;
    mapping(bytes32 => bool) public jobCompleted;

    function registerProfile(bytes32 profileId) external {
        profileOf[msg.sender] = profileId;
        emit ProfileRegistered(msg.sender, profileId);
    }

    function listMachine(bytes32 machineId, bytes32 metadataHash) external {
        emit MachineListed(msg.sender, machineId, metadataHash);
    }

    function recordJob(bytes32 jobId, bytes32 jobHash) external {
        require(jobCreator[jobId] == address(0), "job_exists");
        jobCreator[jobId] = msg.sender;
        jobHashOf[jobId] = jobHash;
        emit JobRecorded(jobId, msg.sender, jobHash);
    }

    function acceptJob(bytes32 jobId) external {
        require(jobCreator[jobId] != address(0), "job_missing");
        require(jobAccepter[jobId] == address(0), "job_already_accepted");
        jobAccepter[jobId] = msg.sender;
        emit JobAccepted(jobId, msg.sender);
    }

    function confirmCompletion(bytes32 jobId) external {
        require(jobCreator[jobId] != address(0), "job_missing");
        require(msg.sender == jobCreator[jobId] || msg.sender == jobAccepter[jobId], "not_participant");
        jobCompleted[jobId] = true;
        emit JobCompleted(jobId, msg.sender);
    }
}
