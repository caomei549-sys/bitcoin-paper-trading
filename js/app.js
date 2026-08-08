/* =========================================================
   CryptoX Demo Trading Engine
   Paper Trading Only - No Real Money
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "cryptox_demo_account_v1";
  const HISTORY_KEY = "cryptox_trade_history_v1";

  const DEFAULT_ACCOUNT = {
    usdt: 10000,
    btc: 0,
    eth: 0,
    sol: 0
  };

  const PRICES = {
    BTC: 67250,
    ETH: 3820,
    SOL: 148
  };

  function loadAccount() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...DEFAULT_ACCOUNT };
    } catch (error) {
      return { ...DEFAULT_ACCOUNT };
    }
  }

  function saveAccount(account) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function formatMoney(value) {
    return "$" + Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatCoin(value) {
    return Number(value || 0).toFixed(8);
  }

  function getPrice(symbol)
