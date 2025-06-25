// contracts/SupplyChain.sol
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Partner {
        string id;
        string name;
        string partnerType; // "Importer" or "Exporter"
        int256 lat;
        int256 lng;
        address walletAddress;
    }
    
    struct Order {
    string id;
    string supplierId;
    string productId;
    uint256 orderDate;
    uint256 deliveryDate;
    uint256 price;
    bool isPaid;
    string shipmentStatus;
    string requestStatus;
    string carrierId;
    string transportType; // Add this line (values: "truck", "ship", "plane", "train")
}

    uint256 public partnersCount;
    uint256 public ordersCount;
    
    Partner[] public partners;
    Order[] public orders;
    
    event PartnerAdded(string partnerId, string name, address walletAddress);
    event OrderCreated(string orderId, string supplierId, string productId);
    event ShipmentStarted(string orderId, string carrierId);
    event ShipmentCompleted(string orderId);
    
    function addPartner(
        string memory id,
        string memory name,
        string memory partnerType,
        int256 lat,
        int256 lng,
        address walletAddress
    ) external {
        partners.push(Partner(id, name, partnerType, lat, lng, walletAddress));
        partnersCount++;
        emit PartnerAdded(id, name, walletAddress);
    }
    
    function createOrder(
    string memory supplierId, 
    string memory productId,
    string memory transportType
) external {
    string memory newId = string(abi.encodePacked("ORD-", uintToString(orders.length + 1)));
    orders.push(Order({
        id: newId,
        supplierId: supplierId,
        productId: productId,
        orderDate: block.timestamp,
        deliveryDate: 0,
        price: 0,
        isPaid: false,
        shipmentStatus: "Pending",
        requestStatus: "Pending",
        carrierId: "",
        transportType: transportType // Add this
    }));
    ordersCount++;
    emit OrderCreated(newId, supplierId, productId);
}

    
    function startShipment(string memory orderId, string memory carrierId) external {
        for (uint i = 0; i < orders.length; i++) {
            if (keccak256(bytes(orders[i].id)) == keccak256(bytes(orderId))) {
                orders[i].shipmentStatus = "In Transit";
                orders[i].carrierId = carrierId;
                emit ShipmentStarted(orderId, carrierId);
                return;
            }
        }
        revert("Order not found");
    }

    // Add carbon emission tracking
struct CarbonEmission {
    string orderId;
    uint256 timestamp;
    uint256 emissions; // in grams
    uint256 distance; // in km
    string transportType;
}

mapping(string => CarbonEmission) public carbonEmissions;
uint256 public carbonEmissionsCount;

event CarbonEmitted(
    string indexed orderId,
    uint256 emissions,
    uint256 distance,
    string transportType
);

function recordCarbonEmission(
    string memory orderId,
    uint256 emissions,
    uint256 distance,
    string memory transportType
) external {
    carbonEmissions[orderId] = CarbonEmission({
        orderId: orderId,
        timestamp: block.timestamp,
        emissions: emissions,
        distance: distance,
        transportType: transportType
    });
    carbonEmissionsCount++;
    emit CarbonEmitted(orderId, emissions, distance, transportType);
}

    
    function completeShipment(string memory orderId) external payable {
        for (uint i = 0; i < orders.length; i++) {
            if (keccak256(bytes(orders[i].id)) == keccak256(bytes(orderId))) {
                orders[i].shipmentStatus = "Delivered";
                orders[i].isPaid = true;
                emit ShipmentCompleted(orderId);
                return;
            }
        }
        revert("Order not found");
    }
    
    // Helper function
    function uintToString(uint v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }
        return string(s);
    }

    // Add these to your contract
function acceptOrderRequest(
    string memory orderId,
    uint256 price,
    uint256 deliveryDate
) external {
    for (uint i = 0; i < orders.length; i++) {
        if (keccak256(bytes(orders[i].id)) == keccak256(bytes(orderId))) {
            require(
                keccak256(bytes(orders[i].requestStatus)) == keccak256(bytes("Pending")),
                "Order is not pending"
            );
            orders[i].price = price;
            orders[i].deliveryDate = deliveryDate;
            orders[i].requestStatus = "Approved";
            emit OrderApproved(orderId, msg.sender, price, deliveryDate);
            return;
        }
    }
    revert("Order not found");
}

function declineOrderRequest(string memory orderId) external {
    for (uint i = 0; i < orders.length; i++) {
        if (keccak256(bytes(orders[i].id)) == keccak256(bytes(orderId))) {
            require(
                keccak256(bytes(orders[i].requestStatus)) == keccak256(bytes("Pending")),
                "Order is not pending"
            );
            orders[i].requestStatus = "Declined";
            emit OrderDeclined(orderId, msg.sender);
            return;
        }
    }
    revert("Order not found");
}

// Add to your contract
struct UserLocation {
    address userAddress;
    int256 lat;
    int256 lng;
}

mapping(address => UserLocation) public userLocations;

event UserLocationUpdated(address indexed user, int256 lat, int256 lng);

function updateUserLocation(int256 lat, int256 lng) external {
    userLocations[msg.sender] = UserLocation({
        userAddress: msg.sender,
        lat: lat,
        lng: lng
    });
    emit UserLocationUpdated(msg.sender, lat, lng);
}

function getUserLocation(address user) external view returns (int256 lat, int256 lng) {
    UserLocation storage location = userLocations[user];
    return (location.lat, location.lng);
}

// Add these events to your contract
event OrderApproved(
    string indexed orderId,
    address indexed approvedBy,
    uint256 price,
    uint256 deliveryDate
);
event OrderDeclined(
    string indexed orderId,
    address indexed declinedBy
);

// Add to your SupplyChain.sol contract
struct DelayPrediction {
    string orderId;
    uint256 timestamp;
    uint256 probability; // 0-100 representing percentage
    string reason;
    uint256 estimatedDelay; // in hours
}

mapping(string => DelayPrediction) public delayPredictions;
uint256 public delayPredictionsCount;

event DelayPredicted(
    string indexed orderId,
    uint256 probability,
    string reason,
    uint256 estimatedDelay
);

function recordDelayPrediction(
    string memory orderId,
    uint256 probability,
    string memory reason,
    uint256 estimatedDelay
) external {
    delayPredictions[orderId] = DelayPrediction({
        orderId: orderId,
        timestamp: block.timestamp,
        probability: probability,
        reason: reason,
        estimatedDelay: estimatedDelay
    });
    delayPredictionsCount++;
    emit DelayPredicted(orderId, probability, reason, estimatedDelay);
}
}