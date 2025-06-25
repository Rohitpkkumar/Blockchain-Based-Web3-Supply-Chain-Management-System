import { ethers } from 'ethers';
import { Partner, Order, Coordinates, UserLocation, CarbonEmission, DelayPrediction} from './types';

import SupplyChain from "../artifacts/contracts/SupplyChain.sol/SupplyChain.json";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = SupplyChain.abi;

export async function addPartner(
  provider: ethers.BrowserProvider,
  partnerData: {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    walletAddress: string;
  }
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.addPartner(
    partnerData.id,
    partnerData.name,
    partnerData.type,
    partnerData.lat,
    partnerData.lng,
    partnerData.walletAddress
  );
  await tx.wait();
  return tx.hash;
}

// Add to contracts.ts
export async function createOrder(
  provider: ethers.BrowserProvider,
  supplierId: string,
  productId: string,
  transportType: string
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.createOrder(supplierId, productId, transportType);
  await tx.wait();
  return tx.hash;
}

export async function recordCarbonEmission(
  provider: ethers.BrowserProvider,
  orderId: string,
  emissions: number,
  distance: number,
  transportType: string
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.recordCarbonEmission(
    orderId,
    Math.round(emissions * 1000), // Convert kg to grams
    Math.round(distance * 1000), // Convert km to meters
    transportType
  );
  await tx.wait();
  return tx.hash;
}

export async function getCarbonEmissions(provider: ethers.BrowserProvider): Promise<CarbonEmission[]> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.carbonEmissionsCount();
  const emissions = [];
  
  for (let i = 0; i < count; i++) {
    const emission = await contract.carbonEmissions(i);
    emissions.push({
      orderId: emission.orderId,
      emissions: Number(emission.emissions) / 1000, // Convert grams to kg
      distance: Number(emission.distance) / 1000, // Convert meters to km
      transportType: emission.transportType,
      timestamp: new Date(Number(emission.timestamp) * 1000).toISOString()
    });
  }
  return emissions;
}

export async function startShipment(
  provider: ethers.BrowserProvider,
  orderId: string,
  carrierId: string
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.startShipment(orderId, carrierId);
  await tx.wait();
  return tx.hash;
}

export async function completeShipment(
  provider: ethers.BrowserProvider,
  orderId: string
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.completeShipment(orderId);
  await tx.wait();
  return tx.hash;
}

// Add these to your contracts.ts
export async function getAllPartners(provider: ethers.BrowserProvider): Promise<Partner[]> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.partnersCount();
  const partners = [];
  
  for (let i = 0; i < count; i++) {
    const partner = await contract.partners(i);
    partners.push({
      id: partner.id,
      name: partner.name,
      type: partner.partnerType,
      position: {
        lat: Number(partner.lat),
        lng: Number(partner.lng),
      },
      walletAddress: partner.walletAddress,
      createdAt: new Date().toISOString().split('T')[0], // You might want to store this in the contract
    });
  }
  return partners;
}

export async function getAllOrders(provider: ethers.BrowserProvider): Promise<Order[]> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.ordersCount();
  const orders = [];
  
  for (let i = 0; i < count; i++) {
    const order = await contract.orders(i);
    orders.push({
      id: order.id,
      supplierId: order.supplierId,
      productId: order.productId,
      orderDate: new Date(Number(order.orderDate) * 1000).toISOString().split('T')[0],
      deliveryDate: order.deliveryDate > 0 
        ? new Date(Number(order.deliveryDate) * 1000).toISOString().split('T')[0] 
        : null,
      price: order.price > 0 ? Number(ethers.formatEther(order.price)) : null,
      isPaid: order.isPaid,
      shipmentStatus: order.shipmentStatus,
      requestStatus: order.requestStatus,
      carrierId: order.carrierId,
    });
  }
  return orders;
}

// Add these to your contracts.ts
export async function respondToOrderRequest(
  provider: ethers.BrowserProvider,
  orderId: string,
  isAccepted: boolean,
  price?: string,
  deliveryDate?: string
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  if (isAccepted) {
    if (!price || !deliveryDate) {
      throw new Error("Price and delivery date are required when accepting an order");
    }
    // Convert price to wei
    const priceInWei = ethers.parseEther(price);
    // Convert delivery date to timestamp
    const deliveryTimestamp = Math.floor(new Date(deliveryDate).getTime() / 1000);
    
    const tx = await contract.acceptOrderRequest(
      orderId,
      priceInWei,
      deliveryTimestamp
    );
    await tx.wait();
    return tx.hash;
  } else {
    const tx = await contract.declineOrderRequest(orderId);
    await tx.wait();
    return tx.hash;
  }
}

export async function getPendingOrders(provider: ethers.BrowserProvider): Promise<Order[]> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.ordersCount();
  const pendingOrders = [];
  
  for (let i = 0; i < count; i++) {
    const order = await contract.orders(i);
    if (order.requestStatus === "Pending") {
      pendingOrders.push({
        id: order.id,
        supplierId: order.supplierId,
        productId: order.productId,
        orderDate: new Date(Number(order.orderDate) * 1000).toISOString().split('T')[0],
        deliveryDate: order.deliveryDate > 0 
          ? new Date(Number(order.deliveryDate) * 1000).toISOString().split('T')[0] 
          : null,
        price: order.price > 0 ? Number(ethers.formatEther(order.price)) : null,
        isPaid: order.isPaid,
        shipmentStatus: order.shipmentStatus,
        requestStatus: order.requestStatus,
        carrierId: order.carrierId,
      });
    }
  }
  return pendingOrders;
}

// Add this to your contracts.ts
export async function updateUserLocation(
  provider: ethers.BrowserProvider,
  lat: number,
  lng: number
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.updateUserLocation(
    Math.round(lat * 1e6), // Store as integer with 6 decimal places
    Math.round(lng * 1e6)  // Store as integer with 6 decimal places
  );
  await tx.wait();
  return tx.hash;
}

export async function getUserLocation(
  provider: ethers.BrowserProvider,
  userAddress: string
): Promise<UserLocation | null> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const [lat, lng] = await contract.getUserLocation(userAddress);
    if (lat === 0 && lng === 0) return null; // Assuming (0,0) means no location set
    
    return {
      position: {
        lat: Number(lat) / 1e6,
        lng: Number(lng) / 1e6
      },
      // Add any other UserLocation fields you need
    };
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
}

// Add to contracts.ts
export async function recordDelayPrediction(
  provider: ethers.BrowserProvider,
  orderId: string,
  probability: number,
  reason: string,
  estimatedDelay: number
) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.recordDelayPrediction(
    orderId,
    Math.round(probability * 100), // Store as percentage (0-100)
    reason,
    estimatedDelay
  );
  await tx.wait();
  return tx.hash;
}

export async function getDelayPredictions(provider: ethers.BrowserProvider): Promise<DelayPrediction[]> {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.delayPredictionsCount();
  const predictions = [];
  
  for (let i = 0; i < count; i++) {
    const prediction = await contract.delayPredictions(i);
    predictions.push({
      orderId: prediction.orderId,
      probability: Number(prediction.probability) / 100, // Convert back to 0-1
      reason: prediction.reason,
      estimatedDelay: Number(prediction.estimatedDelay),
      timestamp: new Date(Number(prediction.timestamp) * 1000).toISOString()
    });
  }
  return predictions;
}
// Add other contract interaction functions as needed
