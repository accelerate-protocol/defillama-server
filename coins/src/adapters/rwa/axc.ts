import { Write } from "../utils/dbInterfaces";
import { addToDBWritesList } from "../utils/database";
import { getApi } from "../utils/sdk";
import getWrites from "../utils/getWrites";

interface TokenInfo {
  name: string;
  tokenAddress: string;
  vaultAddress: string;
  decimals: number;
}

interface ChainTokens {
  chain: string;
  tokens: TokenInfo[];
}

// these tokens have an offer price which are publicized at
// www.axc.xyz

const CHAINS: ChainTokens[] = [
  {
    chain: "bsc",
    tokens: [
      {
        name: "GYTW",
        tokenAddress: "0xfC787d44f3754aDd0242204533b2B4A7eB9876e1",
	vaultAddress: "0x4A6B8E72A346ba9f4Bf8bEeE4EAcB92b934a667c",
	decimals: 8
      },
      {
        name: "GYT",
        tokenAddress: "0xb2F0d43f6496b38bb55AbEA0fD2ee5cC891AcB33",
	vaultAddress: "0x66Cdcd2F56EefF71Cce737Cf6584cddbbC37982C",
	decimals: 8
      },
    ],
  }
];

export async function axc(timestamp: number): Promise<Write[]> {
  const writes: Write[] = [];

  for (const { chain, tokens } of CHAINS) {
    const api = await getApi(chain, timestamp);
    const pricesObject: any = {};

    const tokenAddresses = tokens.map((t) => t.tokenAddress);
    const vaultAddresses = tokens.map((t) => t.vaultAddress);
    const prices = await api.multiCall({
	  abi: "uint256:getTokenPrice",
	  calls: vaultAddresses
      })

    tokens.forEach((token, i) => {
      pricesObject[token.tokenAddress] = {
        price: prices[i] / (10 ** token.decimals),
      }
    })
    await getWrites({ chain, timestamp, writes, pricesObject, projectName: "axc", confidence: 0.9 })
  }

  return writes;
}
