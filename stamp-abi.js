
module.exports = [
	{
		"constant":false,
		"type":"function",
		"stateMutability":"nonpayable",

		"inputs":[
			{
				"name":"OtaAddr",
				"type":"string"
			},
			{
				"name":"Value",
				"type":"uint256"
			}
		],

		"name":"buyStamp",

		"outputs":[
			{
				"name":"OtaAddr",
				"type":"string"
			},
			{
				"name":"Value",
				"type":"uint256"
			}
		]
	},

	{
		"constant":false,
		"type":"function",
		"inputs":[
			{
				"name":"RingSignedData",
				"type":"string"
			},
			{
				"name":"Value",
				"type":"uint256"
			}
		],

		"name":"refundCoin",

		"outputs":[
			{
				"name":"RingSignedData",
				"type":"string"
			},
			{
				"name":"Value",
				"type":"uint256"
			}
		]
	},

	{
		"constant":false,
		"type":"function",
		"stateMutability":"nonpayable",
		"inputs":[],
		"name":"getCoins",
		"outputs":[
			{
				"name":"Value",
				"type":"uint256"
			}
		]
	}
];



