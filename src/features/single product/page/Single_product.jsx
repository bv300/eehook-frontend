import React, { useEffect, useState } from "react";
import "../style/Single_product.css";
import {
    NavLink,
    useSearchParams,
    useParams,
    useNavigate
} from "react-router-dom";
import { AiOutlineDoubleRight } from "react-icons/ai";
import GetSingle_product_Query from "../queries/GetSingle_product_Query";
import Cart_query from "../../cart/queries/Cart_query";
import { addToCart_Post } from "../api/AddToCart_Api";

import WishlistQuery from "../../wishlist/queries/WishlistQuery";
import {
    Wishlist_post,
    Wishlist_delete
} from "../../wishlist/api/Wishlisht_Api";
import showToast from "../../../utils/toast";
import { getImageUrl } from "../../../utils/imageUrl";

function Single_product() {

    const navigate = useNavigate();

    const { id } = useParams();

    

    const [searchParams] = useSearchParams();

    const variantId = Number(
        searchParams.get("variant")
    );

    const sizeId = Number(
        searchParams.get("size")
    );

    console.log("location state:", location.state);
    console.log("variantId:", variantId);
    console.log("sizeId:", sizeId);

    const {

        data = {},

        isLoading,

        error

    } = GetSingle_product_Query(id);

    console.log("Single Product :", data);

    const [selectedColor, setSelectedColor] = useState(null);

    const [selectedSize, setSelectedSize] = useState(null);

    const [activeImage, setActiveImage] = useState(null);

    const {

        data: cart = [],

        refetch: refetchCart

    } = Cart_query();

    /*
        GET UNIQUE COLORS
    */

    const colors = [

        ...new Map(

            (data?.variants || [])

                .filter(

                    variant => variant.color

                )

                .map(

                    variant => [

                        variant.color.id,

                        variant.color

                    ]

                )

        ).values()

    ];

    /*
        SELECTED COLOR VARIANT
    */

    const selectedVariant =

        data?.variants?.find(

            variant =>

                variant.color?.id === selectedColor?.id

        ) ||

        data?.variants?.[0];

    useEffect(() => {

        if (!data?.variants?.length) return;

        // User came from Cart

        if (variantId) {

            const variant = data.variants.find(

                v => v.id === variantId

            );

            if (variant) {

                setSelectedColor(

                    variant.color

                );

                const size =

                    variant.sizes.find(

                        s => s.id === sizeId

                    ) ||

                    variant.sizes[0];

                setSelectedSize(

                    size.size

                );

                const image =

                    variant.images.find(

                        img => img.is_primary

                    ) ||

                    variant.images[0];

                setActiveImage(

                    image?.image

                );

                return;

            }

        }

        // Default

        const firstVariant =

            data.variants[0];

        setSelectedColor(

            firstVariant.color

        );

        setSelectedSize(

            firstVariant.sizes?.[0]?.size || null

        );

        const image =

            firstVariant.images.find(

                img => img.is_primary

            ) ||

            firstVariant.images[0];

        setActiveImage(

            image?.image || null

        );

    }, [

        data,

        variantId,

        sizeId

    ]);

    const availableSizes =

        selectedVariant?.sizes || [];

    const selectedSizeVariant =

        selectedVariant?.sizes?.find(

            item =>

                item.size.id === selectedSize?.id

        );

    const displayImages =

        selectedVariant?.images || [];

    const addTocart = async () => {

        const token = localStorage.getItem("access");

        if (!token) {

            showToast.info("Please login to continue");

            navigate("/login");

            return;

        }

        if (!selectedColor || !selectedSize) {

            showToast.warning(
                "Please select color and size"
            );

            return;

        }

        if (!selectedSizeVariant) {

            showToast.warning(
                "This combination is not available"
            );

            return;

        }

        if (selectedSizeVariant.stock <= 0) {

            showToast.info(
                "Out of stock"
            );

            return;

        }

        const cartPayload = {

            variant: selectedVariant.id,

            variant_size: selectedSizeVariant.id,

            quantity: 1

        };

        try {

            await addToCart_Post(
                cartPayload
            );

            await refetchCart();

            showToast.success(
                "Product added to cart"
            );

        }

        catch (error) {

            console.log(error);

            if (error.response?.status === 401) {

                showToast.info(
                    "Please login to continue"
                );

                navigate("/login");

            }

        }

    };

    /*
        ADD TO WISHLIST
    */

    const {

        data: wishdata = [],

        refetch: refetchWishlist

    } = WishlistQuery();

    const addToWishlist = async () => {

        const token = localStorage.getItem("access");

        if (!token) {

            showToast.info("Please login to continue");

            navigate("/login");

            return;

        }

        if (!selectedVariant || !selectedSizeVariant) {

            showToast.warning(
                "Please select color and size"
            );

            return;

        }

        try {

            const wishlistItem = wishdata.find(
                item =>
                    item.variant_size ===
                    selectedSizeVariant.id
            );

            if (wishlistItem) {

                await Wishlist_delete(
                    wishlistItem.id
                );

                await refetchWishlist();

                showToast.success(
                    "Product removed from wishlist"
                );

                return;

            }

            await Wishlist_post({

                variant: selectedVariant.id,

                variant_size:
                    selectedSizeVariant.id

            });

            await refetchWishlist();

            showToast.success(
                "Product added to wishlist"
            );

        }

        catch (error) {

            console.log(error);

            if (error.response?.status === 401) {

                showToast.info(
                    "Please login to continue"
                );

                navigate("/login");

            }

        }

    };

    if (isLoading) return "Loading...";

    if (error) return "Something went wrong";

    const isWishlisted = wishdata.some(
        item =>
            item.variant_size ===
            selectedSizeVariant?.id
    );

    return (
        <div className="single-product-main">

            <div className="single-product-toshop">

                <div className="toshop">

                    <NavLink to="/shop">

                        Shop

                    </NavLink>

                    <AiOutlineDoubleRight />

                </div>

            </div>

            <div className="single-product">

                {/* IMAGE GALLERY */}

                <div className="gallery-section">

                    <div className="thumbs">

                        {displayImages.map((img) => (

                            <img

                                key={img.id}

                                src={getImageUrl(img.image)}

                                alt={data.name}

                                className={

                                    activeImage === img.image

                                        ? "active-thumb"

                                        : ""

                                }

                                onClick={() =>

                                    setActiveImage(

                                        img.image

                                    )

                                }

                            />

                        ))}

                    </div>

                    <div className="main-image">

                        <img

                            src={

                                activeImage

                                    ? getImageUrl(activeImage)

                                    : getImageUrl(selectedVariant?.images?.find(

                                        img => img.is_primary

                                    )?.image)

                            }

                            alt={data.name}

                        />

                    </div>

                </div>

                {/* PRODUCT DETAILS */}

                <div className="details-section">

                    <h1>

                        {data.name}

                    </h1>

                    <div className="price">

                        {
                            selectedSizeVariant?.has_offer ? (

                                <>

                                    <div className="price-row">

                                        <span className="old-price">
                                            ${Number(selectedSizeVariant?.price).toFixed(2)}
                                        </span>

                                        <span className="new-price">
                                            ${Number(selectedSizeVariant?.discounted_price).toFixed(2)}
                                        </span>

                                        <span className="discount">
                                            {selectedSizeVariant?.discount_percentage}% OFF
                                        </span>

                                    </div>

                                    <div className="offer-save">

                                        You Save $
                                        {Number(selectedSizeVariant?.discount_amount).toFixed(2)}

                                    </div>

                                </>

                            ) : (

                                <div className="new-price">

                                    ${Number(selectedSizeVariant?.price).toFixed(2)}

                                </div>

                            )
                        }

                    </div>

                    <p className="description">

                        {data.description}

                    </p>
                    <div className="option-block">

                        <h4>

                            Color

                        </h4>

                        <div className="colors">

                            {

                                colors.map((color) => (

                                    <button

                                        key={color.id}

                                        className={

                                            selectedColor?.id === color.id

                                                ? "color active-color"

                                                : "color"

                                        }

                                        style={{

                                            background: color.code

                                        }}

                                        title={color.name}

                                        onClick={() => {

                                            const variant =

                                                data.variants.find(

                                                    item =>

                                                        item.color?.id === color.id

                                                );

                                            setSelectedColor(

                                                color

                                            );

                                            setSelectedSize(

                                                variant?.sizes?.[0]?.size || null

                                            );

                                            const image =

                                                variant?.images?.find(

                                                    img => img.is_primary

                                                ) ||

                                                variant?.images?.[0];

                                            setActiveImage(

                                                image?.image || null

                                            );

                                        }}

                                    />

                                ))

                            }

                        </div>

                    </div>

                    <div className="option-block">

                        <h4>

                            Size

                        </h4>

                        <div className="sizes">

                            {

                                availableSizes.map((item) => (

                                    <button

                                        key={item.id}

                                        className={

                                            selectedSize?.id === item.size.id

                                                ? "size-btn active-size"

                                                : "size-btn"

                                        }

                                        onClick={() =>

                                            setSelectedSize(

                                                item.size

                                            )

                                        }

                                    >

                                        {item.size.name}

                                    </button>

                                ))

                            }

                        </div>

                    </div>

                    {

                        selectedSizeVariant?.stock <= 0 ? (

                            <div className="stock-out">

                                Out of Stock

                            </div>

                        ) : (

                            <div className="stock">

                                Stock :

                                {

                                    selectedSizeVariant?.stock

                                }

                            </div>

                        )

                    }
                    <div className="sigle_product_cart-buy">

                        <button

                            className="cart-btn"

                            onClick={addTocart}

                        >

                            Add to Cart

                        </button>

                        <button
                            className="buy-btn"
                            onClick={addToWishlist}
                        >
                            {
                                isWishlisted
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Single_product;