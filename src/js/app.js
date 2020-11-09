App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },


  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var table = $("#table");
    loader.show();
    content.hide();
    table.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
    App.account = account;
    $("#accountAddress").html("Your Account Address is : " + account);
    }
    });


    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();
    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();
    for (var i = 1; i <= candidatesCount; i++) {

    electionInstance.candidates(i).then(function(candidate) {
    var avatar = candidate [2];
    var id = candidate[0];
    var name = candidate[1];
    var voteCount = candidate[3];

    // Render candidate Result
    var candidateTemplate = "<tr><th>" + avatar + "</th><th>" + id + "</th><td>" + name +
    "</td><td>" + voteCount  + "</td></tr>"
    candidatesResults.append(candidateTemplate);
    // Render candidate ballot option
    //var candidateOption = "<li><input type='checkbox'  value='" + id + "' >  " + name + "</li>"
    candidatesSelect.append("<div class='form-check'><input class='form-check-input' type='checkbox' value='' id= " + id + "> <label class='form-check-label' for=0>  "+ name +"  </label></div>");
    });
    }
    return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
    // Do not allow a user to vote
    if(hasVoted) {
    $('form').hide();
    table.show();
    }
    loader.hide();
    content.show();
    }).catch(function(error) {
    console.warn(error);
    });
    }
  ,

  castVote: function() {



    // Checks whether a candidate is chosen or not.
    // if it is, we get the Candidate's ID, which we will use
    // when we call the vote function in Smart Contracts
    if ($("#candidatesSelect :checkbox:checked").length > 0){
      // just takes the first checked box and gets its id
      var candidateId = $("#candidatesSelect :checkbox:checked")[0].id
    }
    else {
      // print message if user didn't vote for candidate
     console.log('please select a condidate first')
      return
    }
   // Actually voting for the Candidate using the Contract and displaying "Voted"
    App.contracts.Election.deployed().then(function(instance) {return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
    // Wait for votes to update
    $("#content").hide();
    $("#loader").show();
    $("#table").show();
    }).catch(function(err) {
    console.error(err);
    });
    },


    listenForEvents: function() {
      App.contracts.Election.deployed().then(function(instance) {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("event triggered", event)
          // Reload when a new vote is recorded
          App.render();
        });
      });
    },
    initContract: function() {
      $.getJSON("Election.json", function(election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);

        App.listenForEvents();

        return App.render();
      });
    }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
