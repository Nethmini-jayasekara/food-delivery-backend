"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderDate: string;
  status: "Pending" | "Preparing" | "On the Way" | "Delivered" | "Cancelled";
  items: OrderItem[];
  total: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5068/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        if (data.length > 0) {
          setSelectedOrder(data[0]);
        }
      } else {
        // Silently handle failed fetch - user will see empty state
        setOrders([]);
      }
    } catch (error) {
      // Silently handle error - user will see empty state
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "On the Way":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "Cancelled":
        return "bg-black text-white border-black";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "⏳";
      case "Preparing":
        return "👨‍🍳";
      case "On the Way":
        return "🚚";
      case "Delivered":
        return "✅";
      case "Cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          /* No Orders */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start ordering your favorite meals!</p>
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.orderDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full border font-semibold text-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-gray-700">
                            {item.quantity}x {item.productName}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-gray-500 text-sm">
                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-800">LKR {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Order Details</h4>
                    
                    {/* All Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-gray-800 font-medium">
                            LKR {(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {order.status === "Delivered" && (
                        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition">
                          Reorder
                        </button>
                      )}
                      {order.status === "Pending" && (
                        <button className="flex-1 border-2 border-black text-black py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                          Cancel Order
                        </button>
                      )}
                      <button className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                        Get Help
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block text-red-600 hover:text-red-700 font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
