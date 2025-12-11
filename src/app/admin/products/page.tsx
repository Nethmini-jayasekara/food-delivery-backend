"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "Admin") {
      router.push("/");
      return;
    }
    fetchProducts(token);
  }, [router]);

  const fetchProducts = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5068/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const url = editingProduct
        ? `http://localhost:5068/api/admin/products/${editingProduct.id}`
        : "http://localhost:5068/api/admin/products";

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ name: "", description: "", price: 0, category: "", imageUrl: "" });
        setEditingProduct(null);
        fetchProducts(token!);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5068/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProducts(token!);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
    });
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔐 Admin - Products</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-600 hover:text-red-600">Dashboard</Link>
          <Link href="/admin/products" className="text-red-600 font-medium border-b-2 border-red-600">Products</Link>
          <Link href="/admin/orders" className="text-gray-600 hover:text-red-600">Orders</Link>
          <Link href="/admin/users" className="text-gray-600 hover:text-red-600">Users</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: "", description: "", price: 0, category: "", imageUrl: "" });
              setShowModal(true);
            }}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            + Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{product.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Rs.{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-black hover:text-gray-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                className="w-full px-4 py-2 border rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 border rounded"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                className="w-full px-4 py-2 border rounded"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
              <input
                type="text"
                placeholder="Category"
                className="w-full px-4 py-2 border rounded"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                className="w-full px-4 py-2 border rounded"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
