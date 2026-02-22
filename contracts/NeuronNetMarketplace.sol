// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NeuronNetMarketplace
 * @dev Decentralized GPU Compute Marketplace on Monad
 * @notice Handles GPU rentals, payments, escrow, and premium subscriptions
 */
contract NeuronNetMarketplace {
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    uint256 public platformFeePercent = 5; // 5% platform fee
    uint256 public rentalIdCounter;
    uint256 public subscriptionIdCounter;
    
    // Subscription tiers
    enum SubscriptionTier { NONE, PRO, ENTERPRISE }
    
    // Rental status
    enum RentalStatus { ACTIVE, COMPLETED, CANCELLED, DISPUTED }
    
    // GPU specifications
    struct GPU {
        uint256 id;
        address seller;
        string name;
        uint256 cudaCores;
        uint256 vram;
        uint256 pricePerHour; // in MON tokens (wei)
        bool isAvailable;
        uint256 totalRentals;
    }
    
    // Rental agreement
    struct Rental {
        uint256 id;
        uint256 gpuId;
        address renter;
        address seller;
        uint256 hours;
        uint256 totalCost;
        uint256 startTime;
        RentalStatus status;
        bool assistanceRequested;
        bool outputDelivered;
    }
    
    // Premium subscription
    struct Subscription {
        uint256 id;
        address user;
        SubscriptionTier tier;
        uint256 startTime;
        uint256 expiryTime;
        bool isActive;
    }
    
    // ============ MAPPINGS ============
    
    mapping(uint256 => GPU) public gpus;
    mapping(uint256 => Rental) public rentals;
    mapping(address => Subscription) public subscriptions;
    mapping(address => uint256) public sellerEarnings;
    mapping(address => uint256) public platformEarnings;
    
    uint256[] public gpuIds;
    
    // ============ EVENTS ============
    
    event GPUListed(uint256 indexed gpuId, address indexed seller, string name, uint256 pricePerHour);
    event GPUDelisted(uint256 indexed gpuId);
    event RentalCreated(uint256 indexed rentalId, uint256 indexed gpuId, address indexed renter, uint256 hours, uint256 totalCost);
    event RentalCompleted(uint256 indexed rentalId);
    event RentalCancelled(uint256 indexed rentalId);
    event AssistanceRequested(uint256 indexed rentalId, address indexed renter);
    event OutputDelivered(uint256 indexed rentalId);
    event SubscriptionPurchased(address indexed user, SubscriptionTier tier, uint256 expiryTime);
    event SubscriptionRenewed(address indexed user, SubscriptionTier tier, uint256 newExpiryTime);
    event PaymentReleased(uint256 indexed rentalId, address indexed seller, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyActiveSeller(uint256 _gpuId) {
        require(gpus[_gpuId].seller == msg.sender, "Not the GPU seller");
        _;
    }
    
    modifier onlyRenter(uint256 _rentalId) {
        require(rentals[_rentalId].renter == msg.sender, "Not the renter");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ GPU LISTING FUNCTIONS ============
    
    /**
     * @dev List a new GPU for rent
     */
    function listGPU(
        string memory _name,
        uint256 _cudaCores,
        uint256 _vram,
        uint256 _pricePerHour
    ) external returns (uint256) {
        require(_pricePerHour > 0, "Price must be greater than 0");
        
        uint256 gpuId = gpuIds.length + 1;
        
        gpus[gpuId] = GPU({
            id: gpuId,
            seller: msg.sender,
            name: _name,
            cudaCores: _cudaCores,
            vram: _vram,
            pricePerHour: _pricePerHour,
            isAvailable: true,
            totalRentals: 0
        });
        
        gpuIds.push(gpuId);
        
        emit GPUListed(gpuId, msg.sender, _name, _pricePerHour);
        
        return gpuId;
    }
    
    /**
     * @dev Update GPU availability
     */
    function updateGPUAvailability(uint256 _gpuId, bool _isAvailable) 
        external 
        onlyActiveSeller(_gpuId) 
    {
        gpus[_gpuId].isAvailable = _isAvailable;
    }
    
    /**
     * @dev Delist a GPU
     */
    function delistGPU(uint256 _gpuId) external onlyActiveSeller(_gpuId) {
        gpus[_gpuId].isAvailable = false;
        emit GPUDelisted(_gpuId);
    }
    
    // ============ RENTAL FUNCTIONS ============
    
    /**
     * @dev Create a new rental with payment in escrow
     */
    function createRental(uint256 _gpuId, uint256 _hours) 
        external 
        payable 
        returns (uint256) 
    {
        GPU storage gpu = gpus[_gpuId];
        require(gpu.isAvailable, "GPU not available");
        require(_hours > 0, "Hours must be greater than 0");
        
        // Calculate cost with premium discount
        uint256 baseCost = gpu.pricePerHour * _hours;
        uint256 discountedCost = _applyPremiumDiscount(msg.sender, baseCost);
        
        require(msg.value >= discountedCost, "Insufficient payment");
        
        rentalIdCounter++;
        
        rentals[rentalIdCounter] = Rental({
            id: rentalIdCounter,
            gpuId: _gpuId,
            renter: msg.sender,
            seller: gpu.seller,
            hours: _hours,
            totalCost: discountedCost,
            startTime: block.timestamp,
            status: RentalStatus.ACTIVE,
            assistanceRequested: false,
            outputDelivered: false
        });
        
        gpu.totalRentals++;
        
        emit RentalCreated(rentalIdCounter, _gpuId, msg.sender, _hours, discountedCost);
        
        // Refund excess payment
        if (msg.value > discountedCost) {
            payable(msg.sender).transfer(msg.value - discountedCost);
        }
        
        return rentalIdCounter;
    }
    
    /**
     * @dev Request assistance from team (non-technical users)
     */
    function requestAssistance(uint256 _rentalId) external onlyRenter(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");
        
        rental.assistanceRequested = true;
        
        emit AssistanceRequested(_rentalId, msg.sender);
    }
    
    /**
     * @dev Mark output as delivered (called by team or seller)
     */
    function markOutputDelivered(uint256 _rentalId) external {
        Rental storage rental = rentals[_rentalId];
        require(
            msg.sender == rental.seller || msg.sender == owner,
            "Only seller or team can mark output delivered"
        );
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");
        
        rental.outputDelivered = true;
        
        emit OutputDelivered(_rentalId);
    }
    
    /**
     * @dev Complete rental and release payment to seller
     */
    function completeRental(uint256 _rentalId) external {
        Rental storage rental = rentals[_rentalId];
        require(
            msg.sender == rental.renter || msg.sender == owner,
            "Only renter or team can complete rental"
        );
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");
        require(rental.outputDelivered, "Output not delivered yet");
        
        rental.status = RentalStatus.COMPLETED;
        
        // Calculate platform fee and seller earnings
        uint256 platformFee = (rental.totalCost * platformFeePercent) / 100;
        uint256 sellerPayment = rental.totalCost - platformFee;
        
        // Update earnings
        sellerEarnings[rental.seller] += sellerPayment;
        platformEarnings[owner] += platformFee;
        
        emit RentalCompleted(_rentalId);
        emit PaymentReleased(_rentalId, rental.seller, sellerPayment);
    }
    
    /**
     * @dev Cancel rental (only before work starts)
     */
    function cancelRental(uint256 _rentalId) external onlyRenter(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");
        require(block.timestamp <= rental.startTime + 5 minutes, "Cancellation period expired");
        
        rental.status = RentalStatus.CANCELLED;
        
        // Refund renter
        payable(rental.renter).transfer(rental.totalCost);
        
        emit RentalCancelled(_rentalId);
    }
    
    // ============ SUBSCRIPTION FUNCTIONS ============
    
    /**
     * @dev Purchase premium subscription
     */
    function purchaseSubscription(SubscriptionTier _tier) external payable {
        require(_tier != SubscriptionTier.NONE, "Invalid tier");
        
        uint256 price;
        uint256 duration;
        
        if (_tier == SubscriptionTier.PRO) {
            price = 50 ether; // 50 MON
            duration = 30 days;
        } else if (_tier == SubscriptionTier.ENTERPRISE) {
            price = 150 ether; // 150 MON
            duration = 90 days;
        }
        
        require(msg.value >= price, "Insufficient payment");
        
        uint256 expiryTime = block.timestamp + duration;
        
        // Check if renewing or new subscription
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.isActive && sub.expiryTime > block.timestamp) {
            // Extend existing subscription
            expiryTime = sub.expiryTime + duration;
            emit SubscriptionRenewed(msg.sender, _tier, expiryTime);
        } else {
            emit SubscriptionPurchased(msg.sender, _tier, expiryTime);
        }
        
        subscriptions[msg.sender] = Subscription({
            id: ++subscriptionIdCounter,
            user: msg.sender,
            tier: _tier,
            startTime: block.timestamp,
            expiryTime: expiryTime,
            isActive: true
        });
        
        // Platform receives subscription fees
        platformEarnings[owner] += msg.value;
        
        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
    
    /**
     * @dev Check if user has active premium subscription
     */
    function hasActivePremium(address _user) public view returns (bool, SubscriptionTier) {
        Subscription memory sub = subscriptions[_user];
        bool isActive = sub.isActive && sub.expiryTime > block.timestamp;
        return (isActive, sub.tier);
    }
    
    /**
     * @dev Apply premium discount to rental price
     */
    function _applyPremiumDiscount(address _user, uint256 _baseCost) 
        internal 
        view 
        returns (uint256) 
    {
        (bool isPremium, SubscriptionTier tier) = hasActivePremium(_user);
        
        if (!isPremium) {
            return _baseCost;
        }
        
        uint256 discountPercent;
        if (tier == SubscriptionTier.PRO) {
            discountPercent = 30; // 30% off
        } else if (tier == SubscriptionTier.ENTERPRISE) {
            discountPercent = 50; // 50% off
        }
        
        uint256 discount = (_baseCost * discountPercent) / 100;
        return _baseCost - discount;
    }
    
    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @dev Withdraw earnings (for sellers and platform)
     */
    function withdrawEarnings() external {
        uint256 amount;
        
        if (msg.sender == owner) {
            amount = platformEarnings[owner];
            platformEarnings[owner] = 0;
        } else {
            amount = sellerEarnings[msg.sender];
            sellerEarnings[msg.sender] = 0;
        }
        
        require(amount > 0, "No earnings to withdraw");
        
        payable(msg.sender).transfer(amount);
        
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get all available GPUs
     */
    function getAvailableGPUs() external view returns (GPU[] memory) {
        uint256 availableCount = 0;
        
        // Count available GPUs
        for (uint256 i = 0; i < gpuIds.length; i++) {
            if (gpus[gpuIds[i]].isAvailable) {
                availableCount++;
            }
        }
        
        // Create array of available GPUs
        GPU[] memory availableGPUs = new GPU[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < gpuIds.length; i++) {
            uint256 gpuId = gpuIds[i];
            if (gpus[gpuId].isAvailable) {
                availableGPUs[index] = gpus[gpuId];
                index++;
            }
        }
        
        return availableGPUs;
    }
    
    /**
     * @dev Get rental details
     */
    function getRental(uint256 _rentalId) external view returns (Rental memory) {
        return rentals[_rentalId];
    }
    
    /**
     * @dev Get user's subscription details
     */
    function getSubscription(address _user) external view returns (Subscription memory) {
        return subscriptions[_user];
    }
    
    /**
     * @dev Calculate rental cost with premium discount
     */
    function calculateRentalCost(address _user, uint256 _gpuId, uint256 _hours) 
        external 
        view 
        returns (uint256 baseCost, uint256 discountedCost, uint256 discount) 
    {
        GPU memory gpu = gpus[_gpuId];
        baseCost = gpu.pricePerHour * _hours;
        discountedCost = _applyPremiumDiscount(_user, baseCost);
        discount = baseCost - discountedCost;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10, "Fee too high");
        platformFeePercent = _newFeePercent;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {}
}
