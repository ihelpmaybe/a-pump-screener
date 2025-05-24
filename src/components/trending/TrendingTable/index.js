import React from "react";
import { Link } from "react-router-dom";
import TableHeader from "./TableHeader";
import TokenRow from "./TokenRow";

const TrendingTable = ({
  tokens,
  loading,
  sortBy,
  sortDirection,
  onSortChange,
}) => {
  console.log("TrendingTable received tokens:", tokens);
  console.log("Number of tokens:", tokens?.length || 0);

  // Make sure tokens is always an array even if API returns null or undefined
  const tokenArray = Array.isArray(tokens) ? tokens : [];

  // Sort tokens based on current sort settings
  const sortedTokens = [...tokenArray];

  // Only sort if sortBy is specified
  if (sortBy) {
    sortedTokens.sort((a, b) => {
      // Helper function to get nested property value safely
      const getNestedValue = (obj, path, defaultValue = 0) => {
        const keys = path.split(".");
        let value = obj;

        for (const key of keys) {
          if (
            value === null ||
            value === undefined ||
            typeof value !== "object"
          ) {
            return defaultValue;
          }
          value = value[key];
        }

        return value !== null && value !== undefined ? value : defaultValue;
      };

      // Get values to compare based on sortBy path
      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);

      // Compare values based on sort direction
      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full border-collapse">
        <TableHeader
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
        />
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan="12"
                className="text-center py-8 text-dex-text-secondary"
              >
                Loading trending tokens...
              </td>
            </tr>
          ) : sortedTokens.length === 0 ? (
            <tr>
              <td
                colSpan="12"
                className="text-center py-8 text-dex-text-secondary"
              >
                No tokens found
              </td>
            </tr>
          ) : (
            sortedTokens.map((token, index) => (
              <TokenRow
                key={token.id || index}
                token={token}
                rank={index + 1}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrendingTable;
