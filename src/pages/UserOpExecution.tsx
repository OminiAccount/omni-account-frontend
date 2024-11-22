import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { BigNumberish, ethers } from "ethers";
import { useEthereum } from "../contexts/EthereumContext";
import axios from "axios";
import AccountABI from "../abis/test.json";
import SimpleAccountFactoryABI from "../abis/SimpleAccountFactory.json";
import CounterJSON from "../abis/Counter.json";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  OperationType,
  UserOperationField,
  Account,
} from "omni-account-sdk/build-esm/src/index";
import SimpleAccount from "../abis/SimpleAccount.json";

const counterABI = CounterJSON.abi;
const abstractAccountABI = SimpleAccount;

const UserOpExecution = () => {
  const {
    account,
    aaContractAddress,
    provider,
    signer,
    chainId,
    accountSigner,
    switchNetwork,
    // fetchAAContractAddress,
  } = useEthereum();
  const [userOp, setUserOp] = useState<UserOperationField>({
    sender: aaContractAddress || "0x",
    nonce: BigInt(1),
    chainId: chainId !== null ? parseInt(chainId, 10) : 11155111,
    callData: "0x",
    mainChainGasLimit: BigInt(200000),
    destChainGasLimit: BigInt(0),
    zkVerificationGasLimit: BigInt(270000),
    mainChainGasPrice: BigInt(170000),
    destChainGasPrice: BigInt(0),
  });
  const toast = useToast();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [gasAmount, setGasAmount] = useState("");
  const [isSwitchOn, setIsSwitchOn] = useState(false); // State for Switch
  const [operationType, setOperationType] = useState<OperationType>(
    OperationType.UserAction
  );
  const accountDetails = useSelector(
    (state: RootState) => state.account.accountDetails
  );

  const account_contract = new ethers.Contract(
    aaContractAddress || "0x93d53d2d8f0d623c5cbe46daa818177a450bd9f7",
    AccountABI,
    provider
  );

  // useEffect to set operationType based on gasAmount and isSwitchOn
  useEffect(() => {
    const amount = parseFloat(gasAmount);
    if (isNaN(amount) || amount === 0) {
      setOperationType(OperationType.UserAction);
    } else if (isSwitchOn) {
      setOperationType(OperationType.WithdrawAction);
    } else {
      setOperationType(OperationType.DepositAction);
    }
  }, [gasAmount, isSwitchOn]);

  // const counter_contract = new ethers.Contract(
  //   process.env[`REACT_APP_COUNTER_11155111`]!,
  //   counterABI,
  //   provider
  // );

  const createAccountSample = async () => {
    // const ethValue = ethers.parseEther("0.01"); // 10^16 wei
    // const entryPointAddress = "0x71f57F8A220FbcF6AaCdf501912C2ad9b90CA842";
    // const incrementCallData = "0x";
    if (!account) {
      toast({
        title: "Error",
        description: `Wallet Not Connected.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const owner = account;
    const salt = 1;

    const accountFactoryAddress =
      process.env[`REACT_APP_ACCOUNT_FACTORY_${chainId}`];
    if (!accountFactoryAddress) {
      toast({
        title: "Error",
        description: `Account factory is not available for chainId ${chainId}.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log("Factory Address: ", accountFactoryAddress);

    const account_factory = new ethers.Contract(
      accountFactoryAddress,
      SimpleAccountFactoryABI,
      signer
    );
    console.log("signer", signer);

    console.log("account_factory", await account_factory.getAddress());

    // const preInitCode = account_factory.interface.encodeFunctionData(
    //   "createAccount",
    //   [owner, salt]
    // );

    // const addressHex = ethers.hexlify(accountFactoryAddress);

    // const initCode = accountFactoryAddress + preInitCode.slice(2);

    // account_factory.createAccount()
    console.log("owner ", owner, " salt", salt);
    let initAccount: string = await account_factory.getAccountAddress(
      owner,
      salt
    );
    console.log("Calculated Omni Account Address: ", initAccount);

    // const sample: UserOperation = {
    //   sender: initAccount,
    //   nonce: 1,
    //   chainId: 11155111,
    //   initCode: initCode,
    //   callData: "0x",
    //   callGasLimit: 35000,
    //   verificationGasLimit: 250000,
    //   preVerificationGas: 17000,
    //   maxFeePerGas: 30000000000,
    //   maxPriorityFeePerGas: 2500000000,
    //   paymasterAndData: "0x",
    // };
    // setUserOp(sample);

    // directly create Omni Account by contract interaction
    await createAccountAndGetAddress(account_factory, owner, salt);
  };

  async function createAccountAndGetAddress(
    account_factory: ethers.Contract,
    owner: string,
    salt: BigNumberish
  ) {
    console.log("owner: ", owner);
    console.log("salt: ", salt);
    try {
      let tx = await account_factory.createAccount(owner, salt);

      // Wait for the transaction to be mined
      let receipt = await tx.wait();

      console.log("receipt", receipt);
      // Extract the address from the transaction receipt
      // The address should be in receipt.events[0].args[0] or similar based on contract's output
      // let initAccount = receipt.events[0].args[0];
      toast({
        title: "Success",
        description: "Create Omni Account successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to create Omni Account.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  }

  const transferSample = () => {
    if (!chainId) {
      toast({
        title: "Error",
        description: "Please connect your wallet.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!toAddress.trim()) {
      toast({
        title: "Error",
        description: "Please provide a valid address.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const ethValue = ethers.parseEther(amount);
    // const entryPointAddress = process.env.REACT_APP_ENTRY_POINT_11155111!;
    const incrementCallData = "0x";

    const callData = account_contract.interface.encodeFunctionData("execute", [
      toAddress,
      ethValue,
      incrementCallData,
    ]);

    const new_nonce = (accountDetails?.nonce ?? 0) + 1;

    const chainIdNumber: number =
      chainId !== null ? parseInt(chainId, 10) : 11155111;

    const sample: UserOperationField = {
      sender: aaContractAddress || "0x",
      nonce: new_nonce,
      chainId: chainIdNumber,
      callData: callData,
      mainChainGasLimit: "0x30d40",
      destChainGasLimit: 0,
      zkVerificationGasLimit: "0x41eb0",
      mainChainGasPrice: "0x29810",
      destChainGasPrice: 0,
    };
    setUserOp(sample);
  };

  const counterSample = () => {
    if (!chainId) {
      toast({
        title: "Error",
        description: "Please connect your wallet.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const ethValue = ethers.parseEther("0");
    // const counterAddress = process.env[`REACT_APP_COUNTER_${chainId}`];
    // const incrementCallData =
    //   counter_contract.interface.encodeFunctionData("increment");
    // const callData = account_contract.interface.encodeFunctionData("execute", [
    //   counterAddress,
    //   ethValue,
    //   "",
    // ]);
    const callData =
      "0xb61d27f6000000000000000000000000c97e73b2770a0eb767407242fb3d35524fe229de000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d09de08a00000000000000000000000000000000000000000000000000000000";

    const new_nonce = (accountDetails?.nonce ?? 0) + 1;
    console.log("new_nonce: ", new_nonce);
    const chainIdNumber: number =
      chainId !== null ? parseInt(chainId, 10) : 11155111;

    const sample: UserOperationField = {
      sender: aaContractAddress || "0x",
      nonce: new_nonce,
      chainId: chainIdNumber,
      callData: callData,
      mainChainGasLimit: BigInt(200000),
      destChainGasLimit: BigInt(0),
      zkVerificationGasLimit: BigInt(270000),
      mainChainGasPrice: BigInt(170000),
      destChainGasPrice: BigInt(0),
    };
    setUserOp(sample);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserOp({ ...userOp, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserOp({ ...userOp, [name]: Number(value) });
  };

  const handleBigNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserOp({ ...userOp, [name]: BigInt(value) });
  };

  const handleSwitchChange = (e: any) => {
    setIsSwitchOn(e.target.checked);
    // Optional: Add any additional logic here if needed
  };

  const handleGasAction = async () => {
    if (!aaContractAddress) {
      toast({
        title: "No Omni Account binding to current EOA address",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    // switchNetwork will handle internal error
    try {
      await switchNetwork("31337"); // gas action only in sepolia
      toast({
        title: "Switched to Sepolia Testnet",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Fail to switch to Sepolia Testnet",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const amountInWei = ethers.parseEther(gasAmount);

      const contract = new ethers.Contract(
        aaContractAddress,
        abstractAccountABI,
        signer
      );

      const tx =
        operationType === OperationType.DepositAction
          ? await contract.depositGas({
              value: amountInWei,
            })
          : await contract.withdrawGas(amountInWei);

      await tx.wait();
      await signAndSend();
      toast({
        title: `${
          operationType === OperationType.DepositAction ? "Deposit" : "Withdraw"
        } successful`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Transaction failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const signAndSend = async () => {
    if (!signer) {
      toast({
        title: "Error",
        description: "No signer found. Please connect your wallet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const value: UserOperationField = {
      operationType: operationType,
      operationValue: ethers.parseEther(gasAmount || "0"),
      sender: userOp.sender,
      nonce: userOp.nonce,
      chainId: userOp.chainId,
      callData: userOp.callData,
      mainChainGasLimit: userOp.mainChainGasLimit,
      destChainGasLimit: userOp.destChainGasLimit,
      zkVerificationGasLimit: userOp.zkVerificationGasLimit,
      mainChainGasPrice: userOp.mainChainGasPrice,
      destChainGasPrice: userOp.destChainGasPrice,
    };

    console.log("value", value);

    if (accountSigner != null) {
      const { success, error } = await accountSigner.sendUserOperation(value);

      if (success) {
        toast({
          title: "Success",
          description: "UserOperation signed and sent successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error("Failed to sign and send UserOperation", error);
        toast({
          title: "Error",
          description: `Failed to sign and send UserOperation: ${error}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "No account signer found. Please connect your wallet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" align="center" p="5">
      <Flex
        p={8}
        width="1280px"
        border="1.5px solid black"
        borderRadius="0"
        mx="auto"
        marginTop="20px"
        marginBottom="20px"
        alignItems="flex-start"
        bg="white"
      >
        <Box width="700px">
          <Text variant="title" mb="4">
            User Operation Submission
          </Text>
          <FormControl mb="1">
            <FormLabel>Sender</FormLabel>
            <Input
              name="sender"
              value={userOp.sender ? userOp.sender.toString() : "0x"}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>Nonce</FormLabel>
            <Input
              name="nonce"
              type="number"
              value={userOp.nonce ? userOp.nonce.toString() : "0"}
              onChange={handleBigNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>Chain ID</FormLabel>
            <Input
              name="chainId"
              type="number"
              value={userOp.chainId ? userOp.chainId.toString() : "0"}
              onChange={handleNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>callData</FormLabel>
            <Input
              name="callData"
              value={userOp.callData ? userOp.callData.toString() : "0x"}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>mainChainGasLimit</FormLabel>
            <Input
              name="mainChainGasLimit"
              type="number"
              value={
                userOp.mainChainGasLimit
                  ? userOp.mainChainGasLimit.toString()
                  : "0"
              }
              onChange={handleBigNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>destChainGasLimit</FormLabel>
            <Input
              name="destChainGasLimit"
              type="number"
              value={
                userOp.destChainGasLimit
                  ? userOp.destChainGasLimit.toString()
                  : "0"
              }
              onChange={handleBigNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>zkVerificationGasLimit</FormLabel>
            <Input
              name="zkVerificationGasLimit"
              type="number"
              value={
                userOp.zkVerificationGasLimit
                  ? userOp.zkVerificationGasLimit.toString()
                  : "0"
              }
              onChange={handleBigNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>mainChainGasPrice</FormLabel>
            <Input
              name="mainChainGasPrice"
              type="number"
              value={
                userOp.mainChainGasPrice
                  ? userOp.mainChainGasPrice.toString()
                  : "0"
              }
              onChange={handleBigNumberChange}
            />
          </FormControl>
          <FormControl mb="1">
            <FormLabel>destChainGasPrice</FormLabel>
            <Input
              name="destChainGasPrice"
              type="number"
              value={
                userOp.destChainGasPrice
                  ? userOp.destChainGasPrice.toString()
                  : "0"
              }
              onChange={handleBigNumberChange}
            />
          </FormControl>
        </Box>
        <Box ml="40" width="300px" mt="20">
          <ButtonGroup flexDir="column" spacing="0">
            <Button mb="4" onClick={createAccountSample}>
              Create Omni Account
            </Button>

            <Box>
              <Input
                placeholder="Gas amount (ETH)"
                value={gasAmount}
                onChange={(e) => setGasAmount(e.target.value)}
                mb="4"
              />
              <FormControl mb="4">
                <Flex alignItems="center" justifyContent="space-between">
                  <Button
                    onClick={handleGasAction} // 替换为你的点击处理函数
                    variant={
                      operationType === OperationType.UserAction
                        ? "outline"
                        : "solid"
                    }
                    colorScheme="red"
                    fontWeight="extrabold"
                    disabled={operationType === OperationType.UserAction}
                    mb="0"
                  >
                    {isSwitchOn ? "Withdraw Gas" : "Deposit Gas"}{" "}
                    {gasAmount + " ETH"}
                  </Button>
                  <Switch
                    id="gas-switch"
                    isChecked={isSwitchOn}
                    onChange={handleSwitchChange}
                    colorScheme="red"
                  />
                </Flex>
              </FormControl>
            </Box>
            <Box>
              <Input
                placeholder="Recipient address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                mb="4"
              />
              <Input
                placeholder="Amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                mb="4"
              />
              <Button mb="4" onClick={transferSample} width="100%">
                Transfer {amount} ETH
              </Button>
            </Box>

            {/* <Box> */}
            <Button mb="4" onClick={counterSample}>
              Trigger Counter on chain: {chainId}
            </Button>
            {/* </Box> */}

            <Button onClick={signAndSend}>Sign and Send UserOp</Button>
          </ButtonGroup>
        </Box>
      </Flex>
    </Flex>
  );
};

export default UserOpExecution;
