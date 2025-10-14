// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EncryptedStore {
    struct Record {
        bytes encryptedValue;
        bytes proof;
    }

    mapping(address => Record) public records;

    event Stored(address indexed user, bytes encryptedValue, bytes proof);

    function storeEncryptedValue(bytes calldata encryptedValue, bytes calldata proof) external {
        records[msg.sender] = Record(encryptedValue, proof);
        emit Stored(msg.sender, encryptedValue, proof);
    }

    function getMyRecord() external view returns (bytes memory, bytes memory) {
        Record memory rec = records[msg.sender];
        return (rec.encryptedValue, rec.proof);
    }
}
