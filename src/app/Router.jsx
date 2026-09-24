import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../features/home/Home'
import Sale from '../features/sale/page/Sale'
import Single_product from '../features/single product/page/Single_product'
import Cart_page from '../features/cart/page/Cart_Page'
import Wishlist from '../features/wishlist/page/Wishlist'
import Offer_poster from '../hooks/offers/page/Offer_poster'
import OrderDashboard from '../features/Dasboard/page/OrderDashboard'
import About from '../features/About/page/About'
import Profile from '../features/Profile/page/Profile'
import Product_card from '../features/sale/components/Product_card'

import MyOrder from '../features/myOrders/page/My_orders'
import PaymentSuccess from '../features/cart/page/PaymentSuccess'
import ContactUs from '../components/Contact'

import Login from '../features/auth/page/Login'
import Signup from '../features/auth/page/SignUp'
import AdminRoute from '../features/Dasboard/page/AdminRoute'
import ForgotPassword from '../features/auth/page/ForgotPassord'
import ResetPassword from '../features/auth/page/ResetPassword'
import Checkout from '../features/cart/page/CheckOut'
import OrderDetails from '../features/Dasboard/page/AdminOrderDetails'
import Invoice from '../features/Dasboard/page/InvoicePrint'
import ProtectedRoute from '../features/auth/page/ProtectedRoute'
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
                <Route path='signup' element={<Signup />} />
                <Route path='forgot-password' element={<ForgotPassword />} />
                <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />


                <Route path="OrderDashboard" element={
                    <AdminRoute>
                        <OrderDashboard />
                    </AdminRoute>
                } />
                <Route
                    path="/orderDashboard/details/:id"
                    element={
                        <AdminRoute>
                            <OrderDetails />
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
