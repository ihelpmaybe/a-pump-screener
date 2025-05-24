// components/trending/TrendingTable/TokenRow.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Web3 from "web3";

const TokenRow = ({ token, rank }) => {
  const navigate = useNavigate();

  const handleTokenClick = () => {
    navigate(`/token/${token.address}`, {
      state: {
        tokenData: token,
      },
    });
  };

  return (
    <tr
      onClick={handleTokenClick}
      className={`cursor-pointer hover:bg-dex-bg-highlight ${token.isPumpTires ? 'bg-dex-bg-secondary/10' : ''}`}
    >
      <td className="px-4 py-3 text-dex-text-tertiary text-center">{rank}</td>
      <td className="px-4 py-3">
        <Link
          to={`/token/${token.address}`}
          className="flex items-center"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center">
            <img
              src={
                token.isPumpTires
                  ? (token.image_cid
                      ? `https://ipfs.io/ipfs/${token.image_cid}`
                      : "/images/tokens/default-token.svg")
                  : `https://tokens.app.pulsex.com/images/tokens/${Web3.utils.toChecksumAddress(token.address)}.png`
              }
              alt={token.symbol}
              className="w-8 h-8 rounded-full mr-3 bg-dex-bg-tertiary"
              onError={(e) => {
                // For pump.tires tokens, fallback directly to default
                if (token.isPumpTires) {
                  if (e.target.src !== window.location.origin + "/images/tokens/default-token.svg") {
                    e.target.src = "/images/tokens/default-token.svg";
                  }
                } else {
                  // For PulseX tokens, fallback to default if not already
                  if (!e.target.dataset.fallback) {
                    e.target.src = "/images/tokens/default-token.svg";
                    e.target.dataset.fallback = "default";
                  }
                }
              }}
            />
            <div>
              <div className="font-medium text-dex-text-primary flex items-center gap-1">
                <span>{token.symbol}</span>
                {token.isPumpTires && (
                  <div className="relative group">
                    <svg 
                      className="w-4 h-4 text-yellow-400 hover:text-yellow-300 transition-colors" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dex-bg-secondary text-dex-text-primary text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      PUMP.tires Token
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-dex-text-secondary">
                {token.name}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-right">{token.price}</td>
      <td className="px-4 py-3 text-right text-dex-text-secondary">N/A</td>
      <td className="px-4 py-3 text-right">{token.txns}</td>
      <td className="px-4 py-3 text-right">{token.volume}</td>
      <td className="px-4 py-3 text-right">-</td>
      <td className="px-4 py-3 text-right">-</td>
      <td className="px-4 py-3 text-right">-</td>
      <td className="px-4 py-3 text-right">-</td>
      <td className="px-4 py-3 text-right">-</td>
      <td className="px-4 py-3 text-right">{token.liquidity}</td>
      <td className="px-4 py-3 text-right">{token.marketCap}</td>
    </tr>
  );
};

export default TokenRow;
