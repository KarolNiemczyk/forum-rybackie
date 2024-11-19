import Link from "next/link";
import Sklep from "./sklep/page";
export default function Home() {
  return (
    <h1 className="flex columns-3 justify-between bg-woda min-w-max items-center min-h-[90vh] px-[10vw] m-0 p-0 ">
      <Link href="chat-rybakow">
        <button
          name="wedka"
          className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
        >
          <div className="bg-chat py-[30vh] px-[15vw]"></div>
          <div className="bg-white px-[15vw] py-3 border-t-4 w-max border-gray-600 ">
            Chat Rybaków
          </div>
        </button>
      </Link>

      <Link href="sklep">
        <button
          name="wedka"
          className="border-4 rounded-l w-min border-cyan-700 hover:translate-y-1 transition-transform duration-300"
        >
          <div className="bg-wedki py-[30vh] px-[15vw]"></div>
          <div className="bg-white px-[15vw] py-3 border-t-4 w-max border-gray-600">
            Sprzedaż Wędek
          </div>
        </button>
      </Link>
    </h1>
  );
}
