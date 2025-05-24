import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchButton from "./SearchButton";
import NavigationMenu from "./NavigationMenu";
import ChainSelector from "./ChainSelector";

const LeftSidebar = ({ openSearchModal }) => {
  const navigate = useNavigate();

  const handleChainSelect = (chainId) => {
    navigate(`/${chainId}`);
  };

  return (
    <div className="w-64 bg-dex-bg-secondary text-dex-text-primary flex flex-col border-r border-dex-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <Link to="/" className="block">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-xl font-mono">
                <span className="text-2xl">&#9002;</span>
              </span>
              <span className="font-bold text-lg">DEX Terminal</span>
            </div>
            <span className="text-xs text-gray-400 ml-7">
              Powered by Moralis
            </span>
          </div>
        </Link>
        <SearchButton openSearchModal={openSearchModal} />
        <NavigationMenu />
        {/* <ChainSelector /> */}
      </div>
    </div>
  );
};

export default LeftSidebar;
