# Blockchain-Based-Web3-Supply-Chain-Management-System

A decentralized Web3-powered Supply Chain Management System that integrates **AI**, **Blockchain**, and **real-time GPS tracking** to ensure transparency, automation, and secure logistics operations. This platform empowers users to manage suppliers, track shipments, and predict delays using smart contracts and AI modules.

---

## Tech Stack

- **Smart Contracts**: Solidity (EVM-compatible chain)
- **Frontend**: React.js  
- **Backend**: Node.js + Express.js  
- **AI Modules**: Python (Flask APIs)  
- **Wallet Integration**: MetaMask (via Ethers.js / Web3.js)  
- **Geolocation**: GPS-based or simulated tracking  
- **Map Rendering**: Mapbox or Google Maps API  
- **External APIs**: OpenWeather, Google Traffic, IPFS (for file storage)

---

## Features

### Dashboard
- Real-time map showing user, partner, and vehicle locations
- Order summary cards (Completed, Active, Pending, Requests)
- AI Delay Prediction (based on weather and traffic)
- Carbon Emission Calculator
- Fraud Detection Alerts
- Recent Orders Table

### Partner Management
- Add suppliers (type, location, wallet address)
- Supplier data stored on-chain via MetaMask
- View and filter existing partners

### Order Management
- Create orders using supplier ID and product ID
- Blockchain-based order approval via MetaMask
- Order Table with shipment and request status

### 🛠️ Controls
- Start and complete shipments
- Vehicle tracking with GPS or simulation
- Payment processing via smart contracts

### AI Modules
- **Delay Prediction** using OpenWeather and Google Traffic
- **Carbon Emissions** estimator
- **Fraud Detection**: duplicate IDs/locations, abnormal activity
- **Demand Forecasting** for popular suppliers/products

### Blockchain Features
- Immutable order history
- Smart contract logic for verification and payments
- Delivery confirmation via carrier action
- IPFS and zk-SNARKs planned for future privacy features

---

## Screenshots

- **Dashboard View**  
(https://github.com/user-attachments/assets/f2309051-bf18-4a04-a881-9f1fc3475695)
(https://github.com/user-attachments/assets/00340e77-da46-4fde-9965-9b67a86955d3)


- **Partner Management**  
(https://github.com/user-attachments/assets/9fd03315-0744-4d75-ad7c-89c110ca1f58)
(https://github.com/user-attachments/assets/bce9bdae-a670-4439-9dcf-1158c6dc0e46)


- **Order Creation**  
(https://github.com/user-attachments/assets/87b99030-c2d8-469a-83fa-f3db3658b1d1)
(https://github.com/user-attachments/assets/335a29bf-f8cc-45a2-a1c2-7c7c3e4c7827)


- **Controls**
(https://github.com/user-attachments/assets/0d053811-a54c-4585-9162-5ce79123166e)
(https://github.com/user-attachments/assets/42ee3615-17b2-4a29-aeac-a2621932befc)
(https://github.com/user-attachments/assets/42e97ac8-116a-4ce2-98f6-ee78322f747c)



## Deployment Instructions

### 📦 Prerequisites

- Node.js
- Python 3.x
- MetaMask browser extension
- Hardhat / Ganache for local blockchain (or testnet RPC)

---

### Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Rohitpkkumar/Blockchain-Based-Web3-Supply-Chain-Management-System.git
cd Blockchain-Based-Web3-Supply-Chain-Management-System

2. Install Frontend & Backend Dependencies
cd client     # React frontend
npm install
cd ../server  # Node.js backend
npm install

3. Set Up AI Module
cd ../ai
pip install -r requirements.txt
python app.py  # Flask server

4. Compile & Deploy Smart Contracts
cd ../blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost

5. Start Servers
Frontend:
cd client
npm start
Backend:
cd ../server
npm run dev
Flask (AI):
cd ../ai
python app.py

6. Connect MetaMask
Add your local blockchain network
Import your test wallet with ETH
Approve transactions when prompted
