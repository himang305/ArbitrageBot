require('dotenv').config()
const moment = require('moment-timezone')
const express = require('express')
const http = require('http')
const { ethers } = require('ethers');
const fs = require('fs');
const Tx = require('ethereumjs-tx').Transaction;                       // transaction - build sign broadcast -3 part
const Web3 = require('web3');
const CircularJSON = require('circular-json');



const privateKey = process.env.PRIVATE_KEY;

// SERVER CONFIG
const PORT = process.env.PORT || 5001
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${PORT}`))
const account1 = process.env.PUBLIC_ADDRESS; // Owner Address
const contract_address = process.env.FLASH_SWAP_ADDRESS;
const USDC = process.env.USDC;


const rpcURL = 'https://mainnet.infura.io/v3/f998ced497794c81945998e5e9d3b455';
const hash = '0x1bbfe9ffef5c9f97dd75324f5795c546a9b93fe7056d780e56994bd46e6f50ff';

const web3 = new Web3(rpcURL);

const UNISWAP_FACTORY_ABI = [{ "name": "NewExchange", "inputs": [{ "type": "address", "name": "token", "indexed": true }, { "type": "address", "name": "exchange", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "initializeFactory", "outputs": [], "inputs": [{ "type": "address", "name": "template" }], "constant": false, "payable": false, "type": "function", "gas": 35725 }, { "name": "createExchange", "outputs": [{ "type": "address", "name": "out" }], "inputs": [{ "type": "address", "name": "token" }], "constant": false, "payable": false, "type": "function", "gas": 187911 }, { "name": "getExchange", "outputs": [{ "type": "address", "name": "out" }], "inputs": [{ "type": "address", "name": "token" }], "constant": true, "payable": false, "type": "function", "gas": 715 }, { "name": "getToken", "outputs": [{ "type": "address", "name": "out" }], "inputs": [{ "type": "address", "name": "exchange" }], "constant": true, "payable": false, "type": "function", "gas": 745 }, { "name": "getTokenWithId", "outputs": [{ "type": "address", "name": "out" }], "inputs": [{ "type": "uint256", "name": "token_id" }], "constant": true, "payable": false, "type": "function", "gas": 736 }, { "name": "exchangeTemplate", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 633 }, { "name": "tokenCount", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 663 }]
const UNISWAP_FACTORY_ADDRESS = '0xc0a47dfe034b400b47bdad5fecda2621de6c4d95'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)



const UNISWAP_EXCHANGE_ABI = [{ "name": "TokenPurchase", "inputs": [{ "type": "address", "name": "buyer", "indexed": true }, { "type": "uint256", "name": "eth_sold", "indexed": true }, { "type": "uint256", "name": "tokens_bought", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "EthPurchase", "inputs": [{ "type": "address", "name": "buyer", "indexed": true }, { "type": "uint256", "name": "tokens_sold", "indexed": true }, { "type": "uint256", "name": "eth_bought", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "AddLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "eth_amount", "indexed": true }, { "type": "uint256", "name": "token_amount", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "RemoveLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "eth_amount", "indexed": true }, { "type": "uint256", "name": "token_amount", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "Transfer", "inputs": [{ "type": "address", "name": "_from", "indexed": true }, { "type": "address", "name": "_to", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "Approval", "inputs": [{ "type": "address", "name": "_owner", "indexed": true }, { "type": "address", "name": "_spender", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "setup", "outputs": [], "inputs": [{ "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 175875 }, { "name": "addLiquidity", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_liquidity" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 82616 }, { "name": "removeLiquidity", "outputs": [{ "type": "uint256", "name": "out" }, { "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "amount" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 116814 }, { "name": "__default__", "outputs": [], "inputs": [], "constant": false, "payable": true, "type": "function" }, { "name": "ethToTokenSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 12757 }, { "name": "ethToTokenTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": true, "type": "function", "gas": 12965 }, { "name": "ethToTokenSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 50463 }, { "name": "ethToTokenTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": true, "type": "function", "gas": 50671 }, { "name": "tokenToEthSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 47503 }, { "name": "tokenToEthTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": false, "type": "function", "gas": 47712 }, { "name": "tokenToEthSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 50175 }, { "name": "tokenToEthTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": false, "type": "function", "gas": 50384 }, { "name": "tokenToTokenSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 51007 }, { "name": "tokenToTokenTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 51098 }, { "name": "tokenToTokenSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 54928 }, { "name": "tokenToTokenTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 55019 }, { "name": "tokenToExchangeSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 49342 }, { "name": "tokenToExchangeTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 49532 }, { "name": "tokenToExchangeSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 53233 }, { "name": "tokenToExchangeTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 53423 }, { "name": "getEthToTokenInputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_sold" }], "constant": true, "payable": false, "type": "function", "gas": 5542 }, { "name": "getEthToTokenOutputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }], "constant": true, "payable": false, "type": "function", "gas": 6872 }, { "name": "getTokenToEthInputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }], "constant": true, "payable": false, "type": "function", "gas": 5637 }, { "name": "getTokenToEthOutputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }], "constant": true, "payable": false, "type": "function", "gas": 6897 }, { "name": "tokenAddress", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413 }, { "name": "factoryAddress", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1443 }, { "name": "balanceOf", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "_owner" }], "constant": true, "payable": false, "type": "function", "gas": 1645 }, { "name": "transfer", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 75034 }, { "name": "transferFrom", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_from" }, { "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 110907 }, { "name": "approve", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_spender" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 38769 }, { "name": "allowance", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "_owner" }, { "type": "address", "name": "_spender" }], "constant": true, "payable": false, "type": "function", "gas": 1925 }, { "name": "name", "outputs": [{ "type": "bytes32", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1623 }, { "name": "symbol", "outputs": [{ "type": "bytes32", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1653 }, { "name": "decimals", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1683 }, { "name": "totalSupply", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1713 }]

const KYBER_RATE_ABI = [{ "inputs": [{ "internalType": "address", "name": "_admin", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }], "name": "AdminClaimed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newAlerter", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isAdd", "type": "bool" }], "name": "AlerterAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sendTo", "type": "address" }], "name": "EtherWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "trader", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "src", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "dest", "type": "address" }, { "indexed": false, "internalType": "address", "name": "destAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "actualSrcAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "actualDestAmount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "platformWallet", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "platformFeeBps", "type": "uint256" }], "name": "ExecuteTrade", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "contract IKyberHint", "name": "kyberHintHandler", "type": "address" }], "name": "KyberHintHandlerSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "contract IKyberNetwork", "name": "newKyberNetwork", "type": "address" }, { "indexed": false, "internalType": "contract IKyberNetwork", "name": "previousKyberNetwork", "type": "address" }], "name": "KyberNetworkSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newOperator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isAdd", "type": "bool" }], "name": "OperatorAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sendTo", "type": "address" }], "name": "TokenWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "pendingAdmin", "type": "address" }], "name": "TransferAdminPending", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "newAlerter", "type": "address" }], "name": "addAlerter", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOperator", "type": "address" }], "name": "addOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "claimAdmin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "enabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getAlerters", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ERC20", "name": "src", "type": "address" }, { "internalType": "contract ERC20", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "srcQty", "type": "uint256" }], "name": "getExpectedRate", "outputs": [{ "internalType": "uint256", "name": "expectedRate", "type": "uint256" }, { "internalType": "uint256", "name": "worstRate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "src", "type": "address" }, { "internalType": "contract IERC20", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "srcQty", "type": "uint256" }, { "internalType": "uint256", "name": "platformFeeBps", "type": "uint256" }, { "internalType": "bytes", "name": "hint", "type": "bytes" }], "name": "getExpectedRateAfterFee", "outputs": [{ "internalType": "uint256", "name": "expectedRate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getOperators", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "kyberHintHandler", "outputs": [{ "internalType": "contract IKyberHint", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "kyberNetwork", "outputs": [{ "internalType": "contract IKyberNetwork", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxGasPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pendingAdmin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "alerter", "type": "address" }], "name": "removeAlerter", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "removeOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IKyberHint", "name": "_kyberHintHandler", "type": "address" }], "name": "setHintHandler", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IKyberNetwork", "name": "_kyberNetwork", "type": "address" }], "name": "setKyberNetwork", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }], "name": "swapEtherToToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }], "name": "swapTokenToEther", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "src", "type": "address" }, { "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "internalType": "contract IERC20", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }], "name": "swapTokenToToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "src", "type": "address" }, { "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "internalType": "contract IERC20", "name": "dest", "type": "address" }, { "internalType": "address payable", "name": "destAddress", "type": "address" }, { "internalType": "uint256", "name": "maxDestAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }, { "internalType": "address payable", "name": "platformWallet", "type": "address" }], "name": "trade", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "contract ERC20", "name": "src", "type": "address" }, { "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "internalType": "contract ERC20", "name": "dest", "type": "address" }, { "internalType": "address payable", "name": "destAddress", "type": "address" }, { "internalType": "uint256", "name": "maxDestAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }, { "internalType": "address payable", "name": "walletId", "type": "address" }, { "internalType": "bytes", "name": "hint", "type": "bytes" }], "name": "tradeWithHint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "src", "type": "address" }, { "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "internalType": "contract IERC20", "name": "dest", "type": "address" }, { "internalType": "address payable", "name": "destAddress", "type": "address" }, { "internalType": "uint256", "name": "maxDestAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minConversionRate", "type": "uint256" }, { "internalType": "address payable", "name": "platformWallet", "type": "address" }, { "internalType": "uint256", "name": "platformFeeBps", "type": "uint256" }, { "internalType": "bytes", "name": "hint", "type": "bytes" }], "name": "tradeWithHintAndFee", "outputs": [{ "internalType": "uint256", "name": "destAmount", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "transferAdmin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "transferAdminQuickly", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address payable", "name": "sendTo", "type": "address" }], "name": "withdrawEther", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "sendTo", "type": "address" }], "name": "withdrawToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const KYBER_RATE_ADDRESS = '0x9AAb3f75489902f3a48495025729a0AF77d4b11e'
const kyberRateContract = new web3.eth.Contract(KYBER_RATE_ABI, KYBER_RATE_ADDRESS)


async function checkPair(args) {
  const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args

  const exchangeAddress = await uniswapFactoryContract.methods.getExchange(outputTokenAddress).call()
  const exchangeContract = new web3.eth.Contract(UNISWAP_EXCHANGE_ABI, exchangeAddress)

  const uniswapResult = await exchangeContract.methods.getEthToTokenInputPrice(inputAmount).call()
  let kyberResult = await kyberRateContract.methods.getExpectedRate(inputTokenAddress, outputTokenAddress, inputAmount).call()

  var priceUniswap = web3.utils.fromWei(uniswapResult, 'Ether');
  var priceKyberswap = web3.utils.fromWei(kyberResult.expectedRate, 'Ether')

  var shouldStartUni = priceUniswap < priceKyberswap ? true : false;
  var spread = Math.abs((priceKyberswap / priceUniswap - 1) * 100);


  var jsonData = {
    'Input Token': inputTokenSymbol,
    'Output Token': outputTokenSymbol,
    'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
    'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
    'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
    'Timestamp': moment().tz('Asia/Calcutta').format(),
    'Spread:': spread,
};
var jsonContent = JSON.stringify(jsonData,null,10);

var stream = fs.createWriteStream("bot_logs.json", {flags:'a'});
    stream.write(jsonContent + ",");
    stream.end();


// fs.appendFile( "bot_logs.json", jsonContent, 'utf8', function (err) {
//   if (err) {
//       console.log("An error occured while writing JSON Object to File.");
//       return console.log(err);
//   }
// });

  // console.table([{
  //   'Input Token': inputTokenSymbol,
  //   'Output Token': outputTokenSymbol,
  //   'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
  //   'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
  //   'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
  //   'Timestamp': moment().tz('Asia/Calcutta').format(),
    
  // }])

  const shouldSendTx = spread > 3 ? 1 : 0;

  if (!shouldSendTx) return;

  var abi = [
    {
      "inputs": [
        {
          "internalType": "contract ISwapRouter",
          "name": "_swapRouter",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_factory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_WETH9",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "kyberAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "Received",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "WETH9",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "token0",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "token1",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "token2",
              "type": "address"
            },
            {
              "internalType": "uint24",
              "name": "fee1",
              "type": "uint24"
            },
            {
              "internalType": "uint256",
              "name": "amount0",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount1",
              "type": "uint256"
            },
            {
              "internalType": "uint24",
              "name": "fee2",
              "type": "uint24"
            },
            {
              "internalType": "bool",
              "name": "unikyb",
              "type": "bool"
            }
          ],
          "internalType": "struct FlashSwaps.FlashParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "initFlash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "refundETH",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "swapRouter",
      "outputs": [
        {
          "internalType": "contract ISwapRouter",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountMinimum",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "sweepToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "fee0",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fee1",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "uniswapV3FlashCallback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountMinimum",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "unwrapWETH9",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "withdrawToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

  var contracts = new web3.eth.Contract(abi, contract_address);

  web3.eth.accounts.wallet.add(privateKey);

  const tx = await contracts.methods.initFlash({
    token0: ethers.utils.getAddress("0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"),   // MKR
    token1: ethers.utils.getAddress(USDC),   // USDC
    token2: ethers.utils.getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),  // weth
    fee1: 500,
    amount0: ethers.utils.parseUnits("100"),
    amount1: 0,
    fee2: 500,
    unikyb: shouldStartUni,
  })
  // const tx = await contracts.methods.approve("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",200);
  const gas = await tx.estimateGas({ from: account1 });
  // const gas = 1020000;
  const gasPrice = await web3.eth.getGasPrice();
  const nonce = await web3.eth.getTransactionCount(account1);

  const data = tx.encodeABI();

  const txData = {
    from: account1,
    to: contract_address,
    data: data,
    gas,
    gasPrice,
    nonce,
    'chainId': 1
  };

const str = CircularJSON.stringify(tx,null,10);

var stream = fs.createWriteStream("bot_logs.json", {flags:'a'});
  stream.write(str + ",");
  const receipt = await web3.eth.sendTransaction(txData);
  stream.write(`Transaction hash: ${receipt.transactionHash}` + ",");
  stream.write('SUCCESS! TX MINED' + ",");
  stream.end();
}

let priceMonitor
let monitoringPrice = false

async function monitorPrice() {
  if (monitoringPrice) {
    return
  }

  console.log("Checking prices...")
  monitoringPrice = true

  try {

    await checkPair({
      inputTokenSymbol: 'WETH',
      inputTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      outputTokenSymbol: 'MKR',
      outputTokenAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      inputAmount: web3.utils.toWei('1', 'ETHER')
    })

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

  monitoringPrice = false
}

const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)

