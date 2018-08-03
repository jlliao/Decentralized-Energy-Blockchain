# Decentralized Energy with Hyperledger Fabric

<div style='border: 2px solid #f00;'>
  <img width="600" src="images/app_intro.gif">
</div>
</br>

A key application of Blockchain being currently explored is a Decentralized Energy network. The idea stems from a neighborhood marketplace, employed with a microgrid where certain Prosumers are producing energy through Solar panels or other means, and can sell excess energy to Consumers needing energy. The transactions would be based on coins in each Resident's account. As per a pre-determined contract and rate, the coins would be debited from the consumer and credited to the producer, for a certain billing period. Each transaction would need to be atomic and added to a Blockchain ledger for trust and verification. The network can be futher extended to include Retailers to transact coins for other currency. The network can also include various green-energy companies who can buy or provide energy through the network.

In this code pattern, we will create such a Blockchain application using Hyperledger Fabric. The network consists of Prosumer and Consumer. Prosumer and Consumer can exchange coins for energy among each other.  The application assumes a pre-paid system where transactions occur after the energy is consumed and the values are updated.

This code pattern is for developers looking to start building Blockchain applications with Hyperledger Composer. When the reader has completed this code pattern, they will understand how to:

* Create a network using Hyperledge Fabric chaincode and recording transactions on Blockchain ledger
* Deploying the network to a service instance of Hyperledger Fabric on SAP Cloud Platform
* Building an Angular app to interact with the network through REST API
* Connecting a Raspberry Pi device to the network through the app


# Architecture Flow

<p align="center">
  <img width="756" height="167.2" src="images/arch.png">
</p>

1. The administrator interacts with Decentralized Energy UI comprising of Angular framework
2. The IoT device (Raspberry Pi) signals energy generation and transaction to the application
3. The application processes user requests to the network through a REST API
4. Implements requests to the Blockchain state database on Hyperledger Fabric v1.1
5. The REST API is used to retrieve the state of the database
6. The Angular framework gets the data through GET calls to the REST API

# Included Components

* Hyperledger Fabric on SAP Cloud Platform
* Raspberry Pi
* Angular Framework


# Running the Application
Follow these steps to setup and run this code pattern. The steps are described in detail below.

