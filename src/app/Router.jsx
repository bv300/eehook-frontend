import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Home from '../features/home/Home'
import Sale from '../features/sale/page/Sale'
import Single_product from '../features/single product/page/Single_product'
import Cart_page from '../features/cart/page/Cart_Page'
import Wishlist from '../features/wishlist/page/Wishlist'
import Offer_poster from '../hooks/offers/page/Offer_poster'
import OrderDashboard from '../features/Dasboard/page/OrderDashboard'
import About from '../features/About/page/About'
import Profile from '../features/Profile/page/Profile'

import MyOrder from '../features/myOrders/page/My_orders'
import PaymentSuccess from '../features/cart/page/PaymentSuccess'
import ContactUs from '../components/Contact'

import Login from '../features/auth/page/Login'
import AdminLogin from '../features/auth/page/AdminLogin'
import Signup from '../features/auth/page/SignUp'
import AdminRoute from '../features/Dasboard/page/AdminRoute'
import ForgotPassword from '../features/auth/page/ForgotPassord'
import ResetPassword from '../features/auth/page/ResetPassword'
import Checkout from '../features/cart/page/CheckOut'
import Invoice from '../features/Dasboard/page/InvoicePrint'
import ProtectedRoute from '../features/auth/page/ProtectedRoute'
import Unauthorized from '../features/auth/page/Unauthorized'
function LegacyOrderDetailsRedirect() {
    const { id } = useParams();
    return <Navigate to={`/order-dashboard/orders/${id}`} replace />;
}

function Router() {
    return (
        <div>

            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='shop' element={<Sale />} />
                <Route path='/about' element={<About />} />

                <Route path='profile' element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="/single/:id" element={<Single_product />} />

                <Route path="checkout" element={
                    <ProtectedRoute>
                        <Cart_page />
                    </ProtectedRoute>
                } />
                <Route path="wishlist" element={
                    <ProtectedRoute>
                        <Wishlist />
                    </ProtectedRoute>
                } />
                <Route path="checkoutpage" element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                } />

                <Route path="/offers" element={<Offer_poster />} />

                <Route path='myorders' element={
                    <ProtectedRoute>
                        <MyOrder />
                    </ProtectedRoute>
                } />

                <Route path='login' element={<Login />} />
                <Route path='admin-login' element={<AdminLogin />} />
                <Route path='unauthorized' element={<Unauthorized />} />
                <Route path='signup' element={<Signup />} />
                <Route path='forgot-password' element={<ForgotPassword />} />
                <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />


                <Route path="order-dashboard" element={
                    <AdminRoute>
                        <OrderDashboard />
                    </AdminRoute>
                } />
                <Route path="order-dashboard/product-variants" element={<AdminRoute><Navigate to="/order-dashboard/products" replace /></AdminRoute>} />
                <Route path="order-dashboard/product-variant-units" element={<AdminRoute><Navigate to="/order-dashboard/products" replace /></AdminRoute>} />
                <Route path="order-dashboard/product-images" element={<AdminRoute><Navigate to="/order-dashboard/products" replace /></AdminRoute>} />
                <Route path="order-dashboard/products/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/products/:id" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/products/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/hero-banners/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/hero-banners/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/promo-banners/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/promo-banners/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/hero-side-banners/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/hero-side-banners/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/coupons/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/coupons/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/coupon-usages/new" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/coupon-usages/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/:section" element={
                    <AdminRoute>
                        <OrderDashboard />
                    </AdminRoute>
                } />
                <Route path="OrderDashboard" element={<Navigate to="/order-dashboard" replace />} />
                <Route path="order-dashboard/orders/:id" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/:section/:id/view" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route path="order-dashboard/:section/:id/edit" element={<AdminRoute><OrderDashboard /></AdminRoute>} />
                <Route
                    path="/orderDashboard/details/:id"
                    element={
                        <AdminRoute>
                            <LegacyOrderDetailsRedirect />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/orderDashboard/invoice/:id"
                    element={
                        <AdminRoute>
                            <Invoice />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/payment-success"
                    element={<PaymentSuccess />}
                />
                <Route path='contact' element={<ContactUs />} />

            </Routes>

        </div>
    )
}

export default Router
