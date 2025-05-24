// src/pages/PumpTiresPage.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NewTokenCard from "../components/pumptires/NewTokenCard";
import BondingTokenCard from "../components/pumptires/BondingTokenCard";
import GraduatedTokenCard from "../components/pumptires/GraduatedTokenCard";

const PUMP_TIRES_BASE = "https://api.pump.tires/api";

const PumpTiresPage = () => {
  const navigate = useNavigate();
  const [newTokens, setNewTokens] = useState([]);
  const [bondingTokens, setBondingTokens] = useState([]);
  const [graduatedTokens, setGraduatedTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTokensIds, setNewTokensIds] = useState(new Set());
  const pollingInterval = useRef(null);

  useEffect(() => {
    fetchAllTokens();
    pollingInterval.current = setInterval(fetchAllTokens, 30000);
    return () => clearInterval(pollingInterval.current);
  }, []);

  const fetchAllTokens = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchNewTokens(),
        fetchBondingTokens(),
        fetchGraduatedTokens(),
      ]);
    } catch (err) {
      console.error("Error fetching pump.tires tokens:", err);
      setError("Failed to load pump.tires tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNewTokens = async () => {
    try {
      const url = `${PUMP_TIRES_BASE}/tokens?filter=created_timestamp&page=1`;
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const incomingTokens = Array.isArray(data) ? data : data.tokens || [];

      const prevIds = new Set(newTokensIds);
      const brandNew = incomingTokens.filter(t => !prevIds.has(t.tokenAddress));
      setNewTokensIds(new Set([...prevIds, ...incomingTokens.map(t => t.tokenAddress)]));
      const tokensWithFlag = incomingTokens.map(t => ({
        ...t,
        isNew: brandNew.some(b => b.tokenAddress === t.tokenAddress),
      }));
      setNewTokens(tokensWithFlag);
    } catch (err) {
      console.error("Error fetching new tokens:", err);
      throw err;
    }
  };

  const fetchBondingTokens = async () => {
    try {
      const url = `${PUMP_TIRES_BASE}/tokens?filter=market_value&page=1`;
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setBondingTokens(Array.isArray(data) ? data : data.tokens || []);
    } catch (err) {
      console.error("Error fetching bonding tokens:", err);
      throw err;
    }
  };

  const fetchGraduatedTokens = async () => {
    try {
      const url = `${PUMP_TIRES_BASE}/tokens?filter=launch_timestamp&page=1`;
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setGraduatedTokens(Array.isArray(data) ? data : data.tokens || []);
    } catch (err) {
      console.error("Error fetching graduated tokens:", err);
      throw err;
    }
  };

  const handleTokenClick = (token) => {
    navigate(`/pumptires/${token.tokenAddress}`);
  };

  const formatPrice = (price) => {
    if (!price) return "$0";
    const num = parseFloat(price);
    if (num < 0.000001) return "$" + num.toExponential(4);
    if (num < 0.001) return "$" + num.toFixed(8);
    if (num < 1) return "$" + num.toFixed(6);
    return "$" + num.toFixed(4);
  };

  const formatNumber = (num) => {
    if (!num) return "$0";
    const value = parseFloat(num);
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {loading && newTokens.length === 0 && bondingTokens.length === 0 && graduatedTokens.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Tokens Column */}
          <div className="space-y-4">
            <div className="bg-dex-bg-secondary rounded-t-lg p-4 border-b-2 border-green-500">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2">🆕</span> Newly Created Tokens
              </h2>
            </div>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
              {newTokens.length === 0 ? (
                <div className="text-center py-10 text-dex-text-secondary">
                  No new tokens available
                </div>
              ) : (
                newTokens.map((token) => (
                  <NewTokenCard
                    key={token.tokenAddress}
                    token={token}
                    formatPrice={formatPrice}
                    formatNumber={formatNumber}
                    formatTimeAgo={formatTimeAgo}
                    onClick={() => handleTokenClick(token)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Bonding Tokens Column */}
          <div className="space-y-4">
            <div className="bg-dex-bg-secondary rounded-t-lg p-4 border-b-2 border-blue-500">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2">⚡</span> Bonding Tokens
              </h2>
            </div>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
              {bondingTokens.length === 0 ? (
                <div className="text-center py-10 text-dex-text-secondary">
                  No bonding tokens available
                </div>
              ) : (
                bondingTokens.map((token) => (
                  <BondingTokenCard
                    key={token.tokenAddress}
                    token={token}
                    formatPrice={formatPrice}
                    formatNumber={formatNumber}
                    onClick={() => handleTokenClick(token)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Graduated Tokens Column */}
          <div className="space-y-4">
            <div className="bg-dex-bg-secondary rounded-t-lg p-4 border-b-2 border-purple-500">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2">🎓</span> Graduated Tokens
              </h2>
            </div>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
              {graduatedTokens.length === 0 ? (
                <div className="text-center py-10 text-dex-text-secondary">
                  No graduated tokens available
                </div>
              ) : (
                graduatedTokens.map((token) => (
                  <GraduatedTokenCard
                    key={token.tokenAddress}
                    token={token}
                    formatPrice={formatPrice}
                    formatNumber={formatNumber}
                    formatTimeAgo={formatTimeAgo}
                    onClick={() => handleTokenClick(token)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PumpTiresPage;
