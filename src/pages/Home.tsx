import { Box, Text, Flex } from "@chakra-ui/react";
import Workflow from "../components/Workflow";

const Home: React.FC = () => {
  return (
    <Flex direction="column" align="center" p="5">
      <Box
        width="1280px"
        border="1.5px solid black"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        marginBottom="20px"
        marginTop="20px"
        borderRadius="0"
        bg="white"
        padding={8}
        boxShadow="sm"
        textAlign="left"
      >
        <Box width="100%">
          <Text variant="title" mb={2}>
            Omni Account Model
          </Text>
          <Text variant="description" mb={4}>
            Omni Account is an innovative account model leveraging{" "}
            <Text as="span" fontWeight="bold">
              EIP-4337
            </Text>{" "}
            and{" "}
            <Text as="span" fontWeight="bold">
              zero-knowledge proof (ZKP)
            </Text>{" "}
            technology. It utilizes an{" "}
            <Text as="span" fontWeight="bold">
              off-chain Sparse Merkle Tree (SMT)
            </Text>{" "}
            to manage users' gas balances, with gas fees for contract execution
            deducted directly from the SMT. The correctness of SMT state
            transitions is ensured by EIP-712 formatted signatures and ZKPs .
            This model enables seamless multi-chain expansion through{" "}
            <Text as="span" fontWeight="bold">
              cross-chain protocols
            </Text>{" "}
            , transforming it into a truly{" "}
            <Text as="span" fontWeight="bold">
              Omni Account
            </Text>
            . By shifting signature verification from on-chain to an off-chain
            ZKP circuit and maintaining user states within the Omni SMT , the
            model reduces gas costs by eliminating the base transaction fee and
            the on-chain ecrecover cost. Although ZKPs introduce an additional
            200-300k gas overhead , this can be effectively amortized across
            multiple transactions.
          </Text>
        </Box>
      </Box>
      <Workflow />
    </Flex>
  );
};

export default Home;
