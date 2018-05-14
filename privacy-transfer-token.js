
const fs = require('fs');
const assert = require('assert');
const keythereum = require("keythereum");
const secp256k1 = require('secp256k1');

const net = require('net');
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
const web3 = new Web3(new Web3.providers.IpcProvider('/Users/shuchao/Library/Wanchain/testnet/gwan.ipc', net))
const wanUtil = require('wanchain-util');
web3.wan = new wanUtil.web3Wan(web3)

const keyStorePath = '/Users/shuchao/Library/Wanchain/testnet/keystore/';

const stampABI = require('./stamp-abi');
const farwestPrivacyTokenABI = require('./farwest-privacy-token-abi');
const privacyContractABI = require('./privacy-contract-abi');

const stampSmartContractAddress = '0x00000000000000000000000000000000000000c8';
const farwestPrivacyTokenContractAddress = '0xd4A4b87420269ca95ee6F4ea7dd9c1238d8590ED'; 
const farwestPrivacyTokenContract = web3.eth.contract(farwestPrivacyTokenABI).at(farwestPrivacyTokenContractAddress);

Error.stackTraceLimit = Infinity;

const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        })
    );

function waitUntilTxMined(txHash) {
    let loopLimit = 90;
    let loopCount = 0;

    const transactionReceiptAsync = function(resolve, reject) {
        web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(() => transactionReceiptAsync(resolve, reject), 2000);
                loopCount++;
                if (loopCount >= loopLimit) {
                    reject ('waitUntilTxMined - Timeout!');
                }
            } else {
                resolve(receipt);
            }
        });
    };

    return new Promise(transactionReceiptAsync);
};


main()

async function main(){
    const senderAddress = '0xcAb6aD272D18A52ECd8fc1F37398AbA675145990';
    const senderPassword = '********';
    const senderWanAddress = '0x02dbfa7c8cb8d77f005055fd589f88624e4ca88e75b93b42bfe8a99ff02db2761a02304204862654ca5428d88c6bfe5b43c27fbcb4457d06d78485c69e54e0297154';

    const tokenHolderOTAAddress = wanUtil.generateOTAWaddress(senderWanAddress);
    console.log('tokenHolderOTAAddress is ' + tokenHolderOTAAddress);

    const tokenHolderAddress = getAddressFromWAddress(tokenHolderOTAAddress);
    console.log('tokenHolderAddress is ' + tokenHolderAddress);

    const initAmount = web3.toWei(5000);
    const stampValue = web3.toWei(0.009);

    const recipientAddress = '0x067a7910cdE655B7bA60e745b87Bb8B35cDD47AE';
    const recipientWanAddress = '0x0326d021420ffadb7dd5a45437964756b01041ec1454c6f2dcf97b58081ecdd5f802222dae92af7a6d50343f7a4372b924a3a2000fe66ce5733198f4d606d89d2646';

    // Step1 - Unlock account
    try {
        await promisify(callback => web3.personal.unlockAccount(senderAddress, senderPassword, 99999, callback));
        console.log('Unlock account successfully.');
    } catch (error) {
        console.log(error);
    }

    // Step2 - Init privacy token balance
    let txMintData = farwestPrivacyTokenContract.mintPrivacyToken.getData(tokenHolderAddress, tokenHolderOTAAddress, initAmount);
    let initTxParams = {from:senderAddress, to:farwestPrivacyTokenContractAddress, value:0, data:txMintData, gas: 4000000};
    try {
        txHash = await promisify(callback => web3.eth.sendTransaction(initTxParams, callback));
        console.log ('Init amount for ' + tokenHolderAddress + ' is ' + web3.fromWei(initAmount));
        console.log ('Init asset tx hash is ' + txHash);

        //Wait unitl the tx be mined
        await waitUntilTxMined (txHash)
        console.log ('The init privacy aseset tx has been mined.');
    } catch (error) {
        console.log(error);
    }

    // Step4 - Get the init privacy token by web3
    try {
        ret = await promisify(callback => farwestPrivacyTokenContract.otaBalanceOf(tokenHolderAddress, callback));
        privacyTokenBalance = web3.fromWei(web3.toDecimal(ret));
        console.log ('The privacy balance of ' + tokenHolderAddress + ' is ' + privacyTokenBalance);
        assert.equal (privacyTokenBalance, web3.fromWei(initAmount));
    } catch (error) {
        console.log(error);
    }


    // Step5 - Buy stamp
    const stampContract = web3.eth.contract(stampABI).at(stampSmartContractAddress);
    
    let senderStampOTAAddress = wanUtil.generateOTAWaddress(senderWanAddress);
    let txBuyData = stampContract.buyStamp.getData(senderStampOTAAddress, stampValue);
    let buyStampTxParams = {from:senderAddress, to:stampSmartContractAddress, value:stampValue, data:txBuyData, gas: 4000000}
    try {
        txHash = await promisify(callback => web3.eth.sendTransaction(buyStampTxParams, callback));
        console.log ('Stamp address is ' + senderStampOTAAddress);
        console.log ('Buy stamp tx hash is ' + txHash);

        //Wait unitl the tx in step5 mined
        await waitUntilTxMined (txHash);
        console.log ('The buy stamp tx has been mined.');
    } catch (error) {
        console.log(error);
    }

    // Step7 - Get ring sign data and Send privacy token transaction
    const stampMixNumber = 3;
    try {
        otaSet = await promisify(callback => web3.wan.getOTAMixSet(senderStampOTAAddress, stampMixNumber, callback));

        ringSignData = getRingSignData (senderAddress, senderPassword, senderStampOTAAddress, tokenHolderAddress, otaSet);
        combinedData = getCombinedData (recipientWanAddress, ringSignData);

        console.log('ringSignData is ');
        console.log (ringSignData);

        console.log('combinedData is ');
        console.log (combinedData);

        tokenHolderPrivateKey = '0x' + getOTAPrivateKey(senderAddress, senderPassword, tokenHolderOTAAddress).toString('hex');
        privacyTokenTransaction = {
            Txtype: '0x01',
            from:tokenHolderAddress, 
            to:farwestPrivacyTokenContractAddress, 
            value: '0x0',
            gasPrice: '0x2e90edd000',
            gas: '0x0',
            data:combinedData
        };


console.log (privacyTokenTransaction);

        ret = await promisify(callback => web3.wan.sendPrivacyCxtTransaction(privacyTokenTransaction, tokenHolderPrivateKey, callback));
        console.log ('Send privacy token tx hash is ' + ret);
    } catch (error) {
        console.log(error);
    }


    // Step8 - Search the transfer log
    // Step9 - Parse the transaction data (log?) by the ABI


    process.exit();
}


