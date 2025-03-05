"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  cartProducts: Product[];
}

export default function Raport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    axios
      .get<Order[]>("http://localhost:5000/orders")
      .then((response) => {
        const data = response.data;
        setOrders(data);
        setFilteredOrders(data);
        calculateSummary(data);
      })
      .catch((error) => {
        console.error("Błąd pobierania zamówień:", error);
      });
  }, []);

  const calculateSummary = (orders: Order[]) => {
    const total = orders.reduce(
      (sum, order) =>
        sum +
        order.cartProducts.reduce(
          (orderSum, product) => orderSum + product.price * product.quantity,
          0
        ),
      0
    );
    setTotalRevenue(total);
    setTotalOrders(orders.length);
  };

  const revenueByProduct = orders.reduce((acc, order) => {
    order.cartProducts.forEach((product) => {
      acc[product.name] =
        (acc[product.name] || 0) + product.price * product.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const bestSellingProducts = Object.entries(revenueByProduct).sort(
    ([aProduct, aRevenue], [bProduct, bRevenue]) => bRevenue - aRevenue
  );

  const paymentMethodsStats = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageOrderValue = totalRevenue / totalOrders;

  // Filtracja zamówień
  const handleFilter = () => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        (!isNaN(fromDate.getTime()) ? orderDate >= fromDate : true) &&
        (!isNaN(toDate.getTime()) ? orderDate <= toDate : true)
      );
    });

    setFilteredOrders(filtered);
    calculateSummary(filtered);
  };

  // Wykres sprzedaży - Najlepiej sprzedające się produkty
  const salesData = {
    labels: bestSellingProducts.map(([productName]) => productName),
    datasets: [
      {
        label: "Przychód z produktów",
        data: bestSellingProducts.map(([, revenue]) => revenue),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <section className="flex flex-col items-center py-10 px-8 bg-woda w-full min-h-[90vh] bg-cover bg-center bg-fixed">
        <h1 className="text-4xl font-bold text-gray-700">
          Raporty sprzedażowe
        </h1>

        {/* Filtracja dat */}
        <div className="flex gap-4 mt-6">
          <label className="flex flex-col text-gray-700">
            Od:
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
          </label>
          <label className="flex flex-col text-gray-700">
            Do:
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
          </label>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Filtruj
          </button>
        </div>

        {/* Podsumowanie */}
        <div className="mt-10 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4">Podsumowanie</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-600">
              Łączna liczba zamówień: <strong>{totalOrders}</strong>
            </p>
            <p className="text-lg text-gray-600">
              Łączny przychód: <strong>{totalRevenue.toFixed(2)} zł</strong>
            </p>
            <p className="text-lg text-gray-600">
              Średnia wartość zamówienia:{" "}
              <strong>{averageOrderValue.toFixed(2)} zł</strong>
            </p>
          </div>
        </div>

        {/* Wykres najlepszych produktów */}
        <div className="mt-10 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Najlepiej sprzedające się produkty
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Bar data={salesData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Lista zamówień */}
        <div className="mt-10 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4">Lista zamówień</h2>
          {filteredOrders.length === 0 ? (
            <p className="text-lg text-white">
              Brak zamówień w wybranym przedziale czasowym.
            </p>
          ) : (
            <ul className="space-y-6">
              {filteredOrders.map((order) => (
                <li
                  key={order._id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-300"
                >
                  <h3 className="text-xl font-bold text-gray-700">
                    Zamówienie #{order._id}
                  </h3>
                  <p className="text-gray-600">
                    Data utworzenia:{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    Adres dostawy: {order.shippingAddress}
                  </p>
                  <p className="text-gray-600">
                    Metoda płatności: {order.paymentMethod}
                  </p>
                  <h4 className="mt-4 text-lg font-bold text-gray-700">
                    Produkty:
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {order.cartProducts.map((product) => (
                      <li
                        key={product._id}
                        className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
                      >
                        <div>
                          <h5 className="text-gray-700 font-bold">
                            {product.name}
                          </h5>
                          <p className="text-gray-600">
                            Cena: {product.price} zł | Ilość: {product.quantity}
                          </p>
                        </div>
                        <p className="text-gray-700 font-bold">
                          {product.price * product.quantity} zł
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
