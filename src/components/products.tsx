"use client";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductsProps {
  products: Product[];
  searchQuery: string;
  sortOrder: string;
}

export default function Products({
  products,
  searchQuery,
  sortOrder,
}: ProductsProps) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery)
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortOrder === "priceAsc") return a.price - b.price;
    if (sortOrder === "priceDesc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-screen-lg mt-10">
      {sortedProducts.map((product) => (
        <Link
          key={product.id}
          className="rounded-xl overflow-hidden hover:translate-y-1 transition-transform duration-300 border-4 border-cyan-700"
          href="/sklep"
        >
          <figure>
            <img
              className="h-[45vh] w-full object-cover"
              src={product.image}
              alt={product.name}
            />
            <div className="bg-white text-center py-2 border-t-4 border-gray-600">
              {product.name} - {product.price}zł
            </div>
          </figure>
        </Link>
      ))}
    </div>
  );
}
