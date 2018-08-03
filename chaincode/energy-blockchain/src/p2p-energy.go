package main

//=================================================================================================
//========================================================================================== IMPORT
import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

//=================================================================================================
//============================================================================= BLOCKCHAIN DOCUMENT
// Account writes string to the blockchain (as JSON object) for a specific key
type Account struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Coins int    `json:"coins"`
	Token int    `json:"token"`
}

type UpdatedAccount struct {
	Name  string `json:"name"`
	Coins int    `json:"coins"`
	Token int    `json:"token"`
}

type Transact struct {
	Timestamp   string `json:"timestamp"`
	Consumer    string `json:"consumer"`
	Producer    string `json:"producer"`
	Transaction int    `json:"transaction"`
}

//=================================================================================================
//============================================================================================ MAIN
// Main function starts up the chaincode in the container during instantiate
//
var logger = shim.NewLogger("chaincode")

type EnergyChainCode struct {
	// use this structure for information that is held (in-memory) within chaincode
	// instance and available over all chaincode calls
}

func main() {
	err := shim.Start(new(EnergyChainCode))
	if err != nil {
		fmt.Printf("Error starting Energy chaincode: %s", err)
	}
}

//=================================================================================================
//============================================================================================ INIT

func (t *EnergyChainCode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

//=================================================================================================
//========================================================================================== INVOKE

func (t *EnergyChainCode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	// Which function is been called?
	function, args := stub.GetFunctionAndParameters()

	// Route call to the correct function
	switch function {
	case "read":
		return t.read(stub, args)
	case "create":
		return t.create(stub, args)
	case "update":
		return t.update(stub, args)
	case "transact":
		return t.transact(stub, args)
	case "delete":
		return t.delete(stub, args)
	case "history":
		return t.history(stub, args)
	default:
		logger.Warningf("Invoke('%s') invalid!", function)
		return shim.Error("Invalid method! Valid methods are 'read|create|update|transact|delete|history'!")
	}
}

//=================================================================================================
//========================================================================================== CREATE
// Creates a participant by ID
//
func (t *EnergyChainCode) create(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	account, err := getAccountFromArgs(args)
	if err != nil {
		return shim.Error("Account Data is Corrupted")
	}

	// ==== Input sanitation ====
	fmt.Println("- start init account")
	if len(account.ID) <= 0 {
		return shim.Error("id must be a non-empty integer")
	}

	id := account.ID
	name := account.Name
	coins := account.Coins
	token := account.Token

	// ==== Check if account already exists ====
	accountAsBytes, err := stub.GetState(id)
	if err != nil {
		return shim.Error("Failed to get account: " + err.Error())
	} else if accountAsBytes != nil {
		fmt.Println("This account already exists: " + id)
		return shim.Error("This account already exists: " + id)
	}

	// ==== Create account object and marshal to JSON ====
	accountToAdd := &Account{id, name, coins, token}
	accountJSONasBytes, err := json.Marshal(accountToAdd)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save account to state ===
	err = stub.PutState(id, accountJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== Account saved and indexed. Return success ====
	fmt.Println("- end create account")
	return shim.Success(nil)
}

//=================================================================================================
//============================================================================================ READ
// Read account by ID
//
func (t *EnergyChainCode) read(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting id of the account to query")
	}

	id := args[0]

	// Read the value for the ID
	if value, err := stub.GetState(id); err != nil || value == nil {
		return shim.Error("Failed to get state for: " + id)
	} else {
		return shim.Success(value)
	}
}

//=================================================================================================
//========================================================================================== UPDATE
// Updates coins and token by ID
//
func (t *EnergyChainCode) update(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	id := args[0]
	newAccount, err := updateAccountFromArgs(args)
	if err != nil {
		return shim.Error("Account Data is Corrupted")
	}

	newName := newAccount.Name
	newCoins := newAccount.Coins
	newToken := newAccount.Token
	fmt.Println("- start update ", id, newName, newCoins, newToken)

	// Validate that this ID exist and extract value
	newAccountAsBytes, err := stub.GetState(id)
	if err != nil || newAccountAsBytes == nil {
		return shim.Error("Failed to get marble:" + err.Error())
	}

	accountToUpdate := Account{}

	err = json.Unmarshal(newAccountAsBytes, &accountToUpdate) //unmarshal it aka JSON.parse()
	if err != nil {
		return shim.Error(err.Error())
	}
	accountToUpdate.Coins = newCoins //change the coins value
	accountToUpdate.Token = newToken //change the token value
	accountToUpdate.Name = newName   //change the name

	accountJSONasBytes, _ := json.Marshal(accountToUpdate)
	err = stub.PutState(id, accountJSONasBytes) //rewrite the account
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end update (success)")
	return shim.Success(nil)
}

//===================================================================================================
//========================================================================================== TRANSACT
// Transact token by IDs
//
func (t *EnergyChainCode) transact(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	transacts, err := transactAccountFromArgs(args)
	if err != nil {
		return shim.Error("Transact Data is Corrupted")
	}

	for _, transact := range transacts {
		timestamp := transact.Timestamp          // Timestamp of Transaction
		consumer := transact.Consumer            // ID of Consumer
		producer := transact.Producer            // ID of Producer
		transactionValue := transact.Transaction // transaction value
		if err != nil {
			return shim.Error("3rd argument must be a numeric string")
		}
		// Validate the this transaction has not been posted before
		transactionAsBytes, err := stub.GetState(timestamp)
		if err != nil {
			return shim.Error("Failed to get account: " + err.Error())
		} else if transactionAsBytes != nil {
			fmt.Println("This transaction already exists: " + timestamp)
			continue // skip the one that has been posted
		}

		// Validate that IDs exist and extract ids, coins and token
		consumerAsBytes, err := stub.GetState(consumer)
		if err != nil || consumerAsBytes == nil {
			return shim.Error("Consumer Not Found")
		}

		producerAsBytes, err := stub.GetState(producer)
		if err != nil || producerAsBytes == nil {
			return shim.Error("Producer Not Found")
		}

		consumerToUpdate := Account{}
		err = json.Unmarshal(consumerAsBytes, &consumerToUpdate)
		if err != nil {
			return shim.Error(err.Error())
		}

		if producer == "ID000" { //don't get coins from SUN
			consumerToUpdate.Token += transactionValue
		} else {
			consumerToUpdate.Coins -= transactionValue
			consumerToUpdate.Token += transactionValue
		}

		producerToUpdate := Account{}
		err = json.Unmarshal(producerAsBytes, &producerToUpdate)
		if err != nil {
			return shim.Error(err.Error())
		}

		if producer != "ID000" {
			producerToUpdate.Coins += transactionValue
			producerToUpdate.Token -= transactionValue
		}

		consumerJSONasBytes, _ := json.Marshal(consumerToUpdate)
		err = stub.PutState(consumer, consumerJSONasBytes) //rewrite the consumer
		if err != nil {
			return shim.Error(err.Error())
		}

		producerJSONasBytes, _ := json.Marshal(producerToUpdate)
		err = stub.PutState(producer, producerJSONasBytes) //rewrite the producer
		if err != nil {
			return shim.Error(err.Error())
		}

		// ==== Create transact object and marshal to JSON ====
		transactionToAdd := &Transact{timestamp, consumer, producer, transactionValue}
		transactionJSONasBytes, err := json.Marshal(transactionToAdd)
		if err != nil {
			return shim.Error(err.Error())
		}

		// === Save transaction to state ===
		err = stub.PutState(timestamp, transactionJSONasBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

	}

	return shim.Success(nil)
}

//=================================================================================================
//========================================================================================== DELETE
// Delete account by ID
//
func (t *EnergyChainCode) delete(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	id := args[0]

	// Validate that this ID exist
	if value, err := stub.GetState(id); err != nil || value == nil {
		return shim.Error("Failed to get state for: " + id)
	}

	// Delete the message
	if err := stub.DelState(id); err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	return shim.Success(nil)
}

//=================================================================================================
//========================================================================================= HISTORY
// Return history by ID
//
func (t *EnergyChainCode) history(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	id := args[0]

	// Read history
	resultsIterator, err := stub.GetHistoryForKey(id)
	if err != nil {
		return shim.Error("Not Found:" + id)
	}
	defer resultsIterator.Close()

	// Write return buffer
	var buffer bytes.Buffer
	buffer.WriteString("[")
	for resultsIterator.HasNext() {
		response, _ := resultsIterator.Next()
		if buffer.Len() > 15 && (string(response.Value) != "") {
			buffer.WriteString(",")
		}

		if string(response.Value) != "" {
			buffer.WriteString("{\"timestamp\":\"")
			buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).Format(time.Stamp))
			buffer.WriteString("\", \"value\":")
			buffer.WriteString(string(response.Value))
			buffer.WriteString("}")
		}
	}
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())
}

//getAccountFromArgs - construct a consignment structure from string array of arguments
func getAccountFromArgs(args []string) (account Account, err error) {

	err = json.Unmarshal([]byte(args[0]), &account)
	if err != nil {
		return account, err
	}
	return account, nil
}

func updateAccountFromArgs(args []string) (updatedAccount UpdatedAccount, err error) {

	err = json.Unmarshal([]byte(args[1]), &updatedAccount)
	if err != nil {
		return updatedAccount, err
	}
	return updatedAccount, nil
}

func transactAccountFromArgs(args []string) (transacts []Transact, err error) {

	err = json.Unmarshal([]byte(args[0]), &transacts)
	if err != nil {
		return transacts, err
	}
	return transacts, nil
}
