"use client";
import React, { useState } from "react";
import { useCart } from "../../components/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Popular delivery locations in Sri Lanka with distances from restaurant (assumed location: Colombo Fort)
const DELIVERY_LOCATIONS = [
  { name: "Colombo Fort", distance: 0 },
  { name: "Pettah", distance: 1.5 },
  { name: "Bambalapitiya", distance: 4 },
  { name: "Wellawatta", distance: 6 },
  { name: "Dehiwala", distance: 9 },
  { name: "Mount Lavinia", distance: 12 },
  { name: "Nugegoda", distance: 10 },
  { name: "Maharagama", distance: 14 },
  { name: "Kotte", distance: 8 },
  { name: "Rajagiriya", distance: 7 },
  { name: "Moratuwa", distance: 18 },
  { name: "Kelaniya", distance: 11 },
  { name: "Kaduwela", distance: 15 },
  { name: "Malabe", distance: 16 },
  { name: "Homagama", distance: 20 },
];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);

  const calculateSubtotal = () => {
    return getTotalPrice();
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateDeliveryFee = () => {
    if (distance === 0) return 0;
    return distance * 6; // LKR 6 per km
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateDeliveryFee();
  };

  const handleLocationChange = (locationName: string) => {
    setSelectedLocation(locationName);
    const location = DELIVERY_LOCATIONS.find(loc => loc.name === locationName);
    if (location) {
      setDistance(location.distance);
    }
  };

  const handleCheckout = async () => {
    // Validate location is selected
    if (!selectedLocation || !deliveryAddress.trim()) {
      alert("Please select a location and enter your delivery address");
      return;
    }

    setLoading(true);
    
    // Store delivery info in localStorage for order processing
    const deliveryInfo = {
      location: selectedLocation,
      address: deliveryAddress,
      distance: distance,
      deliveryFee: calculateDeliveryFee()
    };
    localStorage.setItem('deliveryInfo', JSON.stringify(deliveryInfo));
    
    // Simulate order placement
    setTimeout(() => {
      setLoading(false);
      router.push("/orders");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            <Link href="/" className="text-red-600 hover:text-red-700">
              Continue Shopping
            </Link>
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={String(item.id)} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-red-600 font-bold mt-1">LKR {(item.price || 0).toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            className="px-4 py-2 hover:bg-gray-100 transition font-semibold"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="px-6 py-2 border-x border-gray-300 font-semibold">{item.quantity}</span>
                          <button
                            className="px-4 py-2 hover:bg-gray-100 transition font-semibold"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800 mb-4">
                        LKR {((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-black hover:text-gray-700 font-medium text-sm transition"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                {/* Delivery Location Selection */}
                <div className="mb-4 pb-4 border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Delivery Location *
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none mb-3"
                  >
                    <option value="">-- Choose Location --</option>
                    {DELIVERY_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} ({loc.distance} km - LKR {(loc.distance * 6).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none resize-none"
                    rows={3}
                    placeholder="Enter your complete delivery address (house/building number, street, landmarks)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Delivery fee: LKR 6 per kilometer
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>LKR {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>LKR {calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Delivery Fee
                      {selectedLocation && ` (${distance} km)`}
                    </span>
                    <span className={distance > 0 ? "" : "text-gray-400"}>
                      {distance > 0 ? `LKR ${calculateDeliveryFee().toFixed(2)}` : "Select location"}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>LKR {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <Link
                  href="/"
                  className="block w-full text-center border-2 border-red-600 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
