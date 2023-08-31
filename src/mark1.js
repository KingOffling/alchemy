import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [wagdieNFTs, setWagdieNFTs] = useState([]);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (account) {
      fetchWagdieNFTs(account);
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAccount = accounts[0];
      setAccount(userAccount);
    } else {
      console.error("Ethereum provider is not detected");
    }
  };

  const fetchWagdieNFTs = async (userAccount) => {
    const response = await axios.post(
      'https://api.thegraph.com/subgraphs/name/wagdie/wagdieworld-mainnet',
      {
        query: `{
          characters(where: {owner: "${userAccount}"}) {
            id
            burned
            infected
            searedConcord {
              id
            }
          }
        }`
      }
    );
    setWagdieNFTs(response.data.data.characters.filter(character => !character.burned));
  };

  const toggleTokenSelection = (tokenId) => {
    if (selectedTokens.includes(tokenId)) {
      setSelectedTokens(selectedTokens.filter(id => id !== tokenId));
    } else {
      setSelectedTokens([...selectedTokens, tokenId]);
    }
  };

  // Sort tokens based on whether they are selected or not
  const sortedTokens = [...wagdieNFTs].sort((a, b) => {
    const aIsSelected = selectedTokens.includes(a.id);
    const bIsSelected = selectedTokens.includes(b.id);
    return bIsSelected - aIsSelected;
  });

  const tokensToDisplay = isExpanded ? wagdieNFTs : sortedTokens;

  return (
    <div className="App">
      <header className="App-header">
        <button className="account-button" onClick={!account ? connectWallet : null}>
          {account ? account.substring(0, 6) + '...' + account.substring(account.length - 4) : 'CONNECT'}
        </button>
      </header>

      <main>
        {/* Selected Tokens Section */}
        {selectedTokens.length > 0 && (
          <div className="selected-tokens">
            <h2 className="section-header">Selected Tokens</h2>
            <div className="selected-tokens-box">
              {selectedTokens.map(tokenId => (
                <img
                  key={tokenId}
                  style={{ marginRight: "10px" }}
                  width="200" height="200"
                  src={`https://storage.googleapis.com/wagdie-images/${tokenId}.png`}
                  alt={`Wagdie Token #${tokenId}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tokens of Concord Section */}
        {account && (
          <>
            <h2 className="section-header">Tokens of Concord</h2>
            <div className="toc-box"></div>
          </>
        )}

  {/* WAGDIE Section */}
  {account && (
          <div className="wagdie-section">
            <h2 className="section-header">WAGDIE</h2>
            <div className="wagdie-box" style={isExpanded ? {} : { maxHeight: '145px', overflow: 'hidden' }}>
              {tokensToDisplay.map(token => (
                <div className={`token-container ${selectedTokens.includes(token.id) ? "" : "unselected"}`} key={token.id} onClick={() => toggleTokenSelection(token.id)}>
                  <img
                    className={selectedTokens.includes(token.id) ? "selected" : "unselected"}
                    width="100" height="100"
                    src={
                      token.burned ? '' :
                        (token.searedConcord ? `https://storage.googleapis.com/seared-wagdie-images/${token.id}.png` :
                          (token.infected ? `https://storage.googleapis.com/infected-wagdie-images/${token.id}.png` :
                            `https://storage.googleapis.com/wagdie-images/${token.id}.png`))
                    }
                    alt={`Wagdie Token #${token.id}`}
                  />
                  <a
                    href={`https://fateofwagdie.com/characters/${token.id}`}
                    className={`token-id-text ${selectedTokens.includes(token.id) ? "" : "unselected"}`}
                  >
                    #{token.id}
                  </a>
                </div>
              ))}
            </div>
            <div className="expand-collapse" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </div>
          </div>
        )}
      </main>
      <footer style={{ height: '30px', textAlign: 'center', lineHeight: '30px' }}>
      </footer>
    </div>
  )
}

export default App;
