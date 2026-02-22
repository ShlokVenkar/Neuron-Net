// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NeuronNetMarketplace {
    address public owner;
    uint256 public platformFeePercent = 5;
    uint256 public rentalIdCounter;
    uint256 public subscriptionIdCounter;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    
    enum SubscriptionTier { NONE, PRO, ENTERPRISE }
    enum RentalStatus { ACTIVE, COMPLETED, CANCELLED, DISPUTED }
    
    struct GPU {
        uint256 id;
        address seller;
        string name;
        uint256 cudaCores;
        uint256 vram;
        uint256 pricePerHour;
        bool isAvailable;
        uint256 totalRentals;
    }
    
    struct Rental {
        uint256 id;
        uint256 gpuId;
        address renter;
        address seller;
        uint256 duration;
        uint256 totalCost;
        uint256 startTime;
        RentalStatus status;
        bool assistanceRequested;
        bool outputDelivered;
    }
    
    struct Subscription {
        uint256 id;
        address user;
        SubscriptionTier tier;
        uint256 startTime;
        uint256 expiryTime;
        bool isActive;
    }
    
    mapping(uint256 => GPU) public gpus;
    mapping(uint256 => Rental) public rentals;
    mapping(address => Subscription) public subscriptions;
    mapping(address => uint256) public sellerEarnings;
    mapping(address => uint256) public platformEarnings;
    uint256[] public gpuIds;
    
    event GPUListed(uint256 indexed gpuId, address indexed seller, string name, uint256 pricePerHour);
    event GPUDelisted(uint256 indexed gpuId);
    event RentalCreated(uint256 indexed rentalId, uint256 indexed gpuId, address indexed renter, uint256 duration, uint256 totalCost);
    event RentalCompleted(uint256 indexed rentalId);
    event RentalCancelled(uint256 indexed rentalId);
    event AssistanceRequested(uint256 indexed rentalId, address indexed renter);
    event OutputDelivered(uint256 indexed rentalId);
    event SubscriptionPurchased(address indexed user, SubscriptionTier tier, uint256 expiryTime);
    event SubscriptionRenewed(address indexed user, SubscriptionTier tier, uint256 newExpiryTime);
    event PaymentReleased(uint256 indexed rentalId, address indexed seller, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyActiveSeller(uint256 _gpuId) {
        require(gpus[_gpuId].seller == msg.sender);
        _;
    }
    
    modifier onlyRenter(uint256 _rentalId) {
        require(rentals[_rentalId].renter == msg.sender);
        _;
    }
    
    modifier nonReentrant() {
        require(_status != _ENTERED);
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
    
    constructor() {
        owner = msg.sender;
        _status = _NOT_ENTERED;
    }
    
    
    function listGPU(string memory _name, uint256 _cudaCores, uint256 _vram, uint256 _pricePerHour) external returns (uint256) {
        require(_pricePerHour > 0);
        uint256 gpuId = gpuIds.length + 1;
        gpus[gpuId] = GPU(gpuId, msg.sender, _name, _cudaCores, _vram, _pricePerHour, true, 0);
        gpuIds.push(gpuId);
        emit GPUListed(gpuId, msg.sender, _name, _pricePerHour);
        return gpuId;
    }
    
    function updateGPUAvailability(uint256 _gpuId, bool _isAvailable) external onlyActiveSeller(_gpuId) {
        gpus[_gpuId].isAvailable = _isAvailable;
    }
    
    function delistGPU(uint256 _gpuId) external onlyActiveSeller(_gpuId) {
        gpus[_gpuId].isAvailable = false;
        emit GPUDelisted(_gpuId);
    }
    
    
    function createRental(uint256 _gpuId, uint256 _hours) external payable returns (uint256) {
        GPU storage gpu = gpus[_gpuId];
        require(gpu.isAvailable && _hours > 0);
        uint256 baseCost = gpu.pricePerHour * _hours;
        uint256 discountedCost = _applyPremiumDiscount(msg.sender, baseCost);
        require(msg.value >= discountedCost);
        rentalIdCounter++;
        rentals[rentalIdCounter] = Rental(rentalIdCounter, _gpuId, msg.sender, gpu.seller, _hours, discountedCost, block.timestamp, RentalStatus.ACTIVE, false, false);
        gpu.totalRentals++;
        emit RentalCreated(rentalIdCounter, _gpuId, msg.sender, _hours, discountedCost);
        if (msg.value > discountedCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - discountedCost}("");
            require(success);
        }
        return rentalIdCounter;
    }
    
    function requestAssistance(uint256 _rentalId) external onlyRenter(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE);
        rental.assistanceRequested = true;
        emit AssistanceRequested(_rentalId, msg.sender);
    }
    
    function markOutputDelivered(uint256 _rentalId) external {
        Rental storage rental = rentals[_rentalId];
        require(msg.sender == rental.seller || msg.sender == owner);
        require(rental.status == RentalStatus.ACTIVE);
        rental.outputDelivered = true;
        emit OutputDelivered(_rentalId);
    }
    
    function completeRental(uint256 _rentalId) external {
        Rental storage rental = rentals[_rentalId];
        require(msg.sender == rental.renter || msg.sender == owner);
        require(rental.status == RentalStatus.ACTIVE && rental.outputDelivered);
        rental.status = RentalStatus.COMPLETED;
        uint256 platformFee = (rental.totalCost * platformFeePercent) / 100;
        uint256 sellerPayment = rental.totalCost - platformFee;
        sellerEarnings[rental.seller] += sellerPayment;
        platformEarnings[owner] += platformFee;
        emit RentalCompleted(_rentalId);
        emit PaymentReleased(_rentalId, rental.seller, sellerPayment);
    }
    
    function cancelRental(uint256 _rentalId) external onlyRenter(_rentalId) nonReentrant {
        Rental storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE && block.timestamp <= rental.startTime + 5 minutes);
        rental.status = RentalStatus.CANCELLED;
        (bool success, ) = payable(rental.renter).call{value: rental.totalCost}("");
        require(success);
        emit RentalCancelled(_rentalId);
    }
    
    
    function purchaseSubscription(SubscriptionTier _tier) external payable {
        require(_tier != SubscriptionTier.NONE);
        uint256 price;
        uint256 duration;
        if (_tier == SubscriptionTier.PRO) {
            price = 50 ether;
            duration = 30 days;
        } else {
            price = 150 ether;
            duration = 90 days;
        }
        require(msg.value >= price);
        uint256 expiryTime = block.timestamp + duration;
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.isActive && sub.expiryTime > block.timestamp) {
            expiryTime = sub.expiryTime + duration;
            emit SubscriptionRenewed(msg.sender, _tier, expiryTime);
        } else {
            emit SubscriptionPurchased(msg.sender, _tier, expiryTime);
        }
        subscriptions[msg.sender] = Subscription(++subscriptionIdCounter, msg.sender, _tier, block.timestamp, expiryTime, true);
        platformEarnings[owner] += msg.value;
        if (msg.value > price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(success);
        }
    }
    
    function hasActivePremium(address _user) public view returns (bool, SubscriptionTier) {
        Subscription memory sub = subscriptions[_user];
        bool isActive = sub.isActive && sub.expiryTime > block.timestamp;
        return (isActive, sub.tier);
    }
    
    function _applyPremiumDiscount(address _user, uint256 _baseCost) internal view returns (uint256) {
        (bool isPremium, SubscriptionTier tier) = hasActivePremium(_user);
        if (!isPremium) return _baseCost;
        uint256 discountPercent = tier == SubscriptionTier.PRO ? 30 : 50;
        uint256 discount = (_baseCost * discountPercent) / 100;
        return _baseCost - discount;
    }
    
    
    function withdrawEarnings() external nonReentrant {
        uint256 amount;
        if (msg.sender == owner) {
            amount = platformEarnings[owner];
            platformEarnings[owner] = 0;
        } else {
            amount = sellerEarnings[msg.sender];
            sellerEarnings[msg.sender] = 0;
        }
        require(amount > 0);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success);
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    function getRental(uint256 _rentalId) external view returns (Rental memory) {
        return rentals[_rentalId];
    }
    
    function getSubscription(address _user) external view returns (Subscription memory) {
        return subscriptions[_user];
    }
    
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10);
        platformFeePercent = _newFeePercent;
    }
    
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0));
        owner = _newOwner;
    }
    
    receive() external payable {}
}
