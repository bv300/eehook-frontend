import React, { useRef, useState, useEffect } from "react";
import ShopBy_categoryQuery from "../../shop_by_category/queries/ShopBy_categoryQuery";
import "../styles/ShopBy-category.css";


import specialOffer from '../../../assets/specialOffer-image.jpg'

import { useNavigate } from "react-router-dom";
import Offer_Query from "../../../hooks/offers/queries/Offer_Query";
import { RiArrowUpWideLine } from "react-icons/ri";
import { getImageUrl } from "../../../utils/imageUrl";
function Shop_by_category() {

    const { data: categories = [], isLoading } = ShopBy_categoryQuery();

    const navigate = useNavigate();


    const categorySliderRef = useRef(null);
    const subCategorySliderRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [closing, setClosing] = useState(false);


    const closeSubCategory = () => {
        setClosing(true);

        setTimeout(() => {
            setSelectedCategory(null);
            setClosing(false);
        }, 300);
    };

    const [categoryArrow, setCategoryArrow] = useState({
        left: false,
        right: true
    });


    const [subCategoryArrow, setSubCategoryArrow] = useState({
        left: false,
        right: true
    });

    const checkCategoryScroll = () => {

        const container = categorySliderRef.current;

        if (!container) return;

        const hasScroll =
            container.scrollWidth > container.clientWidth + 5;

        const newLeft =
            hasScroll &&
            container.scrollLeft > 5;

        const newRight =
            hasScroll &&
            container.scrollLeft + container.clientWidth <
            container.scrollWidth - 5;


        setCategoryArrow((previous) => {

            if (
                previous.left === newLeft &&
                previous.right === newRight
            ) {
                return previous;
            }

            return {
                left: newLeft,
                right: newRight
            };

        });

    };

    const checkSubCategoryScroll = () => {

        const container = subCategorySliderRef.current;

        if (!container) return;

        const hasScroll =
            container.scrollWidth > container.clientWidth + 5;

        const newLeft =
            hasScroll &&
            container.scrollLeft > 5;

        const newRight =
            hasScroll &&
            container.scrollLeft + container.clientWidth <
            container.scrollWidth - 5;


        setSubCategoryArrow((previous) => {

            if (
                previous.left === newLeft &&
                previous.right === newRight
            ) {
                return previous;
            }

            return {
                left: newLeft,
                right: newRight
            };

        });

    };


    // const { data: offers = [] } = Offer_Query();
    // const offerActive = offers?.[0]?.is_active ?? false;

    const { data: offerAvail = [] } = Offer_Query()

    const offerAvailable = offerAvail.length >= 1;

    const offerCard = {
        id: "offer-id",
        name: "OFFERS",
        image: specialOffer,
        type: "offer"
    };



    const filteredCategories = categories.filter(
        (category) => category.subcategories?.length > 0
    );

    const categoryItems = offerAvailable ? [...filteredCategories, offerCard] : filteredCategories;



    useEffect(() => {

        checkCategoryScroll();
        const category =
            categorySliderRef.current;
        category?.addEventListener(
            "scroll",
            checkCategoryScroll
        );
        return () => {
            category?.removeEventListener(
                "scroll",
                checkCategoryScroll
            );
        }
    }, [categories]);


    useEffect(() => {
        checkSubCategoryScroll();
        const sub = subCategorySliderRef.current;
        sub?.addEventListener(
            "scroll",
            checkSubCategoryScroll
        );

        return () => {
            sub?.removeEventListener(
                "scroll",
                checkSubCategoryScroll
            );
        }

    }, [selectedCategory]);

    const scrollCategory = (direction) => {

        const container =
            categorySliderRef.current;
        if (!container) return;
        container.scrollBy({
            left:
                direction === "right"
                    ? 250
                    : -250,

            behavior: "smooth"
        });

    };

    const scrollSubCategory = (direction) => {
        const container =
            subCategorySliderRef.current;
        if (!container) return;

        container.scrollBy({
            left:
                direction === "right"
                    ? 250
                    : -250,

            behavior: "smooth"
        });

    };

    const selectCategory = (category) => {

        if (category.type === "offer") {
            navigate("/shop?offer=true");
            return;
        }

        setSelectedCategory(category);

        setTimeout(() => {
            checkSubCategoryScroll();
        }, 100);

    };

    if (isLoading) {
        return <p>loading...</p>
    }




    return (
        <section className="shop-category">

            <h2>
                Shop by Category
            </h2>

            <div className="divider-shop">
                <span>
                    ✦
                </span>
            </div>

            {/* CATEGORY SLIDER */}

            <div className="slider-wrapper">

                {categoryArrow.left &&
                    <button
                        className="slider-arrow left"
                        onClick={() => scrollCategory("left")}
                    >
                        ‹
                    </button>
                }


                <div
                    className="category-container"
                    ref={categorySliderRef}
                >

                    {categoryItems.map((item) => (

                        <div
                            key={item.id}
                            className={
                                `
                            category-card
                            ${selectedCategory?.id === item.id ? "active-category" : ""}`} onClick={() => selectCategory(item)} >
                            <div className="image-circle">

                                <img src={item.type === "offer" ?
                                    item.image
                                    :
                                    getImageUrl(item.image)
                                }

                                    alt={item.name}
                                />
                            </div>

                            <p>
                                {item.name}
                            </p>
                        </div>
                    ))
                    }

                </div>

                {categoryArrow.right &&
                    <button className="slider-arrow right" onClick={() => scrollCategory("right")}  >
                        ›
                    </button>
                }

            </div>

            {/* SUB CATEGORY AREA */}

            {selectedCategory &&

                <div className={`subcategory-section ${closing ? "subcategory-closing" : ""}`}>


                    <div className="subcategory-top" >
                        <div className="subcategory-top-title">
                            <h3>
                                {selectedCategory.name}
                            </h3>
                        </div>

                        <div className="subcategory-top-title-arrow" onClick={closeSubCategory}>
                            <RiArrowUpWideLine size={30} />
                        </div>
                    </div>


                    <div className="slider-wrapper">

                        {subCategoryArrow.left &&
                            <button className="slider-arrow left" onClick={() => scrollSubCategory("left")} >
                                ‹
                            </button>
                        }


                        <div className="subcategory-container" ref={subCategorySliderRef}>

                            {selectedCategory.subcategories?.map(
                                (item) => (
                                    <div
                                        className="subcategory-card"
                                        key={item.id}
                                        onClick={() => navigate(
                                            `/shop?subcategory=${item.id}`
                                        )}
                                    >

                                        <div className="image-circle">
                                            <img src={getImageUrl(item.image)} alt={item.name} />
                                        </div>

                                        <p>
                                            {item.name}
                                        </p>
                                    </div>
                                )
                            )
                            }
                        </div>


                        {subCategoryArrow.right &&

                            <button
                                className="slider-arrow right"
                                onClick={() => scrollSubCategory("right")}
                            >
                                ›
                            </button>
                        }
                    </div>
                </div>
            }

        </section>
    );
}



export default Shop_by_category;