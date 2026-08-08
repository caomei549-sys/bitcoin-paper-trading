/* =========================================================
   CryptoX Demo Trading Engine
   PAPER TRADING ONLY - NO REAL MONEY
   ========================================================= */

(function () {
  "use strict";

  const ACCOUNT_KEY = "cryptox_demo_account_v2";
  const HISTORY_KEY = "cryptox_trade_history_v2";

  const PRICES = {
    BTC: 67250,
    ETH: 3820,
    SOL: 148
  };

  const DEFAULT_ACCOUNT = {
    usdt: 10000,
    btc: 0,
    eth: 0,
    sol: 0
  };

  function loadAccount() {
    try {
      const data = localStorage.getItem(ACCOUNT_KEY);

      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }

    return { ...DEFAULT_ACCOUNT };
  }

  function saveAccount(account) {
    localStorage.setItem(
      ACCOUNT_KEY,
      JSON.stringify(account)
    );
  }

  function loadHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);

      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  function saveHistory(history) {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  }

  function money(value) {
    return "$" + Number(value || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }

  function coin(value) {
    return Number(value || 0).toFixed(8);
  }

  function price(symbol) {
    return PRICES[String(symbol).toUpperCase()] || 0;
  }

  function totalEquity(account) {
    return (
      Number(account.usdt || 0) +
      Number(account.btc || 0) * PRICES.BTC +
      Number(account.eth || 0) * PRICES.ETH +
      Number(account.sol || 0) * PRICES.SOL
    );
  }

  function notify(message, error) {
    const old = document.querySelector(
      ".cryptox-notification"
    );

    if (old) {
      old.remove();
    }

    const box = document.createElement("div");

    box.className = "cryptox-notification";
    box.textContent = message;

    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.left = "50%";
    box.style.transform = "translateX(-50%)";
    box.style.zIndex = "999999";
    box.style.padding = "14px 20px";
    box.style.borderRadius = "12px";
    box.style.fontFamily = "Arial,sans-serif";
    box.style.fontWeight = "bold";
    box.style.color = "#fff";
    box.style.background = error
      ? "#e5484d"
      : "#18a968";
    box.style.boxShadow =
      "0 8px 30px rgba(0,0,0,.4)";

    document.body.appendChild(box);

    setTimeout(function () {
      box.remove();
    }, 2500);
  }

  function updateUI() {
    const account = loadAccount();
    const equity = totalEquity(account);

    document.querySelectorAll(
      "[data-usdt-balance]"
    ).forEach(function (el) {
      el.textContent = money(account.usdt);
    });

    document.querySelectorAll(
      "[data-btc-balance]"
    ).forEach(function (el) {
      el.textContent = coin(account.btc);
    });

    document.querySelectorAll(
      "[data-total-equity]"
    ).forEach(function (el) {
      el.textContent = money(equity);
    });

    const usdtElements = [
      "#usdtBalance",
      "#availableUsdt",
      "#availableUSDT",
      ".usdt-balance"
    ];

    usdtElements.forEach(function (selector) {
      document.querySelectorAll(selector)
        .forEach(function (el) {
          el.textContent = money(account.usdt);
        });
    });

    const btcElements = [
      "#btcBalance",
      "#btcAmount",
      ".btc-balance"
    ];

    btcElements.forEach(function (selector) {
      document.querySelectorAll(selector)
        .forEach(function (el) {
          el.textContent = coin(account.btc);
        });
    });

    const equityElements = [
      "#totalEquity",
      "#demoEquity",
      ".total-equity"
    ];

    equityElements.forEach(function (selector) {
      document.querySelectorAll(selector)
        .forEach(function (el) {
          el.textContent = money(equity);
        });
    });
  }

  function recordTrade(
    side,
    symbol,
    usdtAmount,
    quantity,
    tradePrice
  ) {
    const history = loadHistory();

    history.unshift({
      id: Date.now(),
      side: side,
      symbol: symbol,
      amount: Number(usdtAmount),
      quantity: Number(quantity),
      price: Number(tradePrice),
      time: new Date().toISOString()
    });

    saveHistory(history.slice(0, 200));
  }

  function buyBTC(usdtAmount) {
    const account = loadAccount();
    const amount = Number(usdtAmount);
    const tradePrice = PRICES.BTC;

    if (!Number.isFinite(amount) || amount <= 0) {
      notify("กรุณาใส่จำนวน USDT", true);
      return false;
    }

    if (amount > account.usdt) {
      notify("USDT ของคุณไม่เพียงพอ", true);
      return false;
    }

    const btcAmount = amount / tradePrice;

    account.usdt -= amount;
    account.btc += btcAmount;

    saveAccount(account);

    recordTrade(
      "BUY",
      "BTC/USDT",
      amount,
      btcAmount,
      tradePrice
    );

    updateUI();

    notify(
      "ซื้อสำเร็จ +" +
      coin(btcAmount) +
      " BTC"
    );

    window.dispatchEvent(
      new CustomEvent("cryptox:trade", {
        detail: {
          side: "BUY",
          symbol: "BTC",
          amount: amount,
          quantity: btcAmount,
          price: tradePrice
        }
      })
    );

    return true;
  }

  function sellBTC(usdtAmount) {
    const account = loadAccount();
    const amount = Number(usdtAmount);
    const tradePrice = PRICES.BTC;

    if (!Number.isFinite(amount) || amount <= 0) {
      notify("กรุณาใส่จำนวน USDT", true);
      return false;
    }

    const btcAmount = amount / tradePrice;

    if (btcAmount > account.btc) {
      notify("BTC ของคุณไม่เพียงพอ", true);
      return false;
    }

    account.btc -= btcAmount;
    account.usdt += amount;

    saveAccount(account);

    recordTrade(
      "SELL",
      "BTC/USDT",
      amount,
      btcAmount,
      tradePrice
    );

    updateUI();

    notify(
      "ขายสำเร็จ +" +
      money(amount) +
      " USDT"
    );

    window.dispatchEvent(
      new CustomEvent("cryptox:trade", {
        detail: {
          side: "SELL",
          symbol: "BTC",
          amount: amount,
          quantity: btcAmount,
          price: tradePrice
        }
      })
    );

    return true;
  }

  function getAmountInput() {
    return document.querySelector(
      "#amount, #tradeAmount, " +
      "input[name='amount'], " +
      "input[type='number']"
    );
  }

  function connectButtons() {
    const amountInput = getAmountInput();

    const buyButtons = document.querySelectorAll(
      "#buyBtn, #buyBTC, " +
      ".buy-btn, " +
      "button[data-action='buy']"
    );

    const sellButtons = document.querySelectorAll(
      "#sellBtn, #sellBTC, " +
      ".sell-btn, " +
      "button[data-action='sell']"
    );

    buyButtons.forEach(function (button) {
      button.addEventListener(
        "click",
        function (event) {
          event.preventDefault();

          const amount = amountInput
            ? amountInput.value
            : 0;

          buyBTC(amount);
        }
      );
    });

    sellButtons.forEach(function (button) {
      button.addEvent
