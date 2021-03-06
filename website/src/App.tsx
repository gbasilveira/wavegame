import React, { useEffect, useInsertionEffect, useState } from "react";
import { ethers } from 'ethers';
import "./App.css";
import abi from './WavePortal.json';
import { Button, FormControl, InputGroup, Row, Container, Col, Card, Alert } from "react-bootstrap";
import { log } from "console";

const contractAddress = '0xE62Ee36b8D09DD835E0D06a48A5ddE49D0973779';
// const contractAddress = '0xCf84099552601866cb92CB595fD967FdCB64EeeB';
const contractABI = abi.abi;

interface Wave {
    timestamp: Date | number,
    message: string,
    address?: string,
    waver?: string
}


interface Window {
    ethereum?: {
        isMetaMask?: true;
        isTrust?: true;
        providers?: any[];
        request?: (...args: any[]) => Promise<void>;
    };
    BinanceChain?: {
        bnbSign?: (address: string, message: string) => Promise<{ publicKey: string; signature: string }>;
    };
}

interface AlertMessage {
    show: boolean,
    text: string,
    color: string,
}

const { ethereum } = window as Window;

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([] as Array<Wave>);
    const [messageInput, setMessageInput] = useState("");
    const [alertMessage, setAlertMessage] = useState({show:false, text:'', color:'primary'} as AlertMessage);
    

    const checkIfWalletIsConnected = async () => {
        let accounts: any;
        try {

            if (!ethereum) {
                return false;
            }


            if (ethereum.request){
                accounts = await ethereum.request({ method: "eth_accounts" });
            }

            if (accounts.length !== 0) {
                const account = accounts[0];
                setCurrentAccount(account); 
                return true;
            } else {
                console.log("No authorized account found")
                return false;
            }
        } catch (error) {
            console.log(error);
        }

        return false;
    }
    /**
    * Implement your connectWallet method here
    */
    const connectWallet = async () => {
        let accounts: any;
        try {
            const { ethereum } = window as Window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            if (ethereum.request)
                accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error)
        }
    }

    const wave = async () => {
        try {
            const { ethereum } = window as Window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                let am = alertMessage;


                let count = await wavePortalContract.getTotalWaves();

                
                const waveTxn = await wavePortalContract.wave(messageInput);
                console.log("Mining...", waveTxn.hash);
                setMessageInput("");
                am.text = 'Sending message ...'
                am.color = 'primary';
                am.show = true;
                setAlertMessage(am);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);
                am.text = 'Your message was sent successfully. Thanks ????'
                am.color = 'success';
                setAlertMessage(am);
                setTimeout(() => {
                    am.show = false;
                    setAlertMessage(am)
                }, 5000);



                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }
    /*
     * Create a method that gets all waves from your contract
     */
    const getAllWaves = async () => {
        try {
            const { ethereum } = window as Window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                /*
                 * Call the getAllWaves method from your Smart Contract
                 */
                let am = alertMessage;
                am.show = true;
                am.text = 'Loading messages ...';
                am.color = 'primary';
                setAlertMessage(am);
                const waves: Array<Wave> = await wavePortalContract.getAllWaves();

                /*
                 * We only need address, timestamp, and message in our UI so let's
                 * pick those out
                 */
                let wavesCleaned: Array<Wave> = [];
                waves.forEach(wave => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp as number * 1000),
                        message: wave.message
                    });
                });

                /*
                 * Store our data in React State
                 */
                setAllWaves(wavesCleaned);
                
                am.show = false;
                setAlertMessage(am);
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            let am = alertMessage;
            am.show  = true;
            am.text  = "An error ocurred. Sorry";
            am.color = 'danger';
            setAlertMessage(am);

            console.log(error);
        }
    }

    const NewGame = async () => {
        try {

            const { ethereum } = window as Window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();

                /*
                * Execute the actual wave from your smart contract
                */
                const waveTxn = await wavePortalContract.newGame(10);
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);
            }

        }
        catch (error) { console.log(error); }
    }
    
    useEffect(() => {

        checkIfWalletIsConnected();
        if (currentAccount) {
            getAllWaves();
        }


        const body = document.body;
        body.style.background=" linear-gradient(180deg, hsl(200,90%,60%) 0%,  hsl(30,30%,80%) 100%)";
        body.style.height="100vh";
        body.style.overflow="none";
        body.style.backgroundAttachment='fixed';
    }, [currentAccount])

    const Social = () => <>
        <div className="d-flex justify-content-center flex-row  align-items-center">
            <a href="https://twitter.com/gbasilveira"><img src="/img/twitter.svg" width="24" className="mx-1"/></a>
            <a href="https://opensea.io/gbasilveira"><img src="/img/opensea.svg" width="24" className="mx-1"/></a>
            <a href="https://linkedin.com/in/gbasilveira"><img src="/img/linkedin.svg" width="24" className="mx-1"/></a>
            <a href="https://facebook.com/gbasilveira"><img src="/img/facebook.svg" width="24" className="mx-1"/></a>
            <a href="https://instagram.com/gbasilveira"><img src="/img/instagram.svg" width="24" className="mx-1"/></a>
            <a href="https://tiktok.com/@gbasilveira"><img src="/img/tiktok.svg" width="24" className="mx-1"/></a>
        </div>
    </>

    if(!currentAccount) return <>
        <Container style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
        }}>

            <Row style={{backgroundColor: 'hsla(0,0%,100%,90%)'}} className="p-5 shadow">
                <Row className="my-5">
                    <img src="/img/gbasilveira.svg" style={{maxHeight:'250px'}} alt="" />
                </Row>
                <Row>
                    <p className="">
                        Hi, this is Guilherme, I'm developing my Web3 portfolio and this was my first exercise at <a href="https://buildspace.so/">Buildspace</a>.<br />
                        The idea is simple: a decentralized guestbook, just like those from the 2000's... "any one?". <br />
                        Thanks for the collaboration ;)
                    </p> 
                </Row>
                <Row>
                    <button className="btn align-self-center btn-success my-5 py-4" onClick={connectWallet}>Connect your wallet to Rinkeby network, please!</button>
                </Row>
                <Row><Social /></Row>
            </Row>
        </Container>
    </>
    
    
    return (<>
        {alertMessage.show && <>
            <Alert className="text-center shadow m-4" variant={alertMessage.color} style={{zIndex:'10', right:'0px'}}>
                <p className="m-0 p-lg-4 p-0" style={{fontSize:'large'}}>{alertMessage.text}</p>
            </Alert>
        </>}
        <Row className="p-3 rounded shadow bg-white d-flex flex-row  justify-content-between">
            <Col>
                <img src="/img/gbasilveira.svg" style={{maxHeight:'50px'}} alt="" />
            </Col>
            <Col className="d-flex justify-content-end">
                <Social />
            </Col>
        </Row>
        <Container className="p-1 p-md-4 my-4 h-100 rounded-lg" style={{overflow:'none'}} >
                <Row style={{background:'hsla(0,0%,0%,10%)'}} className="shadow p-4">
                    <InputGroup>
                        <FormControl
                            onChange={(e) => { setMessageInput(e.target.value) }}
                            value={messageInput}
                        />
                        <Button onClick={wave} className="btn py-2 px-4">send</Button>
                    </InputGroup>
                </Row>
                <Row className="h-100 p-0 m-0 mt-4" style={{overflow: 'auto' }}>
                    {allWaves.map((wave: Wave, key: number) => <>
                        <Col key={key} className="col-12  col-md-6 col-lg-4 col-xl-3 ">
                            <Card className="rounded align-self-start shadow text-lowercase p-0 m-1 "   style={{background:'hsla(0,0%,100%,30%)'}}>
                                <Card.Header className="font-weight-bold">{wave.address?.substr(0,6) + '...' + wave.address?.substr(-5)}</Card.Header>                            
                                <Card.Body className="" style={{background:'hsla(0,0%,100%,30%)'}}>{wave.message}</Card.Body> 
                                <Card.Footer className="font-weight-light" style={{fontSize:'small', textAlign:"right"}}>{wave.timestamp.toLocaleString()}</Card.Footer>
                            </Card>
                        </Col>
                    </>)}  
                </Row>
        </Container>
    </>
    );
}

export default App