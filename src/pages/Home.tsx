
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Receipt, Barcode, LogIn, User, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
            קופאית 2000
          </h1>
          <div className="flex gap-2">
            <Link to="/leaderboard">
              <Button variant="outline">
                <Trophy className="mr-2" size={16} />
                לוח התוצאות
              </Button>
            </Link>
            {user ? (
              <Link to="/play">
                <Button variant="outline">
                  <User className="mr-2" size={16} />
                  לחשבון שלי
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline">
                  <LogIn className="mr-2" size={16} />
                  התחבר
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-4 text-green-600 text-lg font-semibold">ברוכים הבאים ל</div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
            קופאית 2000
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            חוו את הריגוש של קופאי/ת בסופרמרקט!
          </p>
          <Link to={user ? "/play" : "/auth"}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105"
            >
              <ShoppingCart className="mr-2" size={24} />
              {user ? 'התחל לשחק' : 'התחל את המשמרת'}
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Barcode className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">סריקה מהירה</h3>
            <p className="text-gray-600">
              שלטו באמנות הסריקה המהירה של ברקודים!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">טיפול במוצרים</h3>
            <p className="text-gray-600">
              עבדו על פריטים במהירות ובדיוק כמו מקצוענים!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">כיף בסופרמרקט</h3>
            <p className="text-gray-600">
              תהנו מהריגוש של ניהול תור עמוס בקופה!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
