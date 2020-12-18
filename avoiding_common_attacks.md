
# Avoiding Common Attacks

## **Integer Overflow/Underflow** 

The SafeMath library by OpenZeppelin has been used to avoid integer the integer overflow and underflow.

## **Reentrancy Attacks** 

In the withdraw function, the balance is set to zero, before transferring the store front balance.

## **Tx Origin Attacks**

Using msg.sender instead of tx.origin for transferring funds.

## **Restricting Access** 

The call of some functions is restricted to specific addresses (market owner, admins, or store owners) to avoid calling functions by unauthorized addresses. 

## **DoS with Block Gas Limit**

Looping in the array are avoided to protect contract from reaching block gas limit
