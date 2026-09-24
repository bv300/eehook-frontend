import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../lib/ApiClient";
import "../style/Checkout.css";
import { getImageUrl } from "../../../utils/imageUrl";

const Checkout = () => {

    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [cartSummary, setCartSummary] = useState({
        subtotal: 0,
        shipping: 0,
        total: 0,
        discount: 0,
    });

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {

        loadCheckout();

    }, []);

    const loadCheckout = async () => {

        await Promise.all([
            fetchAddresses(),
            fetchCart()
        ]);

        setLoading(false);

    };

    const fetchAddresses = async () => {

        try {

            const response = await client.get("addresses/");

            setAddresses(response.data);

            if (response.data.length > 0) {

                setSelectedAddress(response.data[0].id);

            }

        } catch (error) {

            console.log(error);

        }

    };

    const fetchCart = async () => {

        try {

            const response = await client.get("cart/");

            setCartItems(response.data.items || []);

            setCartSummary({
                subtotal: Number(response.data.subtotal || 0),
                shipping: Number(response.data.shipping || 0),
                total: Number(response.data.total || 0),
                discount: Number(response.data.discount || 0),
            });

        } catch (error) {

            console.log(error);

        }

    };

    const proceedToPayment = async () => {

        if (!selectedAddress) {

            alert("Please select delivery address");

            return;

        }

        try {

            setProcessing(true);

            const response = await client.post(
                "payment/create-checkout-session/",
                {
                    address: selectedAddress
                }
            );

            window.location.href = response.data.checkout_url;

        } catch (error) {

            console.log(error);

            alert("Unable to continue payment");

            setProcessing(false);

        }

    };

    if (loading) {

        return (

            <div className="checkout-loading">

                Loading...

            </div>

        );

    }
        return (

        <div className="amora-checkout">

            <div className="amora-checkout-header">

                <h1 className="amora-checkout-title">

                    Checkout

                </h1>

                <p className="amora-checkout-subtitle">

                    Complete your purchase securely.

                </p>

            </div>

            <div className="amora-checkout-wrapper">

                <div className="amora-checkout-left">

                    <div className="amora-checkout-card">

                        <div className="amora-card-header">

                            <h2>

                                Delivery Address

                            </h2>

                            <button
                                className="amora-add-address-btn"
                                onClick={() => navigate("/profile")}
                            >

                                + Add Address

                            </button>

                        </div>

                        {

                            addresses.length === 0 ?

                                <div className="amora-empty-box">

                                    <p>

                                        No address found

                                    </p>

                                </div>

                                :

                                addresses.map((address) => (

                                    <div
                                        key={address.id}
                                        className={`amora-address-card ${
                                            selectedAddress === address.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedAddress(address.id)
                                        }
                                    >

                                        <input
                                            type="radio"
                                            checked={
                                                selectedAddress === address.id
                                            }
                                            onChange={() =>
                                                setSelectedAddress(address.id)
                                            }
                                        />

                                        <div className="amora-address-info">

                                            <h4>

                                                {address.full_name}

                                            </h4>

                                            <p>

                                                {address.phone}

                                            </p>

                                            <p>

                                                {address.address_line}

                                            </p>

                                            <p>

                                                {address.city},{" "}
                                                {address.postal_code}

                                            </p>

                                            <p>

                                                {address.country}

                                            </p>

                                        </div>

                                    </div>

                                ))

                        }

                    </div>

                    <div className="amora-checkout-card">

                        <h2>

                            Payment Method

                        </h2>

                        <div className="amora-payment-card">

                            <div className="amora-payment-title">

                                Stripe Secure Payment

                            </div>

                            <p>

                                Visa, Mastercard, Apple Pay,
                                Google Pay and other cards
                                are supported.

                            </p>

                        </div>

                    </div>

                </div>

                <div className="amora-checkout-right">

                    <div className="amora-checkout-card">

                        <h2>

                            Order Summary

                        </h2>

                        {

                            cartItems.length === 0 ?

                                <div className="amora-empty-box">

                                    <p>

                                        Your cart is empty

                                    </p>

                                </div>

                                :

                                cartItems.map((item) => (

                                    <div
                                        key={item.id}
                                        className="amora-summary-item"
                                    >

                                        <div className="amora-summary-image">

                                            <img
                                                src={getImageUrl(item.product_image)}
                                                alt={item.product_name}
                                            />

                                        </div>

                                        <div className="amora-summary-details">

                                            <h4>

                                                {item.product_name}

                                            </h4>

                                            <p>

                                                Size : {item.size}

                                            </p>

                                            <p>

                                                Color : {item.color}

                                            </p>

                                            <p>

                                                Qty : {item.quantity}

                                            </p>

                                        </div>

                                        <div className="amora-summary-price">

                                            NZD ${Number(item.total_price).toFixed(2)}

                                        </div>

                                    </div>

                                ))

                        }

                        <div className="amora-summary-total">
                                                        <div className="amora-summary-row">

                                <span>

                                    Subtotal

                                </span>

                                <span>

                                    NZD ${cartSummary.subtotal.toFixed(2)}

                                </span>

                            </div>

                            {/* <div className="amora-summary-row">

                                <span>

                                    Offer Discount

                                </span>

                                <span
                                    style={{
                                        color: "#1d9d55",
                                        fontWeight: "600",
                                    }}
                                >

                                    -₹{cartSummary.discount.toFixed(2)}

                                </span>

                            </div> */}

                            <div className="amora-summary-row">

                                <span>

                                    Shipping

                                </span>

                                <span>

                                    {
                                        cartSummary.shipping === 0
                                            ? "FREE"
                                            : `NZD $${cartSummary.shipping.toFixed(2)}`
                                    }

                                </span>

                            </div>

                            <div className="amora-summary-row">

                                <span>

                                    Tax

                                </span>

                                <span>

                                    Included

                                </span>

                            </div>

                            <div className="amora-summary-divider"></div>

                            <div className="amora-grand-total">

                                <div>

                                    <h3>

                                        Total

                                    </h3>

                                </div>

                                <h2>

                                    NZD ${cartSummary.total.toFixed(2)}

                                </h2>

                            </div>

                        </div>

                        <button
                            className="amora-checkout-btn"
                            onClick={proceedToPayment}
                            disabled={processing}
                        >

                            {

                                processing

                                    ?

                                    "Redirecting..."

                                    :

                                    "Proceed to Payment"

                            }

                        </button>

                        <p className="amora-payment-note">

                            You will be redirected securely to Stripe
                            to complete your payment.

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Checkout;