## Prerequisite
- Operating Systems: Ubuntu Linux 14.04 / 16.04 LTS (both 64-bit), or Mac OS 10.12
- [npm](https://www.npmjs.com/)  (v5.x)
- [Node](https://nodejs.org/en/) (version 8.9 or higher)
  * to install specific Node version you can use [nvm](https://davidwalsh.name/nvm)
- [Homebrew](https://brew.sh) for Mac OS X installation
- [Cloud Foundry](https://www.cloudfoundry.org) if you want to deploy the app on SAP Cloud Platform
  * to tap the Cloud Foundry formula repository (Mac OS X)
    `brew tap cloudfoundry/tap`
  * to install the cf CLI:
    `brew install cf-cli`
  * to use the cf CLI installer for Mac OS X you can download [the OS X installer](https://cli.run.pivotal.io/stable?release=macosx64&source=github)
- [Hyperledger Fabric on SAP Cloud Platform](https://help.sap.com/viewer/product/HYPERLEDGER_FABRIC/BLOCKCHAIN/en-US)

## Steps
1. [Clone the repo](#1-clone-the-repo)
2. [Configure Chaincode](#2-configure-the-chaincode)
3. [Describe REST API Using OpenAPI](#3-describe-rest-api-using-openapi)
4. [Setup Chaincode Manifest](#4-deploy-to-fabric)
5. [Run Chaincode](#5-run-chaincode)
6. [Call Chaincode from Application](#6-call-chaincode-from-application)
7. [Integrate IoT Device](#7-integrate-iot-device)


## 1. Clone the repo

Clone the `Decentralized-Energy-Blockchain code` locally. In a terminal, run:

```
git clone https://github.com/jlliao/Decentralized-Energy-Blockchain
cd Decentralized-Energy-Blockchain
```


## 2. Configure Chaincode

To explore the Chaincode file, go into the chaincode folder and locate the specific GO file.

```
cd chaincode/energy-blockchain/src
open p2p-energy.go
```

The simplest approach is to define the different messages that will be written to the blockchain as GO structures. Then enrich each structure with JSON tags. (Keep in mind that only those structure fields that start with a capital letter will be marshalled to JSON.) Below is the account structure of Prosumer and Consumer.

```go
type Account struct {
	ID  	   string `json:"id"`
	Name	   string `json:"name"`
	Coins      int    `json:"coins"`
	Token      int    `json:"token"`
}
```

The GO programming language already provides a rich library for transforming structures into JSON payload. Therefore, you can simply include the `encoding/json` package.

To convert a structure to JSON, use the GO function `json.Marshal`.To unpack a JSON string to the structure, use the function `json.Unmarshal`.

After defining the account structure, the first step is to define the genesis block and initiate the chaincode.

```go
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

func (t *EnergyChainCode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}
```

Then, you need to create functions to define specifc data processing method. In the Hyperledger Fabric shim interface, use `Invoke` method to invoke actions that are executed to the Blockchain.

```go
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
```

For further details about the chaincode, please visit the documentation for [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.2/).


## 3. Describe REST API Using OpenAPI

To checkout the OpenAPI configuration, you can visit `trading.yaml` file.

Here, we use a Swagger 2.0 specification. The `.yaml` file describes the exact HTTP interface to the chaincode.

A Swagger 2.0 definition in YAML has several sections at the root level. Not all sections are relevant in this context. The table below shows which sections are relevant and used, and which sections are ignored or replaced:

| Section             | Use                                                                                                                                                                                                                                                                                                                                                                                    |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| swagger             | Must be set to “2.0”.                                                                                                                                                                                                                                                                                                                                                                  |
| host                | Will be overwritten with the SCP Blockchain service with local relevant host information.                                                                                                                                                                                                                                                                                              |
| basePath            | Will be overwritten with the base path for this API when the chaincode is deployed to a specific channel to include the server path, plus the addition channel path.                                                                                                                                                                                                                   |
| schemes             | Will be overwritten and replaced with only “https” supported.                                                                                                                                                                                                                                                                                                                          |
| consumes            | This sets the default content types that will be accepted for all API calls if not set specifically. Recommended to set this value. By default, this should be set to “application/x-www-form-urlencoded” to signal that incoming HTTP requests will have parameters in name/value format. Alternatively, set to "application/json" if a JSON body will be used for incoming requests. |
| produces            | Specifies the content type that will by default be valid for all HTTP responses. Only the content types “application/json” (recommended) and “text/plain” is supported.                                                                                                                                                                                                                |
| paths               | Will be used to define the API, details below.                                                                                                                                                                                                                                                                                                                                         |
| definitions         | Section can be used by Swagger as defined.                                                                                                                                                                                                                                                                                                                                             |
| parameters          | Section can be used by Swagger as defined.                                                                                                                                                                                                                                                                                                                                             |
| responses           | Section can be used by Swagger as defined.                                                                                                                                                                                                                                                                                                                                             |
| securityDefinitions | Will be overwritten and replaced with SCP relevant information.                                                                                                                                                                                                                                                                                                                        |
| security            | Will be overwritten and replaced with SCP relevant information.                                                                                                                                                                                                                                                                                                                        |
| tags                | Section can be used by Swagger as defined.                                                                                                                                                                                                                                                                                                                                             |
| externalDocs        | Section can be used by Swagger as defined.                                                                                                                                                                                                                                                                                                                                             |

The path section is used to define a rich definition of the REST-based API, and all Swagger features can be used to describe the API. Two special cases apply:

* For each path, you must specify the operationId. This is the direct name of the chaincode function that must be called for this path.
* For the parameters, all five parameter locations are supported. The parameters can be in the path, query, header, form, or body. For the parameter types, you can use only simple parameters that can be mapped onto chaincode type string input parameters. The supported types are: string, number, integer, boolean, and file.


## 4. Setup Chaincode Manifest

Each chaincode is assigned a version number. Since chaincode is deployed 'forever' on the blockchain and cannot be deleted, you use the version number (which must be a monotonic integer number) to redeploy a new chaincode to replace a previous version of the chaincode. During deployment, the version number of the chaincode must also be available.

For this meta information, you need a `chaincode.yaml` file. This file has two attributes, namely the ID and Version.

```yaml
Id:       com-sap-icn-blockchain-p2pEnergy
Version:  1
```


## 5. Run Chaincode

First, from the Hyperledger Fabric channel dashboard, navigate to the channel on which the chaincode should be deployed, and select the Chaincode tab.

Select the chaincode archive and deploy.

<div style='border: 2px solid #f00;'>
  <img width="600" src="images/scp_deploy.gif">
</div>
</br>

The `Init()` function is triggered, which allows the chaincode to start initial once-off configuration step.

<div style='border: 2px solid #f00;'>
  <img width="600" src="images/scp_explore.gif">
</div>
</br>

The chaincode is deployed using the chaincode ID from the manifest file as identifier. This ID will later be required to interact with the specific chaincode. After changes have been made, you can redeploy the updated chaincode to the same ID, but using a higher version number.


## 6. Call Chaincode from Application

To communicate with the REST API of SAP Hyperledger Fabric, you need to configure the `actionUrl` and `chaincodeID` with your specific SAP service url in `data.service.ts`, located in `angular-app/src/app`. Before any APIs can be called, an authorization step has to be completed. All APIs use OAuth 2.0. For the credentials (OAuth clientId and clientSecret) must be obtained from the service key. Thereafter, follow the standard OAuth process to obtain an access token by configuring credentials in `auth.service.ts`. Remember CORS needs to be enabled in order to communiate with the Angular App.

More information can be found in [How to Obtain Service Keys](https://help.sap.com/viewer/81f693ad49a046cba506cc9bd51052d0/BLOCKCHAIN/en-US/bf825b5c25294ffdb65f95138b53cc6c.html) and [Calling the Chaincode from Browser Application](https://help.sap.com/viewer/81f693ad49a046cba506cc9bd51052d0/BLOCKCHAIN/en-US/dbd998d29f424f908cab2a177d49f6da.html). 

To install the Angular app, go inside the `angular-app` folder, and type below in the terminal. This line will automatically download all dependencies described in the `package.json` file:

```
npm install
```

To launch the app locally:

```
npm run dev
```

The application should now be running at:
`http://localhost:4200`


<div style='border: 2px solid #f00;'>
  <img width="600" src="images/app_start.png">
</div>
</br>

Once the application opens, create Prosumer and Consumer and fill in dummy data. You can also execute transaction manually using `Transaction` tab. The Prosumer and Consumer account values will be updated in the dashboard.


## 7. Integrate IoT Device

This application can also integrate IoT device, such as Raspberry Pi, to execute transaction.

To start running your Raspberry Pi and simulate the process of energy generation, simply copy `raspberry-pi.py` inside the `IoT` folder and run it on the Raspberry Pi. Please configure your pin setup and [myjson](https://myjson.com) url (We used my myjson to store transaction data rather than directly calling SAP Hyperledger Service because this service is only internally available in SAP for now, so the application has to be the mid-man between Raspberry Pi and SAP Hyperledger Fabric). 

If you do not have a Raspberry Pi and still wish to simulate the IoT functionality, configure the simple simulator `simulate_pi.py`, and run it from your local machine.

Then, the angular app would automatically capture data post by Raspberry Pi and update blockchain and its dashboard.

<div style='border: 2px solid #f00;'>
  <img width="600" src="images/app_update.gif">
</div>
</br>

At the end of your session, clean your myjson storage:

```
cd ~/IoT
python reset_pi_server.py
```


## Extending Code Pattern

This application demonstrates a basic idea of a decentralized energy network using Blockchain and can be expanded in several ways:
* Adding specific permissions and participant access
* Creating client-side apps for energy trading
* Setting up real time transactions among participants
* Reading from smart meter and distribute energy more intelligently


## Deploy Angular App to SAP Cloud Platform

The Angular Application can be deployed to SAP Cloud Platform.

Because SAP Cloud Platform is based on Cloud Foundry, an open source cloud application platform, Follow [these instructions](https://docs.cloudfoundry.org/buildpacks/node/node-tips.html) to deploy the angular app to SAP Cloud Plaform.

The folder includes `server.js` file and `package.json` file that are ready for cloud foundry deployment. Simple push the application.


## Additional Resources
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [Hyperledger Fabric on SAP Cloud Platform](https://help.sap.com/viewer/product/HYPERLEDGER_FABRIC/BLOCKCHAIN/en-US)

## License
[MIT License](LICENSE)