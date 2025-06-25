import { ethers } from 'ethers';
import SupplyChainArtifact from '../../artifacts/contracts/SupplyChain.sol/SupplyChain.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    contractAddress,
    SupplyChainArtifact.abi,
    signer
  );
};

export const addPartner = async (id: string, name: string, type: string, lat: number, lng: number) => {
  const contract = await getContract();
  const tx = await contract.addPartner(
    id,
    name,
    type,
    Math.floor(lat * 1e6),
    Math.floor(lng * 1e6)
  );
  await tx.wait();
  return tx;
};

export const createOrder = async (id: string, supplierId: string, productId: string, supplierAddress: string) => {
  const contract = await getContract();
  const tx = await contract.createOrder(id, supplierId, productId, supplierAddress);
  await tx.wait();
  return tx;
};

export const acceptOrder = async (orderId: string, price: number, deliveryDate: number) => {
  const contract = await getContract();
  const tx = await contract.acceptOrder(orderId, price, deliveryDate);
  await tx.wait();
  return tx;
};

export const startShipment = async (orderId: string, carrierId: string, price: string) => {
  const contract = await getContract();
  const tx = await contract.startShipment(orderId, carrierId, {
    value: ethers.parseEther(price)
  });
  await tx.wait();
  return tx;
};

export const completeShipment = async (orderId: string) => {
  const contract = await getContract();
  const tx = await contract.completeShipment(orderId);
  await tx.wait();
  return tx;
};