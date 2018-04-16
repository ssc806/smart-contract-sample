
const Web3 = require('web3');
const abi = require('./standard-token-abi');

//const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.9:8545"));
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

//ETH - Main
//const fromAddress = '0xc333d44b565bebf4045b662a36353a841f96d98f';

//ETH - Rinkeby
const fromAddress = '0x50ce3d591446bd26c470a79ed9e150d0bb9e84e1';

//ETH - Main - Wanchain Coin
//URL - https://etherscan.io/address/0x5fc6de61258e63706543bb57619b99cc0e5a5a1f
//const contractAddress = '0x5fc6de61258e63706543bb57619b99cc0e5a5a1f';
//const tokenHolderAddress = '0x0001cdC69b1eb8bCCE29311C01092Bdcc92f8f8F';

//ETH - Rinkeby - ERC20-TOKEN
//URL - https://rinkeby.etherscan.io/token/0xddf4ff23da2a7546dc2fc7554797f746ac33b2cc
const contractAddress = '0xddf4ff23da2a7546dc2fc7554797f746ac33b2cc';
const tokenHolderAddress = '0xf0ee1855d7a54cf7436ad5866e02f34d0b835ba5';

const tokenContract = web3.eth.contract(abi).at(contractAddress);

// Get the token name
tokenContract.name.call (function(err, name){
	if(err) { 
	    console.log(err);
	} else {
	    console.log('The token name is: ' + name);
	}
})

// Get the token symbol
tokenContract.symbol.call(function(err, symbol) {
	if(err) { 
		console.log(err);
	} else {
		console.log('Token symbol: ' + symbol);
	}
})

// Get the token symbol
tokenContract.totalSupply.call(function(err, totalSupply) {
	if(err) { 
		console.log(err);
	} else {
		console.log('Token total supply: ' + totalSupply);
	}
})

//Get token balance
tokenContract.balanceOf.call (tokenHolderAddress, function(err, balance){
	if(err) { 
		console.log(err);
	} else {
		console.log('The balance is: ' + balance);
	}
});

//var value = '100' // Base 10, accounts for decimals.
//tokenContract.transfer(toAddress, value, { from: fromAddress }, function (err, txHash) {
//	if (err) {
//	    console.error(err)
//	} else {
//	    console.log('Transaction sent')
//	    console.dir(txHash)
//	}
//})







