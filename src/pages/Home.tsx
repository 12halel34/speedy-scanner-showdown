
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart2, Gamepad2, Trophy } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Cashier 2000
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The ultimate supermarket scanning challenge!
          </p>
          <Link to="/play">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105"
            >
              <Gamepad2 className="mr-2" size={24} />
              Start Playing
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast-Paced Action</h3>
            <p className="text-gray-600">
              Scan items quickly and accurately to become the best cashier!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compete</h3>
            <p className="text-gray-600">
              Beat your high score and climb to the top of the leaderboard!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your performance and improve your scanning skills!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
