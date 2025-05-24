// pages/TrendingPage.js
import React, { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import TrendingTable from "../components/trending/TrendingTable";
import { getTrendingTokens, getPumpTiresTokens } from "../services/api";
import FiltersModal from "../components/modals/FiltersModal";

const TrendingPage = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showWhitelistOnly, setShowWhitelistOnly] = useState(false);
  const [whitelistSet, setWhitelistSet] = useState(new Set());

  // Fetch whitelist.txt at runtime
  useEffect(() => {
    fetch("/whitelist.txt")
      .then(res => res.text())
      .then(text => {
        const addresses = text
          .split("\n")
          .map(addr => addr.trim().toLowerCase())
          .filter(Boolean);
        setWhitelistSet(new Set(addresses));
      })
      .catch(e => {
        console.error("Could not load whitelist.txt", e);
        setWhitelistSet(new Set());
      });
  }, []);

  // Add the handler for applying filters
  const handleApplyFilters = (filteredTokens) => {
    setTokens(filteredTokens);
    setIsFiltered(true);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      // Fetch trending tokens from PulseChain (limit to 200)
      const data = await getTrendingTokens(200);
      // Helper to format numbers with K/M/B notation
      function formatNumber(num) {
        num = Number(num);
        if (isNaN(num)) return "$0";
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
      }
      // Map and format the data for the table
      const formatted = data.map(token => ({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        price: token.priceUSD
          ? `$${Number(token.priceUSD) < 0.000001
              ? Number(token.priceUSD).toExponential(6)
              : Number(token.priceUSD).toFixed(10)}`
          : "$0",
        volume: formatNumber(token.dailyVolumeUSD),
        txns: token.dailyTxns || 0,
        liquidity: formatNumber(token.totalLiquidityUSD),
        isPumpTires: false,
        image_cid: null
      }));

      // Get addresses of whitelisted tokens
      const pumpTiresAddresses = formatted
        .map(t => t.address.toLowerCase())
        .filter(addr => whitelistSet.has(addr));

      // If we have any whitelisted tokens, fetch their pump.tires data
      if (pumpTiresAddresses.length > 0) {
        console.log("Fetching pump.tires data for:", pumpTiresAddresses.length, "tokens");
        const pumpTiresData = await getPumpTiresTokens(pumpTiresAddresses);
        
        // Enhance whitelisted tokens with pump.tires data
        formatted.forEach(token => {
          const address = token.address.toLowerCase();
          const pumpData = pumpTiresData.get(address);
          if (pumpData) {
            token.isPumpTires = true;
            token.image_cid = pumpData.image_cid;
            // Optionally update other fields from pump.tires data
            if (pumpData.name) token.name = pumpData.name;
            if (pumpData.symbol) token.symbol = pumpData.symbol;
            if (pumpData.price) token.price = `$${Number(pumpData.price).toFixed(10)}`;
            if (pumpData.tokens_sold) token.volume = formatNumber(pumpData.tokens_sold);
            if (pumpData.latest_trade_batch) {
              token.txns = (pumpData.latest_trade_batch.total_buys || 0) + 
                          (pumpData.latest_trade_batch.total_sells || 0);
            }
            if (pumpData.market_value) token.liquidity = formatNumber(pumpData.market_value);
          }
        });
      }

      setTokens(formatted);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const handleRefresh = () => {
    setIsFiltered(false);
    fetchTokens();
  };

  // Filter tokens if toggle is on
  const displayedTokens = showWhitelistOnly
    ? tokens.filter(token => whitelistSet.has(token.address.toLowerCase()))
    : tokens;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showWhitelistOnly}
            onChange={e => setShowWhitelistOnly(e.target.checked)}
          />
          <span>Show only PUMP.tires tokens</span>
        </label>
      </div>
      <TopBar
        isFiltered={isFiltered}
        openFiltersModal={() => setFiltersModalOpen(true)}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
      />
      <TrendingTable
        tokens={displayedTokens}
        loading={loading}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default TrendingPage;