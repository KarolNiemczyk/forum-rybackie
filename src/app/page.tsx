import Link from "next/link";
import Sklep from "./sklep/page";
export default function Home() {
  return (
    <h1 className="flex columns-3 justify-between bg-woda items-center min-h-[90vh] px-48 m-0 p-0 overflow-hidden">
      <button
        name="wedka"
        className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
      >
        <div className="bg-chat py-28 pt-44"></div>
        <div className="bg-white px-20 py-3 border-t-4 w-max border-gray-600 ">
          Chat Rybaków
        </div>
      </button>
      <button
        name="wedka"
        className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
      >
        <div className="bg-lowiska py-28 pt-44"></div>
        <div className="bg-white px-20 py-3 border-t-4 w-max border-gray-600">
          Legalne Łowiska
        </div>
      </button>
      <Link href="sklep">
        <button
          name="wedka"
          className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
        >
          <div className="bg-wedki py-28 pt-44"></div>
          <div className="bg-white px-20 py-3 border-t-4 w-max border-gray-600">
            Sprzedaż Wędek
          </div>
        </button>
      </Link>
    </h1>
  );
}
