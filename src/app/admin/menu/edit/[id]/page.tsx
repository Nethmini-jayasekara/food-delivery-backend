'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export default function EditMenuItem() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'Admin') {
        router.push('/login');
        return;
      }
    } catch (error) {
      router.push('/login');
      return;
    }

    fetchProduct();
  }, [router, productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5068/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
        });
      } else {
        alert('Product not found');
        router.push('/admin/menu');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5068/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: parseInt(productId),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          imageUrl: product?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        }),
      });

      if (response.ok) {
        alert('Menu item updated successfully!');
        router.push('/admin/menu');
      } else {
        const error = await response.text();
        alert(`Failed to update menu item: ${error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating menu item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/admin/menu">
            <button className="mr-4 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Menu Item</h1>
            <p className="text-gray-600 mt-2">Update menu item details</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Current Image */}
            {product.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image
                </label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Margherita Pizza"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Pizza">Pizza</option>
                <option value="Pasta">Pasta</option>
                <option value="Salads">Salads</option>
                <option value="Burgers">Burgers</option>
                <option value="Seafood">Seafood</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">LKR</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Link href="/admin/menu">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
