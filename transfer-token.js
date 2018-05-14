
const Web3 = require('web3');
const util = require('util')
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const abi = require('./standard-token-abi');
const wanUtil = require('wanchain-util');
const keythereum = require('keythereum');

const senderAddress = '0xcAb6aD272D18A52ECd8fc1F37398AbA675145990';
const senderPassword = 'viral123';
const contractAddress = '0xA4B45E5D5eEE0eb8305Ee6c7b621979aac31DF69';
const recipientCount = 100;

function precisionRound(number, precision) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function getPrivatekeyByKeystore(){
    const datadir = '/Users/shuchao/Library/Wanchain/testnet';
    const address= senderAddress;
    const passphrase = senderPassword;

    let keyObject = keythereum.importFromFile(address, datadir);
    let privateKey = keythereum.recover(passphrase, keyObject);

    console.log('Private key is: ' + privateKey.toString('hex'));

    return privateKey;
}

function transferToken (){
    const tokenContract = web3.eth.contract(abi).at(contractAddress);
    privateKey = getPrivatekeyByKeystore()

    for (let i = 0; i < recipientCount; i++) { 
        web3.personal.unlockAccount(senderAddress, senderPassword, 99999);

        let nonce = web3.eth.getTransactionCount(senderAddress);
        let recipient = web3.personal.newAccount('1');

        let value = precisionRound(Math.random(), 2) + 1;
        let inputData = tokenContract.transfer.getData(recipient, value*1e18, {from: senderAddress});
        //console.log(inputData);

        let rawTransaction = {
            "Txtype" : 0x01,
            "nonce": nonce + i,
            "gasPrice": 200*1e9,
            "gasLimit": 4700000,
            "to": contractAddress,
            "value": 0,
            "data": inputData,
            "chainId": 0x03
        };

        let tx = new wanUtil.wanchainTx(rawTransaction);
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, txHash) {
            if (!err){
                console.log(util.format('Transaction sent, the hash is %s, recipient is %s, value is %s', 
                         txHash, recipient, value)); 
            } else {
                console.log(err);
            }
        })
    }
}

transferToken()


