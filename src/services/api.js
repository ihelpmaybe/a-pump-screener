// services/api.js

// PulseChain endpoints
const PULSECHAIN_RPC = "https://rpc.pulsechain.com";
const PULSECHAIN_EXPLORER = "https://scan.pulsechain.com/api";
const PULSEX_SUBGRAPH = "https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex";

// Helper function to make GraphQL queries to PulseX Subgraph
const makeSubgraphQuery = async (query, variables = {}) => {
  try {
    const response = await fetch(PULSEX_SUBGRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Subgraph query error: ${data.errors[0].message}`);
    }
    return data.data;
  } catch (error) {
    console.error('Subgraph query error:', error);
    throw error;
  }
};

// Helper function to make RPC calls to PulseChain
const makeRPCCall = async (method, params = []) => {
  try {
    const response = await fetch(PULSECHAIN_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`RPC call error (${method}):`, error);
    throw error;
  }
};

function formatUSD(num) {
  num = Number(num);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Fetch trending tokens by 24h USD volume for today
 * @param {number} limit - Number of results to return (default 10)
 * @returns {Promise} Promise resolving to trending tokens data
 */
export const getTrendingTokens = async (limit = 10) => {
  // Helper to get today's UTC start timestamp
  function getTodayUTCTimestamp() {
    const now = new Date();
    return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
  }
  const todayTimestamp = getTodayUTCTimestamp();
  let safeLimit = parseInt(limit, 10);
  if (isNaN(safeLimit) || safeLimit <= 0) safeLimit = 10;
  try {
    const query = `
      query GetTrendingTokens($limit: Int!, $date: Int!, $minLiquidity: BigDecimal!) {
        tokenDayDatas(
          first: $limit
          orderBy: dailyVolumeUSD
          orderDirection: desc
          where: { date: $date, totalLiquidityUSD_gt: $minLiquidity }
        ) {
          token {
            id
            symbol
            name
          }
          priceUSD
          dailyVolumeUSD
          dailyTxns
          totalLiquidityUSD
        }
      }
    `;
    const variables = {
      limit: safeLimit,
      date: todayTimestamp,
      minLiquidity: "10000"
    };
    const data = await makeSubgraphQuery(query, variables);
    return data.tokenDayDatas.map(dayData => ({
      address: dayData.token.id,
      symbol: dayData.token.symbol,
      name: dayData.token.name,
      priceUSD: dayData.priceUSD,
      dailyVolumeUSD: dayData.dailyVolumeUSD,
      dailyTxns: dayData.dailyTxns,
      totalLiquidityUSD: dayData.totalLiquidityUSD
    }));
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    throw error;
  }
};

/**
 * Search for tokens on PulseChain
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise} Promise resolving to search results
 */
export const searchTokens = async (query, limit = 20) => {
  try {
    const searchQuery = `
      query SearchTokens($query: String!, $limit: Int!) {
        tokens(
          first: $limit,
          where: {
            or: [
              { name_contains_nocase: $query },
              { symbol_contains_nocase: $query }
            ]
          }
        ) {
          id
          name
          symbol
          decimals
          totalSupply
          derivedPLS
          derivedUSD
          totalLiquidity
          totalTransactions
          tradeVolume
          tradeVolumeUSD
          untrackedVolumeUSD
        }
      }
    `;

    const data = await makeSubgraphQuery(searchQuery, { 
      query: query.toLowerCase(),
      limit 
    });

    return data.tokens.map(token => ({
      address: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      totalSupply: token.totalSupply,
      derivedPLS: token.derivedPLS,
      derivedUSD: token.derivedUSD,
      totalLiquidity: token.totalLiquidity,
      totalTransactions: token.totalTransactions,
      tradeVolume: token.tradeVolume,
      tradeVolumeUSD: token.tradeVolumeUSD,
      untrackedVolumeUSD: token.untrackedVolumeUSD
    }));
  } catch (error) {
    console.error("Error searching tokens:", error);
    throw error;
  }
};

/**
 * Get token price and market data from PulseX
 * @param {string} tokenAddress - Token address
 * @returns {Promise} Promise resolving to token price data
 */
export const getTokenPrice = async (tokenAddress) => {
  try {
    const query = `
      query GetTokenPrice($tokenAddress: ID!) {
        token(id: $tokenAddress) {
          id
          name
          symbol
          decimals
          totalSupply
          derivedPLS
          derivedUSD
          totalLiquidity
          totalTransactions
          tradeVolume
          tradeVolumeUSD
          untrackedVolumeUSD
        }
      }
    `;

    const data = await makeSubgraphQuery(query, { tokenAddress });
    
    if (!data.token) {
      throw new Error('Token not found');
    }

    return {
      address: data.token.id,
      name: data.token.name,
      symbol: data.token.symbol,
      decimals: data.token.decimals,
      totalSupply: data.token.totalSupply,
      derivedPLS: data.token.derivedPLS,
      derivedUSD: data.token.derivedUSD,
      totalLiquidity: data.token.totalLiquidity,
      totalTransactions: data.token.totalTransactions,
      tradeVolume: data.token.tradeVolume,
      tradeVolumeUSD: data.token.tradeVolumeUSD,
      untrackedVolumeUSD: data.token.untrackedVolumeUSD
    };
  } catch (error) {
    console.error("Error fetching token price:", error);
    throw error;
  }
};

/**
 * Get wallet token balances on PulseChain
 * @param {string} address - Wallet address
 * @returns {Promise} Promise resolving to wallet token balances
 */
export const getWalletTokens = async (address) => {
  try {
    // Get token balances using PulseChain explorer API
    const response = await fetch(
      `${PULSECHAIN_EXPLORER}/address/${address}/tokens`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const tokens = await response.json();
    
    // Get detailed token data from subgraph for tokens with balance
    const tokensWithData = await Promise.all(
      tokens.map(async (token) => {
        try {
          const tokenData = await getTokenPrice(token.address);
          return {
            ...token,
            ...tokenData,
            value: (token.balance / Math.pow(10, token.decimals)) * tokenData.price
          };
        } catch (error) {
          console.error(`Error getting data for token ${token.address}:`, error);
          return {
            ...token,
            price: 0,
            value: 0
          };
        }
      })
    );

    return tokensWithData;
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    throw error;
  }
};

/**
 * Get wallet net worth on PulseChain
 * @param {string} address - Wallet address
 * @returns {Promise} Promise resolving to wallet net worth data
 */
export const getWalletNetWorth = async (address) => {
  try {
    const tokens = await getWalletTokens(address);
    
    // Calculate total value
    const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
    
    // Get native PLS balance
    const plsBalance = await makeRPCCall('eth_getBalance', [address, 'latest']);
    const plsPrice = await getTokenPrice('0x0000000000000000000000000000000000000000'); // PLS token address
    
    const plsValue = (parseInt(plsBalance, 16) / 1e18) * plsPrice.price;
    
    return {
      totalValue: totalValue + plsValue,
      tokens: tokens,
      nativeBalance: {
        symbol: 'PLS',
        balance: parseInt(plsBalance, 16) / 1e18,
        value: plsValue
      }
    };
  } catch (error) {
    console.error("Error fetching wallet net worth:", error);
    throw error;
  }
};

/**
 * Fetch pairs for a given token address from PulseX subgraph
 * @param {string} tokenAddress - The token address
 * @returns {Promise} Promise resolving to an array of pairs
 */
export const getTokenPairs = async (tokenAddress) => {
  const query = `
    query GetTokenPairs($id: ID!) {
      token(id: $id) {
        pairBase(first: 10, orderBy: volumeUSD, orderDirection: desc) {
          id
          reserve0
          reserve1
          token0Price
          token1Price
          volumeUSD
        }
        pairQuote(first: 10, orderBy: volumeUSD, orderDirection: desc) {
          id
          reserve0
          reserve1
          token0Price
          token1Price
          volumeUSD
        }
      }
    }
  `;
  const variables = { id: tokenAddress.toLowerCase() };
  const data = await makeSubgraphQuery(query, variables);
  if (!data.token) return [];
  const pairs = [];
  if (Array.isArray(data.token.pairBase)) pairs.push(...data.token.pairBase);
  if (Array.isArray(data.token.pairQuote)) pairs.push(...data.token.pairQuote);
  return pairs;
};

// Export chain-specific constants
export const CHAIN_INFO = {
  id: 'pulse',
  name: 'PulseChain',
  rpc: PULSECHAIN_RPC,
  explorer: PULSECHAIN_EXPLORER,
  subgraph: PULSEX_SUBGRAPH,
  nativeCurrency: {
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18
  }
};

/**
 * Fetch a single pump.tires token by address.
 * @param {string} address - The token address.
 * @returns {Promise<Object>} - The token object from pump.tires API.
 */
export async function getPumpTiresToken(address) {
  try {
    const res = await fetch(`https://api.pump.tires/api/token/${address}`);
    if (!res.ok) {
      if (res.status === 404) {
        return null; // Token not found on pump.tires
      }
      throw new Error(`Failed to fetch pump.tires token: ${res.status}`);
    }
    const data = await res.json();
    return data.token; // contains image_cid, name, etc.
  } catch (error) {
    console.error(`Error fetching pump.tires token ${address}:`, error);
    return null;
  }
}

/**
 * Fetch pump.tires data for multiple tokens in parallel
 * @param {string[]} addresses - Array of token addresses to fetch
 * @returns {Promise<Map<string, Object>>} - Map of address to pump.tires token data
 */
export async function getPumpTiresTokens(addresses) {
  try {
    // Fetch all tokens in parallel
    const results = await Promise.all(
      addresses.map(async (address) => {
        const tokenData = await getPumpTiresToken(address);
        return [address.toLowerCase(), tokenData];
      })
    );

    // Convert results to a Map, filtering out null values
    return new Map(results.filter(([_, data]) => data !== null));
  } catch (error) {
    console.error("Error fetching pump.tires tokens:", error);
    return new Map();
  }
}

/**
 * Fetch trending tokens with pump.tires data for whitelisted tokens
 * @param {number} limit - Number of results to return (default 10)
 * @param {Set<string>} whitelist - Set of pump.tires token addresses
 * @returns {Promise} Promise resolving to trending tokens data with pump.tires info
 */
export const getTrendingTokensWithPumpData = async (limit = 10, whitelist = new Set()) => {
  try {
    // First get the regular trending tokens
    const tokens = await getTrendingTokens(limit);
    
    // Filter out pump.tires tokens that are in the whitelist
    const pumpTiresAddresses = tokens
      .map(t => t.address.toLowerCase())
      .filter(addr => whitelist.has(addr));

    // If we have any pump.tires tokens, fetch their data
    let pumpTiresData = new Map();
    if (pumpTiresAddresses.length > 0) {
      pumpTiresData = await getPumpTiresTokens(pumpTiresAddresses);
    }

    // Combine the data
    return tokens.map(token => {
      const address = token.address.toLowerCase();
      const pumpData = pumpTiresData.get(address);
      
      if (pumpData) {
        return {
          ...token,
          isPumpTires: true,
          name: pumpData.name,
          symbol: pumpData.symbol,
          image_cid: pumpData.image_cid,
          price: pumpData.price ? `$${Number(pumpData.price).toFixed(10)}` : "$0",
          volume: formatUSD(pumpData.tokens_sold),
          txns: (pumpData.latest_trade_batch?.total_buys || 0) + 
                (pumpData.latest_trade_batch?.total_sells || 0),
          liquidity: formatUSD(pumpData.market_value)
        };
      }

      return {
        ...token,
        isPumpTires: false,
        image_cid: null
      };
    });
  } catch (error) {
    console.error("Error fetching trending tokens with pump data:", error);
    throw error;
  }
};
