// src/services/pumpLaunch.js
const BASE = 'https://api.pump.tires/api';
const TTL   = 1000 * 60 * 60 * 24; // 24h

async function fetchPage(page) {
  const res = await fetch(`${BASE}/tokens?filter=launch_timestamp&page=${page}`);
  return res.ok ? await res.json() : null;
}

export async function loadAllPumpTires() {
  // check localStorage cache
  const cached = JSON.parse(localStorage.getItem('pumpTiresCache') || 'null');
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return new Set(cached.addresses);
  }

  // first page to get totalPages
  const first = await fetchPage(1);
  if (!first) throw new Error('Pump.Tires API failed.');
  const pages = [ first, 
    // fetch pages 2…totalPages in parallel
    ...await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i+2))
    )
  ].filter(Boolean);

  // collect unique addresses
  const addresses = Array.from(
    new Set(pages.flatMap(p => p.tokens.map(t => t.address.toLowerCase())))
  );

  // cache it
  localStorage.setItem('pumpTiresCache', JSON.stringify({
    fetchedAt: Date.now(),
    addresses,
  }));

  return new Set(addresses);
}
