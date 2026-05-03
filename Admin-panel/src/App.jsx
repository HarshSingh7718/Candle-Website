import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Contacts from './pages/Contacts';
import Banners from './pages/Banners';
import AddBanner from './pages/AddBanner';
import EditBanner from './pages/EditBanner';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import Options from './pages/Options';
import AddOption from './pages/AddOption';
import EditOption from './pages/EditOption';
import { BannerProvider } from './context/BannerContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { OptionProvider } from './context/OptionContext';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from 'react-hot-toast';
import OrderDetails from './pages/OrderDetails';


import { ProtectedRoutes } from "./components/ProtectedRoutes";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("adminAuthenticated");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <CategoryProvider>
        <ProductProvider>
          <BannerProvider>
            <OptionProvider>
              <BrowserRouter>
                <Routes>

                  <Route path="/" element={<PublicRoute><SignIn /></PublicRoute>} />
                  {/* === PROTECTED ROUTES === */}
                  <Route element={<ProtectedRoutes />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/inventory/add" element={<AddProduct />} />
                      <Route path="/inventory/edit/:id" element={<EditProduct />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/categories/add" element={<AddCategory />} />
                      <Route path="/categories/edit/:id" element={<EditCategory />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/banners" element={<Banners />} />
                      <Route path="/banners/add" element={<AddBanner />} />
                      <Route path="/banners/edit/:id" element={<EditBanner />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/options" element={<Options />} />
                      <Route path="/options/add" element={<AddOption />} />
                      <Route path="/options/edit/:id" element={<EditOption />} />
                    </Route>
                  </Route>
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </BrowserRouter>
            </OptionProvider>
          </BannerProvider>
        </ProductProvider>
      </CategoryProvider>
    </>
  );
}

export default App;
