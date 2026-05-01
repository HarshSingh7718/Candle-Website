import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { BannerProvider } from './context/BannerContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';

function App() {
  return (
    <CategoryProvider>
      <ProductProvider>
        <BannerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/add" element={<AddProduct />} />
                <Route path="inventory/edit/:id" element={<EditProduct />} />
                <Route path="categories" element={<Categories />} />
                <Route path="categories/add" element={<AddCategory />} />
                <Route path="categories/edit/:id" element={<EditCategory />} />
                <Route path="orders" element={<Orders />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="banners" element={<Banners />} />
                <Route path="banners/add" element={<AddBanner />} />
                <Route path="banners/edit/:id" element={<EditBanner />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BannerProvider>
      </ProductProvider>
    </CategoryProvider>
  );
}

export default App;
