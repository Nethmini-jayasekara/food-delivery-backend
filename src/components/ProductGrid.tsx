import ProductCard from './ProductCard'

interface Product {
  id: string
  name: string
  price: number
  image: string
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  )
}
