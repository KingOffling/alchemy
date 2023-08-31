import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import './App.css';
import concordABI from './concordABI'

function App() {
    const [account, setAccount] = useState('');
    const [wagdieNFTs, setWagdieNFTs] = useState([]);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [isConcordExpanded, setIsConcordExpanded] = useState(false);
    const [isWagdieExpanded, setIsWagdieExpanded] = useState(false);
    const [concordTokens, setConcordTokens] = useState([]);
    const [isLoadingConcordTokens, setIsLoadingConcordTokens] = useState(false);
    const [currentTokenName, setCurrentTokenName] = useState('');
    const [isConcordOverflowing, setIsConcordOverflowing] = useState(false);
    const [isWagdieOverflowing, setIsWagdieOverflowing] = useState(false);
    const [hasBeenSelected, setHasBeenSelected] = useState(false);
    const [wagdieTokenAttributes, setWagdieTokenAttributes] = useState({});
    const [firstTokenSelected, setFirstTokenSelected] = useState(false);

    const concordRef = useRef(null);
    const wagdieRef = useRef(null);


    //////////////////////////////////////////////////////
    // SUPER IMPORTANT SECTION -- UPDATE AS NEW TOCS ADDED
    //////////////////////////////////////////////////////
    const highestTokenId = 45;
    const tokenNames = [
        'Flame of the 21',
        'Her Ember',
        'Her Ash',
        'Fool\'s Cap',
        'Field Notes',
        'Fetid Crow\'s Talon',
        'Artificer\'s Crystal',
        'Monarch',
        'Witches\' Brush',
        'Cauldron of Detriti',
        'Toad of Detriti',
        'Luta\'s Silver Compass',
        'Gnawed Bone',
        'Glutton Soup',
        'Strange Mushroom',
        'Noxium Brew',
        'Jester\'s Dice',
        'Jester\'s Wand',
        'Molten Talisman',
        'Raptor\'s Tooth',
        'Obsidian Blade',
        'Molten Heart',
        'Encampment Medallion',
        'Band of the Bulwark',
        'The Skull of Detriti',
        'Conclave Bell',
        'Eye of Julian',
        'Burrow Worm',
        'Nameless Scale Fragment',
        'Seer\'s Gem',
        'Mothling',
        'Pyre Doll',
        'Stale Mushroom',
        'Mimic Tablet',
        'Mossy Stone',
        'Monad Carving',
        'Monad Carving',
        'Bloody Crow\'s Talon',
        'Felfrost',
        'Fly',
        'Chosen Fly',
        'Sparkling Fly',
        'Mossy Ball'
    ];
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////



    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAccount = accounts[0];
            setAccount(userAccount);
        } else {
            console.error("Ethereum provider is not detected");
        }
    };

    useEffect(() => {
        if (account) {
          fetchWagdieNFTs(account);
          checkConcordOwnership(account);
        }
      }, [account]);

    
    const checkConcordOwnership = async (userAccount) => {
        setIsLoadingConcordTokens(true);
        if (!window.ethereum && !window.web3) {
            console.error('Ethereum provider not available');
            return;
        }

        const web3 = new Web3(window.ethereum || window.web3.currentProvider);
        const contractABI = concordABI;
        const contractAddress = "0x1d38150f1Fd989Fb89Ab19518A9C4E93C5554634";
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        let ownedTokens = [];

        for (let i = 1; i <= highestTokenId; i++) {
            setCurrentTokenName(tokenNames[i - 1]);  // Update the current token name
            try {
                const balance = await contract.methods.balanceOf(userAccount, i).call();
                if (Number(balance) > 0) {
                    console.log(`Token ID ${i} is owned by user with a balance of ${balance}`);
                    ownedTokens.push(i);
                }
            } catch (error) {
                console.error(`Error fetching token ID ${i}: ${error.message}`);
            }
        }

        setConcordTokens(ownedTokens);
        setIsLoadingConcordTokens(false);
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

        const attributes = {};
        response.data.data.characters.forEach((character) => {
            if (!character.burned) {
                attributes[character.id] = {
                    infected: character.infected,
                    seared: character.searedConcord ? true : false,
                };
            }
        });
        setWagdieTokenAttributes(attributes);

        setIsLoadingConcordTokens(true);
        if (!window.ethereum && !window.web3) {
            console.error('Ethereum provider not available');
            return;
        }

        const web3 = new Web3(window.ethereum || window.web3.currentProvider);
        const contractABI = concordABI;
        const contractAddress = "0x1d38150f1Fd989Fb89Ab19518A9C4E93C5554634";
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        let ownedTokens = [];

        for (let i = 1; i <= highestTokenId; i++) {
            setCurrentTokenName(tokenNames[i - 1]);  // Update the current token name
            try {
                const balance = await contract.methods.balanceOf(userAccount, i).call();
                if (Number(balance) > 0) {
                    console.log(`Token ID ${i} is owned by user with a balance of ${balance}`);
                    ownedTokens.push(i);
                }
            } catch (error) {
                console.error(`Error fetching token ID ${i}: ${error.message}`);
            }
        }

        setConcordTokens(ownedTokens);
        setIsLoadingConcordTokens(false);
    };




    const toggleTokenSelection = (tokenIdWithPrefix) => {
        setHasBeenSelected(true); // Set this to true as a token has been selected.
        if (selectedTokens.includes(tokenIdWithPrefix)) {
            setSelectedTokens(selectedTokens.filter(id => id !== tokenIdWithPrefix));
        } else {
            setSelectedTokens([...selectedTokens, tokenIdWithPrefix]);
        }

        if (!firstTokenSelected) {
            setFirstTokenSelected(true);
        }
    };


    const sortedTokens = [...wagdieNFTs].sort((a, b) => {
        const aIsSelected = selectedTokens.includes(a.id);
        const bIsSelected = selectedTokens.includes(b.id);
        return bIsSelected - aIsSelected;
    });

    const tokensToDisplay = isWagdieExpanded ? wagdieNFTs : sortedTokens;
    useEffect(() => {
        const checkOverflow = () => {
            const screenWidth = window.innerWidth;
            const tokenContainerWidth = 110;
            const numberOfTokens = tokensToDisplay.length;
            const maxTokensInOneRow = Math.floor(0.95 * screenWidth / tokenContainerWidth);
            const numberOfRows = Math.ceil(numberOfTokens / maxTokensInOneRow);

            if (concordRef.current) {
               // const isOverflowing = concordRef.current.scrollHeight > concordRef.current.clientHeight ||
                 //   numberOfRows * 100 > concordRef.current.clientHeight; // Assuming each token is 100px tall

                setIsConcordOverflowing(concordRef.current.scrollHeight > concordRef.current.clientHeight);
            }

            if (wagdieRef.current) {
                const isOverflowing = wagdieRef.current.scrollHeight > wagdieRef.current.clientHeight ||
                    numberOfRows * 100 > wagdieRef.current.clientHeight; // Assuming each token is 100px tall

                setIsWagdieOverflowing(isOverflowing);
            }
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);

        return () => {
            window.removeEventListener("resize", checkOverflow);
        };
    }, [concordTokens, tokensToDisplay]);


    return (
        <div className="App">
            <header className="App-header">
                <button className="account-button" onClick={!account ? connectWallet : null}>
                    {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'CONNECT'}
                </button>
            </header>

            <main>
                {/* Selected Tokens Section */}
                {selectedTokens.length > 0 && (
                    <div className="selected-tokens">
                        <h2 className="section-header">Selected Tokens</h2>
                        <div className="selected-tokens-box">
                            {selectedTokens.map(tokenIdWithPrefix => {
                                const [prefix, tokenId] = tokenIdWithPrefix.split('-');
                                let imageUrl, altText;

                                if (prefix === 'C') { // Concord Tokens
                                    imageUrl = `https://storage.googleapis.com/concord-images/${tokenId}.gif`;
                                    altText = `Concord Token #${tokenId}`;
                                } else { // WAGDIE Tokens
                                    const attrs = wagdieTokenAttributes[tokenId] || {};
                                    if (attrs.infected) {
                                        imageUrl = `https://storage.googleapis.com/infected-wagdie-images/${tokenId}.png`;
                                    } else if (attrs.seared) {
                                        imageUrl = `https://storage.googleapis.com/seared-wagdie-images/${tokenId}.png`;
                                    } else {
                                        imageUrl = `https://storage.googleapis.com/wagdie-images/${tokenId}.png`;
                                    }
                                    altText = `Wagdie Token #${tokenId}`;
                                }

                                return (
                                    <img
                                        key={tokenIdWithPrefix}
                                        style={{ marginRight: "10px" }}
                                        width="200" height="200"
                                        src={imageUrl}
                                        alt={altText}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tokens of Concord Section */}
                {account && (
                    <>
                        <h2 className="section-header">Tokens of Concord</h2>
                        {/* Add ref attribute here */}
                        <div className="toc-box" ref={concordRef} style={{ paddingTop: '10px', paddingBottom: '10px', ...(isConcordExpanded ? {} : { maxHeight: '169px', overflow: 'hidden' }) }}>
                            {isLoadingConcordTokens ? (
                                <div style={{ fontSize: 'larger', paddingTop: '10px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Checking Tokens:</span>
                                    <br />
                                    <span>{currentTokenName || 'LOADING'}</span>
                                </div>
                            ) : (
                                concordTokens.map(tokenId => (
                                    <div
                                        className={`token-container concord-token ${firstTokenSelected ? (selectedTokens.includes(`C-${tokenId}`) ? "" : "unselected") : "initial-unselected"}`}
                                        key={tokenId}
                                        onClick={() => toggleTokenSelection(`C-${tokenId}`)}
                                    >                               <img
                                            width="100" height="100"
                                            src={`https://storage.googleapis.com/concord-images/${tokenId}.gif`}
                                            alt={`Concord Token #${tokenId}`}
                                        />
                                        <div className="token-id-text">
                                            {tokenNames[tokenId - 1].split(' ').map((word, index) => (
                                                <React.Fragment key={index}>
                                                    {word} <br />
                                                </React.Fragment>
                                            ))}
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                        {/* Add expand/collapse button */}
                        {(isConcordOverflowing || isConcordExpanded) && (
                            <div className="expand-collapse" onClick={() => setIsConcordExpanded(!isConcordExpanded)}>
                                {isConcordExpanded ? "Collapse" : "Expand"}
                            </div>
                        )}
                    </>
                )}


                {/* WAGDIE Section */}
                {account && (
                    <div className="wagdie-section">
                        <h2 className="section-header">WAGDIE</h2>
                        <div
                            className="wagdie-box"
                            ref={wagdieRef}
                            style={{ paddingTop: '10px', paddingBottom: '10px', ...(isWagdieExpanded ? {} : { maxHeight: '125px', overflow: 'hidden' }) }}
                        >                            {tokensToDisplay.map(token => (
                            <div
                                className={`token-container wagdie-token ${firstTokenSelected ? (selectedTokens.includes(`W-${token.id}`) ? "" : "unselected") : "initial-unselected"}`}
                                key={token.id}
                                onClick={() => toggleTokenSelection(`W-${token.id}`)}
                            >
                                <img
                                    className={selectedTokens.includes(`W-${token.id}`) || !hasBeenSelected ? "selected" : "unselected"}
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
                                    className={`wagdie-token-id-text ${selectedTokens.includes(token.id) || !hasBeenSelected ? "" : "unselected"}`}
                                >
                                    #{token.id}
                                </a>
                            </div>

                        ))}
                        </div>
                        {(isWagdieOverflowing || isWagdieExpanded) && (
                            <div className="expand-collapse" onClick={() => setIsWagdieExpanded(!isWagdieExpanded)}>
                                {isWagdieExpanded ? "Collapse" : "Expand"}
                            </div>
                        )}
                    </div>
                )}
            </main>
            <footer style={{ height: '30px', textAlign: 'center', lineHeight: '30px' }}>
            </footer>
        </div>
    );
}

export default App;