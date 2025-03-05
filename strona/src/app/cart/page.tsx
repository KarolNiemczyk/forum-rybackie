"use client";

import { useState, useReducer, useRef } from "react";
import { useCart } from "@/context/CartContext";
import Order from "@/components/order"; // Upewnij się, że masz komponent Order

// Reducer do zarządzania stanem koszyka
const cartReducer = (state: any, action: any) => {
  switch (action.type) {
    case "APPLY_DISCOUNT":
      return {
        ...state,
        discount: action.payload,
        isDiscountOn: true,
      };
    default:
      return state;
  }
};

export default function CartDetails() {
  const [isPaymentPageVisible, setIsPaymentPageVisible] = useState(false); // Stan do kontrolowania wyświetlania strony płatności
  const { cartProducts, removeFromCart } = useCart();

  const [cartState, dispatch] = useReducer(cartReducer, {
    discount: 0,
    isDiscountOn: false,
  });
  const discountCodeRef = useRef<HTMLInputElement>(null);

  const calculateTotalPrice = () => {
    const total = cartProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    return total - total * cartState.discount;
  };

  const handleApplyDiscount = () => {
    const code = discountCodeRef.current?.value.trim();
    if (code === "RABAT" && !cartState.isDiscountOn) {
      dispatch({ type: "APPLY_DISCOUNT", payload: 0.1 });
      alert("Kod rabatowy zastosowany! -10% od ceny");
    } else if (cartState.isDiscountOn) {
      alert("Kod rabatowy został już zastosowany");
    } else {
      alert("Niepoprawny kod rabatowy");
    }
  };

  const totalPrice = calculateTotalPrice();

  const handleGoToPayment = () => {
    setIsPaymentPageVisible(true);
  };

  return (
    <div>
      <section className="flex flex-col items-center gap-5 py-10 px-16 bg-woda w-full min-h-[90vh] bg-cover bg-center bg-fixed">
        <h1 className="text-4xl font-bold text-gray-700">Twój Koszyk</h1>
        {cartProducts.length === 0 ? (
          <p className="text-2xl text-gray-600">Twój koszyk jest pusty 🛒</p>
        ) : (
          <div className="w-full max-w-screen-lg">
            <div className="flex flex-col gap-4 p-4">
              {cartProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-black bg-slate-300"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 px-4">
                    <h2 className="text-xl font-bold text-gray-700">
                      {product.name}
                    </h2>
                    <p className="text-lg text-gray-600">
                      Cena: {product.price} zł
                    </p>
                    <p className="text-lg text-gray-600">
                      Ilość: {product.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-right">
              <div className="flex items-center justify-end gap-4 mb-4">
                <input
                  type="text"
                  ref={discountCodeRef}
                  placeholder="Wprowadź kod rabatowy"
                  className="px-4 py-2 border rounded-lg"
                  disabled={cartState.isDiscountOn}
                />
                <button
                  onClick={handleApplyDiscount}
                  className={`px-4 py-2 text-white rounded-lg ${
                    cartState.isDiscountOn
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={cartState.isDiscountOn}
                >
                  Zastosuj kod
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white-900">
                Łączna kwota: {totalPrice.toFixed(2)} zł
              </h2>
              <button
                onClick={handleGoToPayment}
                className="mt-4 px-6 py-2 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700"
              >
                Przejdź do płatności
              </button>
            </div>
          </div>
        )}

        {/* Modal (Order) */}
        {isPaymentPageVisible && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
              <Order cartProducts={cartProducts} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
