
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Receipt, Barcode } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-4 text-green-600 text-lg font-semibold">Welcome to</div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
            SuperScan Express
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience the thrill of being a supermarket cashier!
          </p>
          <Link to="/play">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105"
            >
              <ShoppingCart className="mr-2" size={24} />
              Start Your Shift
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Barcode className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quick Scanning</h3>
            <p className="text-gray-600">
              Master the art of lightning-fast barcode scanning!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Handle Products</h3>
            <p className="text-gray-600">
              Process items quickly and accurately like a pro!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Supermarket Fun</h3>
            <p className="text-gray-600">
              Enjoy the excitement of managing a busy checkout lane!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
