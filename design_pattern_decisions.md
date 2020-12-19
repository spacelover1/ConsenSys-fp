# Design Pattern Decisions

## Fail Early and Fail Loud

All functions verified the execution required condition by using modifiers or check conditions at the beginning of the function body then throw an exception if the condition is not met.

## Restricting Access

All main functions that modify the contract state are restricted to specific addresses (admins, or store owners) to avoid calling functions by unauthorized addresses.

## Circuit Breaker

The market state can be changed to inactive state by admin for the emergency.

## Self Destruction

If there is a bug founded, the contract can be stopped permanently by admin.

## EthPM

Ownable contract and SafeMath library from OpenZeppelin are used within the smart contract.

 ## Events and Logs

All main functions that modify contract state are issue an event, which is helpful for UI interactions.

## Gas Optimization

Loops are computationally expensive therefore, it's avoided in this contract. 


