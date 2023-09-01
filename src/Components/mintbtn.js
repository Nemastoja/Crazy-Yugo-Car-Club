import React, { useState, useEffect } from "react";
import abi from "./abi.json";
// import Web3 from "web3";
import { ethers } from "ethers";
// require("dotenv").config();

const REACT_APP_CONTRACT_ADDRESS = "0x18aF15468e5704824383183F33Db13EC618B918D";
const SELECTEDNETWORK = "0x1";
const SELECTEDNETWORKNAME = "Ethereum Mainnet";
const nftquantity = 14165;

function Mintbtn() {
  const [errormsg, setErrorMsg] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [totalSupply, settotalSupply] = useState("*****");
  const [walletConnected, setWalletConnected] = useState(0);
  const [maxallowed, setmaxallowed] = useState(10);

  useEffect(async () => {
    if (!window.ethereum) {
      setErrorMsg(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    let c = await provider.send("eth_chainId", []);
    if (c != SELECTEDNETWORK) {
      setErrorMsg("Switch to Etherem Network!");
      return;
    }

    const ct = new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, abi, provider);

    settotalSupply(Number(await ct.totalSupply()));
    setmaxallowed(Number(await ct.MAX_PER_Transtion()));

    if (nftquantity - (await ct.totalSupply()) == 0) {
      setErrorMsg("All NFTs minted, Sale has ended");
    }
  }, []);

  async function loadWeb3() {
    if (!window.ethereum) {
      setErrorMsg(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let m = await provider.send("eth_requestAccounts", []);
    m = m[0];

    let c = await provider.send("eth_chainId", []);
    if (c != SELECTEDNETWORK) {
      setErrorMsg("Switch to Etherem Network!");
      return;
    }

    let signer = provider.getSigner();
    const ct = new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, abi, signer);

    let current = await ct.totalSupply();
    if (Number(current) === nftquantity) {
      setErrorMsg("Sold out");
      return;
    }

    let price = await ct.getPrice();
    try {
      await ct.mint(quantity, { value: String(price * quantity) });
    } catch (e) {
      console.log(e);
      setErrorMsg("Insufficient Funds for mint!");
    }
    settotalSupply(Number(await ct.totalSupply()));
    setQuantity(1);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setErrorMsg(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let m = await provider.send("eth_requestAccounts", []);
    m = m[0];

    let c = await provider.send("eth_chainId", []);
    if (c != SELECTEDNETWORK) {
      setErrorMsg("Switch to Etherem Network!");
      return;
    }

    const ct = new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, abi, provider);
    let statusone = await ct.getStatus();

    if (statusone == 1) {
      let wl = await ct.methods.isWhitelisted(m).call();
      if (wl) setWalletConnected(1);
      else setErrorMsg("You are not Whitelisted");
    } else if (statusone == 2) setWalletConnected(1);
    else setErrorMsg("Sale not started");
  }

  return (
    <div className="BtnDiv">
      {!errormsg ? (
        <div className="row align-items-center">
          {walletConnected == 0 ? (
            <div className="col-12">
              <a
                href="#"
                className="hero_button w-inline-block"
                style={{ marginBottom: "0px" }}
              >
                <div
                  className="button_text"
                  onClick={() => {
                    connectWallet();
                  }}
                >
                  MINT (NOW)
                </div>
              </a>
            </div>
          ) : (
            ""
          )}
          {walletConnected == 1 ? (
            <>
              <div className="col-sm-5">
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="hero_button w-inline-block"
                    onClick={() => setQuantity(quantity - 1)}
                    disabled={quantity == 1}
                    style={{
                      marginBottom: "20px",
                      padding: "0px 15px",
                    }}
                  >
                    <span className="button_text">-</span>
                  </button>
                  <span
                    className="quantity button_text"
                    style={{ padding: "20px" }}
                  >
                    {quantity}
                  </span>
                  <button
                    className="hero_button w-inline-block"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity == maxallowed}
                    style={{
                      marginBottom: "15px !important",
                      padding: "0px 15px",
                    }}
                  >
                    <span className="button_text">+</span>
                  </button>
                </div>
              </div>
              <div className="col-sm-7 pt-3 pt-sm-0">
                <button
                  type="button"
                  className="hero_button w-inline-block"
                  onClick={() => loadWeb3()}
                  style={{ marginBottom: "0px" }}
                >
                  <span className="button_text">Mint A Car</span>
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      ) : (
        <h5 className="mt-2 hero_description">
          <b>{errormsg}</b>
        </h5>
      )}
      <div className="hero_description">{totalSupply}/14,165</div>
    </div>
  );
}

export default Mintbtn;
