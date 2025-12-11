"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// Navbar and Footer are provided by the root layout; don't render them here to avoid duplicates
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

const categories = [
  { id: "all", name: "All Items", emoji: "🍽️" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "salads", name: "Salads", emoji: "🥗" },
  { id: "pasta", name: "Pasta", emoji: "🍝" },
  { id: "mexican", name: "Mexican", emoji: "🌮" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
];

export default function MenuPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update selected category when URL changes
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5068/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const inStockCount = filteredProducts.filter((p) => p.inStock).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 80px)" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-xl text-red-100">
            Discover our delicious selection of fresh, quality meals
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-2xl mx-auto block px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-600 outline-none text-lg"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {categories.find((c) => c.id === selectedCategory)?.name || "All Items"}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} items found • {inStockCount} available
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard 
                  id={product.id.toString()}
                  name={product.name}
                  price={product.price}
                  image={product.imageUrl}
                  description={product.description}
                />
                {!product.inStock && (
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Items Found</h2>
            <p className="text-gray-600">
              Try a different category or search term
            </p>
          </div>
        )}
      </main>

      {/* Footer is rendered by the root layout */}
    </div>
  );
}
