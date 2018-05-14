pragma solidity ^0.4.21;

// Abstract contract for the full ERC 20 Token standard
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
// https://github.com/ConsenSys/Tokens/blob/master/contracts/eip20/EIP20Interface.sol
contract EIP20Interface {
    uint256 public totalSupply;
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    function otaTransfer(address _toAddress, bytes _toOTAAddress, uint256 _value) public returns (bool success);
    function otaBalanceOf(address _owner) public constant returns (uint256 balance);

    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event OtaTransfer(address indexed _from, address indexed _to, bytes _toOTAAddress, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract EIP20 is EIP20Interface {
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    mapping (address => uint256) public privacyBalance;
    mapping (address => bytes) public otaKey;

    string public name;
    uint8 public decimals;
    string public symbol;

    constructor (
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
    ) public {
        balances[msg.sender] = _initialAmount;
        totalSupply = _initialAmount;
        name = _tokenName;
        decimals = _decimalUnits;
        symbol = _tokenSymbol;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowance >= _value);
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowance < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value);
        return true;
    }

    function otaTransfer(address _toAddress, bytes _toOTAAddress, uint256 _value) public returns (bool success) {      
        require(privacyBalance[msg.sender] >= _value);
        
        privacyBalance[msg.sender] -= _value;
        privacyBalance[_toAddress] += _value;
        otaKey[_toAddress] = _toOTAAddress;
        emit OtaTransfer(msg.sender, _toAddress, _toOTAAddress, _value);
        return true;
    } 

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function otaBalanceOf(address _owner) public view returns (uint256 balance) {
        return privacyBalance[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}

contract FarwestPrivacyToken is EIP20 {
    string public constant name = "FarwestToken";
    string public constant symbol = "FWT";
    uint8 public constant decimals = 18;
    uint256 initialSupply = 210000000000 * 10 ** uint256(decimals);
    address owner;

    constructor () EIP20 (initialSupply, name, decimals, symbol) public {
        //owner = msg.sender;
    }

    function mintPrivacyToken(address toAddress, bytes toOTAAddress, uint amount) public {
        //require (msg.sender == owner);

        privacyBalance[toAddress] += amount;
        otaKey[toAddress] = toOTAAddress;
        emit OtaTransfer(0, toAddress, toOTAAddress, amount);
    }  
}


