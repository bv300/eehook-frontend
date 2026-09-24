import React, { useState } from "react";
import "./../styles/ProductCard.css";

import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
    Wishlist_post,
    Wishlist_delete
} from "../../wishlist/api/Wishlisht_Api";

import WishlistQuery from "../../wishlist/queries/WishlistQuery";

import { getImageUrl } from "../../../utils/imageUrl";
import showToast from "../../../utils/toast";

function Product_card({
    products = [],
    isLoading,
    error
}) {



    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 14;

    const indexOfLastProduct =
        currentPage * itemsPerPage;

    const indexOfFirstProduct =
        indexOfLastProduct - itemsPerPage;

    const currentProducts =
        products.slice(
            indexOfFirstProduct,
            indexOfLastProduct
        );

    const totalPages =
        Math.ceil(
            products.length / itemsPerPage
        );

    const getPageNumbers = () => {

        if (totalPages <= 5) {

            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );

        }

        if (currentPage <= 3) {

            return [
                1,
                2,
                3,
                "...",
                totalPages
            ];

        }

        if (currentPage >= totalPages - 2) {

            return [
                1,
                "...",
                totalPages - 2,
                totalPages - 1,
                totalPages
            ];

        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages
        ];

    };

    const {
        data: wishdata = [],
        refetch
    } = WishlistQuery();

    const addTowislist = async (
        product,
        e
    ) => {

        e.stopPropagation();

        try {

            const firstVariant =
                product.variants?.[0];

            const firstVariantSize =
                firstVariant?.sizes?.[0];

            if (
                !firstVariant ||
                !firstVariantSize
            ) {

                showToast.error(
                    "Variant not available"
                );

                return;

            }

            const wishlistItem =
                wishdata.find(
                    item =>
                        item.variant_size ===
                        firstVariantSize.id
                );

            if (wishlistItem) {

                await Wishlist_delete(
                    wishlistItem.id
                );

                await refetch();

                showToast.success(
                    "Product removed from wishlist"
                );

                return;

            }

            await Wishlist_post({

                variant:
                    firstVariant.id,

                variant_size:
                    firstVariantSize.id

            });

            await refetch();

            showToast.success(
                "Product added to wishlist"
            );

        }

        catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    if (isLoading) {

        return (
            <h2 className="loading-state">
                Loading Products...
            </h2>
        );

    }

    if (error) {

        return (
            <h2 className="error-state">
                Something went wrong.
            </h2>
        );

    }

    if (!products || products.length === 0) {

        return (
            <h2 className="error-state">
                No Products Found.
            </h2>
        );

    } return (

        <div className="catalog-container">

            <section
                className={`products ${products.length <= 3
                    ? "shop-few-products"
                    : "shop-many-products"
                    }`}
            >

                {

                    currentProducts.length > 0 ? (

                        currentProducts.map(

                            (product) => {

                                const firstVariant =
                                    product.variants?.[0];

                                const firstVariantSize =
                                    firstVariant?.sizes?.[0];

                                const wishlistItem =
                                    wishdata.find(
                                        item =>
                                            item.variant_size ===
                                            firstVariantSize?.id
                                    );

                                const isWishlisted =
                                    !!wishlistItem;

                                const primaryImageRelative =
                                    firstVariant?.images?.find(
                                        img =>
                                            img.is_primary
                                    )?.image;

                                const primaryImage =
                                    primaryImageRelative
                                        ? getImageUrl(
                                            primaryImageRelative
                                        )
                                        : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600";

                                const startingPrice =
                                    product.starting_price;

                                const discountedPrice =
                                    product.discounted_price;

                                const hasOffer =
                                    product.has_offer;

                                const discountPercentage =
                                    product.discount_percentage;

                                return (

                                    <div
                                        className="product_card"
                                        key={product.id}
                                        onClick={() =>
                                            navigate(
                                                `/single/${product.id}`
                                            )
                                        }
                                    >

                                        <div className="product_img">

                                            <button
                                                className={`favorite_btn ${isWishlisted
                                                    ? "active"
                                                    : ""
                                                    }`}
                                                onClick={(e) =>
                                                    addTowislist(
                                                        product,
                                                        e
                                                    )
                                                }
                                                aria-label="Wishlist"
                                            >

                                                <FaHeart />

                                            </button>

                                            {

                                                hasOffer && (

                                                    <div className="offer-badge">

                                                        {discountPercentage}% OFF

                                                    </div>

                                                )

                                            }

                                            <img
                                                src={primaryImage}
                                                alt={product.name}
                                            />

                                            <button className="quick-add-bar">

                                                VIEW PRODUCT

                                            </button>

                                        </div>

                                        <div className="product_info">

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}
                                            >

                                                <span className="product-category">

                                                    {
                                                        product.category?.name ||
                                                        "Premium Wear"
                                                    }

                                                </span>

                                            </div>

                                            <h3 className="product-title">

                                                {product.name}

                                            </h3>

                                            <div className="product-footer">

                                                {

                                                    hasOffer ? (

                                                        <div className="price-box">

                                                            <span className="old-price">

                                                                NZD $

                                                                {
                                                                    Number(
                                                                        startingPrice
                                                                    ).toFixed(2)
                                                                }

                                                            </span>

                                                            <span className="new-price">

                                                                NZD $

                                                                {
                                                                    Number(
                                                                        discountedPrice
                                                                    ).toFixed(2)
                                                                }

                                                            </span>

                                                        </div>

                                                    ) : (

                                                        <span className="price">

                                                            {

                                                                startingPrice

                                                                    ? `NZD $${Number(
                                                                        startingPrice
                                                                    ).toFixed(2)}`

                                                                    : "Price unavailable"

                                                            }

                                                        </span>

                                                    )

                                                }

                                            </div>

                                        </div>

                                    </div>

                                );

                            }

                        )

                    ) : (

                        <div className="no-products">

                            Products Loading....

                        </div>

                    )

                }

            </section>
            {
                totalPages > 1 && (

                    <div className="pagination-wrapper">

                        <div className="numbers">

                            {/* PREVIOUS */}

                            <div
                                className={`page-num pagination-arrow ${currentPage === 1 ? "disabled" : ""
                                    }`}
                                onClick={() => {

                                    if (currentPage > 1) {

                                        setCurrentPage(
                                            currentPage - 1
                                        );

                                    }

                                }}
                            >
                                ‹
                            </div>


                            {/* PAGE NUMBERS */}

                            {
                                getPageNumbers().map(
                                    (number, index) => (

                                        number === "..." ? (

                                            <div
                                                key={`dots-${index}`}
                                                className="page-dots"
                                            >
                                                ...
                                            </div>

                                        ) : (

                                            <div
                                                key={number}

                                                onClick={() =>
                                                    setCurrentPage(number)
                                                }

                                                className={`page-num ${currentPage === number
                                                        ? "active"
                                                        : ""
                                                    }`}
                                            >
                                                {number}
                                            </div>

                                        )

                                    )
                                )
                            }


                            {/* NEXT */}

                            <div
                                className={`page-num pagination-arrow ${currentPage === totalPages
                                        ? "disabled"
                                        : ""
                                    }`}
                                onClick={() => {

                                    if (
                                        currentPage < totalPages
                                    ) {

                                        setCurrentPage(
                                            currentPage + 1
                                        );

                                    }

                                }}
                            >
                                ›
                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default Product_card;