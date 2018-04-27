
const Web3 = require('web3');
const abi = require('./standard-token-abi');
const abiDecoder = require('abi-decoder');

//const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.9:8545"));
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

//ETH - Main
//const fromAddress = '0xc333d44b565bebf4045b662a36353a841f96d98f';

//ETH - Rinkeby
//const fromAddress = '0x50ce3d591446bd26c470a79ed9e150d0bb9e84e1';

//WANCHAIN - Testnet
const fromAddress = '0xcAb6aD272D18A52ECd8fc1F37398AbA675145990'

//ETH - Main - Wanchain Coin
//URL - https://etherscan.io/address/0x5fc6de61258e63706543bb57619b99cc0e5a5a1f
//const contractAddress = '0x5fc6de61258e63706543bb57619b99cc0e5a5a1f';
//const tokenHolderAddress = '0x0001cdC69b1eb8bCCE29311C01092Bdcc92f8f8F';

//ETH - Rinkeby - ERC20-TOKEN
//URL - https://rinkeby.etherscan.io/token/0xddf4ff23da2a7546dc2fc7554797f746ac33b2cc
//const contractAddress = '0xddf4ff23da2a7546dc2fc7554797f746ac33b2cc';
//const tokenHolderAddress = '0xf0ee1855d7a54cf7436ad5866e02f34d0b835ba5';

//WANCHAIN - Testnet
const contractAddress = '0xa4b45e5d5eee0eb8305ee6c7b621979aac31df69';
const tokenHolderAddress = '0xcAb6aD272D18A52ECd8fc1F37398AbA675145990';

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
tokenContract.symbol.call (function(err, symbol) {
	if(err) { 
		console.log(err);
	} else {
		console.log('Token symbol: ' + symbol);
	}
})

// Get the token total supply
tokenContract.totalSupply.call (function(err, totalSupply) {
	if(err) { 
		console.log(err);
	} else {
		console.log('Token total supply: ' + totalSupply.div(1e18));
	}
})

//Get token balance
tokenContract.balanceOf.call (tokenHolderAddress, function(err, balance){
	if(err) { 
		console.log(err);
	} else {
		console.log('The balance is: ' + balance.div(1e18));
	}
})

//Transfer tokens
web3.personal.unlockAccount(fromAddress, 'viral123', 60)
tokenContract.transfer('0xc333d44b565bebf4045b662a36353a841f96d98f', 1*1e18, {from: fromAddress}, function (err, txHash) {
	if (err) {
	    console.error(err)
	} else {
	    console.log('Transaction sent, the hash is ' + txHash)
	}
})

//Parse input data
const txHash = '0x5802e819eb97a56a3fb0e77c58be30b1675f64caff0e508ca50045d9744e0617'
web3.eth.getTransaction(txHash, function(err, result) { 
	if (err) {
		console.log(err);
	}
	else {
		const inputData = result.input;

		abiDecoder.addABI(abi);
		const decodedData = abiDecoder.decodeMethod(inputData);

		console.log(decodedData);

		console.log('From Address: ' + result.from);
		console.log('To Address: ' + decodedData.params[0].value);
		console.log('Token Transacted: ' + (web3.fromWei(decodedData.params[1].value, 'ether'))); 		
	}
})

