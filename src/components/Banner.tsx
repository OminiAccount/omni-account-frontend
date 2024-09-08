import { Flex, Button, Box, Image, useToast, Select } from "@chakra-ui/react";
import { useEthereum } from "../contexts/EthereumContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import axios from "axios";
import { AccountDetails } from "../types/Account";
import { setAccountDetails } from "../features/account/accountSlice";
import { useEffect, useState } from "react";

const fetchAccountDetails = async (
  address: string,
  chainId: string
): Promise<AccountDetails> => {
  const rpcData = {
    jsonrpc: "2.0",
    method: "eth_getAccountInfo",
    params: [address, parseInt(chainId, 10)],
    // params: ["0xfd63ed0566a782ef57f559c6f5f9afece4866423", 11155111],
    id: 1,
  };

  try {
    const response = await axios.post(
      process.env.REACT_APP_BACKEND_RPC_URL!,
      rpcData
    );

    if (response.data && response.data.result) {
      const result = response.data.result;

      const accountDetails: AccountDetails = {
        balance: result.Balance,
        nonce: result.Nonce,
        history: [],
      };

      return accountDetails;
    } else {
      throw new Error("Failed to get Omni Account Info");
    }
  } catch (error) {
    console.error("Failed to send getAccountInfo request to backend:", error);
    throw new Error("Failed to get Omni Account Info");
  }
};

const Banner = () => {
  const { account, connect, aaContractAddress, chainId, switchNetwork } =
    useEthereum();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<string>(chainId || "");

  const handleSwitchNetwork = async (newChainId: string) => {
    try {
      await switchNetwork(newChainId);
      toast({
        title: "Success",
        description: `Switched to network ${newChainId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to switch network.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const accountDetails = useSelector(
    (state: RootState) => state.account.accountDetails
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (chainId) {
      setSelectedNetwork(chainId);
    }
    if (aaContractAddress && chainId) {
      fetchAccountDetails(aaContractAddress, chainId)
        .then((details) => dispatch(setAccountDetails(details)))
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to fetch account details.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    }
  }, [aaContractAddress, chainId, dispatch]);

  const baseStyle = {
    bg: "transparent",
    border: "none",
    color: "#666666",
    fontSize: "14px",
    _hover: { bg: "transparent", textDecoration: "none" },
    _active: { bg: "transparent" },
    _focus: { boxShadow: "none" },
  };

  const activeStyle = {
    color: "brand.500",
    textDecoration: "none",
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      as="nav"
      bg="rgba(255, 255, 255, 0.5)"
      p={4}
      color="black"
      borderBottom="2px solid"
    >
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
        maxW="1280px"
        width="1280px"
        m="0 auto"
      >
        <Flex align="center" gap="64px">
          <Button
            onClick={() => navigate("/")}
            sx={{
              ...baseStyle,
              ...(isActive("/") ? activeStyle : {}),
            }}
          >
            Omni Accout Workflow
          </Button>
          <Button
            onClick={() => navigate("/userop-execution")}
            sx={{
              ...baseStyle,
              ...(isActive("/userop-execution") ? activeStyle : {}),
            }}
          >
            UserOp Submission
          </Button>
          <Button
            onClick={() => navigate("/ticket-interaction")}
            sx={{
              ...baseStyle,
              ...(isActive("/ticket-interaction") ? activeStyle : {}),
            }}
          >
            Ticket Interaction
          </Button>
          <Button
            onClick={() => navigate("/account-page")}
            sx={{
              ...baseStyle,
              ...(isActive("/account-page") ? activeStyle : {}),
            }}
          >
            Omni Account Details
          </Button>
        </Flex>

        <Flex align="center" gap="16px">
          <Select
            value={selectedNetwork}
            onChange={(e) => {
              const newChainId = e.target.value;
              setSelectedNetwork(newChainId);
              handleSwitchNetwork(newChainId);
            }}
            width="200px"
          >
            <option value="11155111">Sepolia Testnet (11155111)</option>
            <option value="421614">Arbitrum Sepolia (421614)</option>
          </Select>

          {account ? (
            <Button variant="solid">
              {account.slice(0, 6) + "..." + account.slice(-4)}
            </Button>
          ) : (
            <Button onClick={connect} variant="solid">
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Banner;
