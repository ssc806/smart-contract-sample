pragma solidity ^0.4.21;

// Abstract contract for the full ERC 20 Token standard
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
// https://github.com/ConsenSys/Tokens/blob/master/contracts/eip20/EIP20Interface.sol
contract EIP20Interface {
    uint256 public totalSupply;
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract EIP20 is EIP20Interface {
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

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

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
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

contract FarwestToken is EIP20 {
    string public constant name = "FarwestToken";
    string public constant symbol = "FWT";
    uint8 public constant decimals = 18;
    uint256 initialSupply = 210000000000 * 10 ** uint256(decimals);
    address owner;

    constructor () EIP20 (initialSupply, name, decimals, symbol) public {
        owner = msg.sender;
    }

    function mintToken(address recipient, uint amount) public {
        require (msg.sender == owner);

        balances[recipient] += amount;
        totalSupply += amount;
        emit Transfer(0, this, amount);
        emit Transfer(this, recipient, amount);
    }

    function () public payable {
        address recipient = msg.sender;
        uint256 getTokens = 1 * msg.value; // 1:1 to get tokens, msg.value is the received ether
        balances[recipient] += getTokens;
        balances[owner] -= getTokens;
        
        emit Transfer(owner, recipient, getTokens);
        
        owner.transfer(msg.value);
    }    
}
