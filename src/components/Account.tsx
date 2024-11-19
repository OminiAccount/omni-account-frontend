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
  const { chainId, aaContractAddress, error, account, accountSigner } =
    useEthereum();
  const toast = useToast();
  const accountDetails = useSelector(
    (state: RootState) => state.account.accountDetails
  );
  const [userOps, setUserOps] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserOps = async () => {
      if (account == null || aaContractAddress == null || chainId == null) {
        console.error("Failed to fetch transaction history");
      } else {
        const accountInfo = await accountSigner?.getAccountInfo(
          account,
          aaContractAddress,
          chainId
        );

        setUserOps(accountInfo?.history || []);
      }
    };

    fetchUserOps();
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
          <Text variant="description">
            {ethers.formatEther(
              `0x${BigInt(accountDetails.balance).toString(16)}`
            )}{" "}
            ETH
          </Text>
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
                const mainGasLimit =
                  parseInt(tx.mainChainGasLimit, 16) +
                  parseInt(tx.zkVerificationGasLimit, 16);

                const destGasLimit = parseInt(tx.destChainGasLimit, 16);

                const totalGasCost =
                  mainGasLimit * parseInt(tx.mainChainGasPrice, 16) +
                  destGasLimit * parseInt(tx.destChainGasPrice, 16);

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
