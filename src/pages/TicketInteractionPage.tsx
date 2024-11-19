import { useState } from "react";
import { useEthereum } from "../contexts/EthereumContext";
import { ethers } from "ethers";
// import TicketManagerABI from "../abis/EntryPoint.json";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Select,
  Flex,
  HStack,
} from "@chakra-ui/react";

// const TicketManagerABI = TicketManagerJson.abi;
import SimpleAccount from "../abis/SimpleAccount.json";

const abstractAccountABI = SimpleAccount;

const TicketInteractionPage = () => {
  const { chainId, switchNetwork, signer, aaContractAddress, accountSigner } =
    useEthereum();
  const [amount, setAmount] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  // selectedNetwork is only used for network switch, chainId is used for contract interaction.
  const [selectedNetwork, setSelectedNetwork] = useState<string>("11155111");
  const toast = useToast();

  const handleTransaction = async (type: "deposit" | "withdraw") => {
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
      await switchNetwork("11155111");
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
      const amountInWei = ethers.parseEther(amount);

      const contract = new ethers.Contract(
        aaContractAddress,
        abstractAccountABI,
        signer
      );

      const tx =
        type === "deposit"
          ? await contract.addDeposit({
              value: amountInWei,
            })
          : await contract.withdrawDepositTo(amountInWei);

      await tx.wait();
      toast({
        title: `${type === "deposit" ? "Deposit" : "Withdraw"} successful`,
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

  const handleDeposit = () => handleTransaction("deposit");
  const handleWithdraw = () => handleTransaction("withdraw");

  const handleNetworkSwitch = async () => {
    // switchNetwork will handle internal error
    await switchNetwork(selectedNetwork);
    toast({
      title: `Switched to network ${selectedNetwork}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex direction="column" align="center" p="5">
      <Box
        width="1280px"
        border="1.5px solid black"
        display="flex"
        flexDirection="column"
        alignItems="left"
        justifyContent="center"
        marginBottom="20px"
        marginTop="20px"
        borderRadius="0"
        bg="white"
        padding={8}
        boxShadow="sm"
        textAlign="left"
      >
        <Text variant="title" mb={6} textAlign="start">
          Gas Ticket Interaction
        </Text>
        <VStack spacing={4} align="stretch">
          <HStack>
            <Text variant="title">Omni Account: </Text>
            <Text variant="description">{aaContractAddress}</Text>
          </HStack>
          {/* <Select
            placeholder="Select Network"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            size="lg"
          >
            <option value="11155111">Sepolia (11155111)</option>
            <option value="1101">Polygon zkEVM (1101)</option>
            <option value="42161">Arbitrum (42161)</option>
            <option value="31337">Hardhat Local Testnet (31337)</option>
          </Select> */}

          {/* <Button
            onClick={handleNetworkSwitch}
            variant="solid"
            size="lg"
            width="200px"
          >
            Switch Network
          </Button> */}

          {/* <Input
            placeholder="Enter the Omni Address"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            size="lg"
          /> */}
          <Input
            placeholder="Specify the amount in Ether (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            size="lg"
          />
          <Button
            onClick={handleDeposit}
            variant="solid"
            size="lg"
            width="200px"
          >
            Add Gas Deposit
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="solid"
            size="lg"
            width="200px"
          >
            Request Withdrawal
          </Button>

          {chainId && (
            <Text textAlign="center" variant="description">
              Connected to Chain ID: {chainId}
            </Text>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default TicketInteractionPage;
