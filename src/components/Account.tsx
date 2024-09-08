import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Stack,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { AccountDetails } from "../types/Account";
import { useEthereum } from "../contexts/EthereumContext";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setAccountDetails } from "../features/account/accountSlice";
import { ethers } from "ethers";

const Account: React.FC = () => {
  // const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
  //   null
  // );
  const { chainId, aaContractAddress, error, account } = useEthereum();
  const toast = useToast();
  const accountDetails = useSelector(
    (state: RootState) => state.account.accountDetails
  );
  const [userOps, setUserOps] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserOps = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BACKEND_RPC_URL!,
          {
            jsonrpc: "2.0",
            method: "eth_getUserOpsForAccount",
            params: [account, aaContractAddress],
            id: 1,
          }
        );

        setUserOps(response.data.result || []);
      } catch (error) {
        toast({
          title: "Failed to fetch transaction history",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Failed to fetch transaction history:", error);
      }
    };

    if (aaContractAddress) {
      fetchUserOps();
    }
  }, [account, aaContractAddress, chainId]);

  if (!accountDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <Stack spacing={4}>
        <HStack>
          <Text variant="title">Omni Account: </Text>
          <Text variant="description">{aaContractAddress}</Text>
        </HStack>
        <HStack>
          <Text variant="title">Chain Id: </Text>
          <Text variant="description">{chainId}</Text>
        </HStack>
        <HStack>
          <Text variant="title">Gas Balance: </Text>
          <Text variant="description">{accountDetails.balance} WEI</Text>
        </HStack>
        <HStack>
          <Text variant="title">Nonce:</Text>
          <Text variant="description">{accountDetails.nonce}</Text>
        </HStack>
        <Box>
          <Text variant="title">Transaction History</Text>
          <Table>
            <Thead>
              <Tr>
                {/* <Th>Sender</Th> */}
                <Th>Chain Id</Th>
                <Th>Nonce</Th>
                <Th>Call Data</Th>
                <Th>Total Gas Cost</Th>
              </Tr>
            </Thead>

            <Tbody>
              {userOps.map((tx, index) => {
                const totalGasLimit =
                  parseInt(tx.callGasLimit, 16) +
                  parseInt(tx.verificationGasLimit, 16) +
                  parseInt(tx.preVerificationGasLimit, 16);

                const totalGasCost =
                  totalGasLimit *
                  (parseInt(tx.maxFeePerGas, 16) +
                    parseInt(tx.maxPriorityFeePerGas, 16));

                const totalGasCostInEth = ethers.formatEther(
                  totalGasCost.toString()
                );

                return (
                  <Tr key={index}>
                    <Td>{parseInt(tx.chainId, 16)}</Td>
                    <Td>{parseInt(tx.nonce, 16)}</Td>
                    <Td>{tx.callData}</Td>
                    <Td>{totalGasCostInEth} ETH</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Stack>
    </Box>
  );
};

export default Account;
