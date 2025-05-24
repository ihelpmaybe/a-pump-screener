import React from "react";

const TableHeader = ({ sortBy, sortDirection, onSortChange }) => {
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <thead>
      <tr className="text-xs uppercase text-dex-text-secondary border-b border-dex-border">
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-left">
          #
        </th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-left">
          TOKEN
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("usdPrice")}
        >
          PRICE {renderSortIcon("usdPrice")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("createdAt")}
        >
          AGE {renderSortIcon("createdAt")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("transactions.oneDay")}
        >
          TXNS {renderSortIcon("transactions.oneDay")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("volumeUsd.oneDay")}
        >
          VOLUME {renderSortIcon("volumeUsd.oneDay")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("buyers.oneDay")}
        >
          MAKERS {renderSortIcon("buyers.oneDay")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("usdPricePercentChange.5m")}
        >
          5M {renderSortIcon("usdPricePercentChange.5m")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("usdPricePercentChange.oneHour")}
        >
          1H {renderSortIcon("usdPricePercentChange.oneHour")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("usdPricePercentChange.sixHour")}
        >
          6H {renderSortIcon("usdPricePercentChange.sixHour")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("usdPricePercentChange.oneDay")}
        >
          24H {renderSortIcon("usdPricePercentChange.oneDay")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("liquidityUsd")}
        >
          LIQUIDITY {renderSortIcon("liquidityUsd")}
        </th>
        <th
          className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right cursor-pointer"
          onClick={() => onSortChange("marketCap")}
        >
          MCAP {renderSortIcon("marketCap")}
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
