
const Web3 = require('web3');
const util = require('util')
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const wanUtil = require('wanchain-util');
const keythereum = require('keythereum');

const senderAddress = '0xcAb6aD272D18A52ECd8fc1F37398AbA675145990';
const senderPassword = '********';
const recipientCount = 2;
const recipient = '0xE915bD5624623dF50f9a6Dd5B585692e2dABC9B0';

function getPrivatekeyByKeystore(){
    const datadir = '/Users/shuchao/Library/Wanchain/testnet';
    //const datadir = '/home/shuchao/.wanchain/testnet';
    const address= senderAddress;
    const passphrase = senderPassword;

    let keyObject = keythereum.importFromFile(address, datadir);
    let privateKey = keythereum.recover(passphrase, keyObject);

    console.log('Private key is: ' + privateKey.toString('hex'));

    return privateKey;
}

function transferToken (){
    const privateKey = getPrivatekeyByKeystore()

    for (let i = 0; i < recipientCount; i++) { 
        web3.personal.unlockAccount(senderAddress, senderPassword, 99999);

        let nonce = web3.eth.getTransactionCount(senderAddress);
        let value = 1*1e18;

        let rawTransaction = {
            "Txtype" : 0x01,
            "nonce": nonce + i,
            "gasPrice": 200*1e9,
            "gasLimit": 470000,
            "to": recipient,
            "value": value,
            "data": "",
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