function getRingSignData (senderAddress, senderPassword, senderStampOTAAddress, tokenHolderAddress, otaSet) {
    let privKey = getPrivateKey(senderAddress, senderPassword);

    let otaSk = wanUtil.computeWaddrPrivateKey(senderStampOTAAddress, privKey[0], privKey[1]);
    let otaPub = wanUtil.recoverPubkeyFromWaddress(senderStampOTAAddress);
    let otaPubK = otaPub.A;
    let otaSetBuf = [];

    for (let i = 0; i < otaSet.length; i++) {
        let rpkc = new Buffer(otaSet[i].slice(2, 68), 'hex');
        let rpcu = secp256k1.publicKeyConvert(rpkc, false);
        otaSetBuf.push(rpcu);
    }

    let message = new Buffer(tokenHolderAddress.slice(2), 'hex');
    let ringArgs = wanUtil.getRingSign(message, otaSk, otaPubK, otaSetBuf);

    ringSignData = generatePubkeyIWQforRing(ringArgs.PubKeys, ringArgs.I, ringArgs.w, ringArgs.q);

    return ringSignData
}

function getCombinedData (recipientWanAddress, ringSingData) {
    let recipientOTAAddress = wanUtil.generateOTAWaddress(recipientWanAddress); 
    let tokenRecipientAddress = getAddressFromWAddress(recipientOTAAddress);
    let transferData = farwestPrivacyTokenContract.otaTransfer.getData(tokenRecipientAddress, recipientOTAAddress, web3.toWei(10));
    let glueContract = web3.eth.contract(privacyContractABI).at('0x0000000000000000000000000000000000000000');

    combinedData = glueContract.combine.getData(ringSingData, transferData);

    return combinedData;
}

function getPrivacyTokenOTAMixSet (senderStampOTAAddress) {
    let stampMixNumber = 3;

    return new Promise(function(resolve, reject){
        web3.wan.getOTAMixSet(senderStampOTAAddress, stampMixNumber, function (error, result) {
            if (error){
                reject (new Error(error));
            } else {
                resolve (result);
            }
        })
    });
}

function getKeystoreFile(address) {
	if (address.substr(0, 2) == '0x' || address.substr(0, 2) == '0X'){
		address = address.substr(2);
	}

    //console.log(address)

	let files = fs.readdirSync(keyStorePath);
	for (i in files) {
		//console.log(files[i])
		file = files[i];
		if (file.toLowerCase().indexOf(address.toLowerCase()) >= 0) {
			return keyStorePath + file;
		}
	}
}

function getKeystoreJSON(address) {
    let fileName = getKeystoreFile(address);
    //console.log('keystore filename is ' + fileName)

    if (fileName) {
        let keystoreStr = fs.readFileSync(fileName, "utf8");
        return JSON.parse(keystoreStr);
    }
}

function getPrivateKey(address, password){
    let keystore = getKeystoreJSON(address);

    let keyAObj = {version:keystore.version, crypto:keystore.crypto};
    let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

    let privKeyA = keythereum.recover(password, keyAObj);
    let privKeyB = keythereum.recover(password, keyBObj);

    return [privKeyA, privKeyB];
}

function getOTAPrivateKey(address, password, OTAAddress) {
    let keystore = getKeystoreJSON(address);

    let keyAObj = {version:keystore.version, crypto:keystore.crypto};
    let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

    let privKeyA = keythereum.recover(password, keyAObj);
    let privKeyB = keythereum.recover(password, keyBObj);

    return wanUtil.computeWaddrPrivateKey(OTAAddress, privKeyA, privKeyB);
}

// Param - WAddress or OTAAddress
function getAddressFromWAddress(WAddress) {
    let token_to_ota_a = wanUtil.recoverPubkeyFromWaddress(WAddress).A;
    return "0x"+wanUtil.sha3(token_to_ota_a.slice(1)).slice(-20).toString('hex');
}

function generatePubkeyIWQforRing(Pubs, I, w, q){
    let length = Pubs.length;
    let sPubs  = [];
    for(let i=0; i<length; i++){
        sPubs.push(Pubs[i].toString('hex'));
    }
    let ssPubs = sPubs.join('&');
    let ssI = I.toString('hex');
    let sw  = [];
    for(let i=0; i<length; i++){
        sw.push('0x'+w[i].toString('hex').replace(/(^0*)/g,""));
    }
    let ssw = sw.join('&');
    let sq  = [];
    for(let i=0; i<length; i++){
        sq.push('0x'+q[i].toString('hex').replace(/(^0*)/g,""));
    }
    let ssq = sq.join('&');

    let KWQ = [ssPubs,ssI,ssw,ssq].join('+');
    return KWQ;
};


