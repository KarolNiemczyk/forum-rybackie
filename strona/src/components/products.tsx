"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Product {
  _id: number;
  name: string;
  price: number;
  image: string;
  categories?: string[];
  description?: string;
  size?: string;
  review?: number[]; // Dodanie oceny (tablica ocen)
}

interface ProductsProps {
  products: Product[];
  searchQuery: string;
  sortOrder: string;
  selectedCategory: string; // Nowy prop do filtrowania po kategorii
}

export default function Products({
  products,
  searchQuery,
  sortOrder,
  selectedCategory,
}: ProductsProps) {
  const { addToCart } = useCart(); // Użycie addToCart z kontekstu
  const router = useRouter(); // Użycie routera z Next.js

  // Filtracja po nazwie
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filtracja po kategorii
  const categoryFilteredProducts = selectedCategory
    ? filteredProducts.filter((product) =>
        product.categories?.includes(selectedCategory)
      )
    : filteredProducts;

  // Sortowanie produktów
  const sortedProducts = categoryFilteredProducts.sort((a, b) => {
    if (sortOrder === "priceAsc") return a.price - b.price;
    if (sortOrder === "priceDesc") return b.price - a.price;
    if (sortOrder === "sizeAsc") {
      return parseFloat(a.size || "0") - parseFloat(b.size || "0");
    }
    if (sortOrder === "sizeDesc") {
      return parseFloat(b.size || "0") - parseFloat(a.size || "0");
    }
    return 0;
  });

  // Funkcja obliczająca średnią ocenę
  const calculateAverageRating = (reviews: number[] = []) => {
    if (reviews.length === 0) return 0; // Jeśli brak ocen, zwróć 0
    const sum = reviews.reduce((acc, review) => acc + review, 0);
    return sum / reviews.length;
  };

  // Funkcja do przejścia do pokoju produktu
  const goToRoom = (productId: number, productName: string) => {
    const roomName = `${encodeURIComponent(productName)}`;
    const idString = productId.toString();
    router.push(`/${roomName}?id=${idString}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-screen-lg mt-10">
      {sortedProducts.map((product) => {
        // Obliczamy średnią ocenę dla wędki
        const averageRating = calculateAverageRating(product.review);

        return (
          <div
            key={product._id}
            className="relative group rounded-xl overflow-hidden hover:translate-y-1 transition-transform duration-300 border-4 border-cyan-700 bg-white shadow-lg"
          >
            <div
              onClick={() => goToRoom(product._id, product.name)}
              className="cursor-pointer"
            >
              <figure>
                <img
                  className="h-[45vh] w-full object-cover"
                  src={product.image}
                  alt={product.name}
                />
                <div className="bg-gray-100 text-center py-2 border-t-4 border-gray-600">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-lg text-gray-700">{product.price} zł</p>
                  {product.size && (
                    <p className="text-sm text-gray-500 italic">
                      Rozmiar: {product.size}m
                    </p>
                  )}
                  {product.categories && product.categories.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Kategorie: {product.categories.join(", ")}
                    </p>
                  )}

                  {/* Dodajemy wizualną reprezentację średniej oceny */}
                  <div className="mt-2 text-sm text-yellow-500">
                    {averageRating > 0 ? (
                      <span>Ocena: {averageRating.toFixed(1)} / 5</span>
                    ) : (
                      <span>Brak ocen</span>
                    )}
                  </div>
                </div>
              </figure>
            </div>
            {product.description && (
              <div className="px-4 py-2 text-gray-800">
                <p className="text-sm">{product.description}</p>
              </div>
            )}
            <button
              onClick={() => addToCart(product)} // Dodaj produkt do koszyka
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-300 text-white text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Dodaj do koszyka"
            >
              ➕
            </button>
          </div>
        );
      })}
    </div>
  );
}
