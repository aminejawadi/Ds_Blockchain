pragma solidity ^0.5.0;

contract Election{

    struct Candidate {
        uint id;
        string name;
        string avatar;
        uint voteCount;
    }
  mapping(uint => Candidate) public candidates;
  mapping( address => bool) public voters;
  uint public candidatesCount;


 event votedEvent (
        uint indexed _candidateId
    );

   constructor() public{
     addCandidate("Candidate 1","image");
     addCandidate("Candidate 2","image2");


 }


    function addCandidate (string memory _name, string memory _image) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _image, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);
        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        // record that voter has voted
        voters[msg.sender] = true;
        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        emit votedEvent(_candidateId);
    }

}
