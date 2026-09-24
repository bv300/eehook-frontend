import React, { useEffect, useState } from 'react'
import '../styles/Sale_page.css'
import Product_card from '../components/Product_card'
import Product_Query from '../queries/Product_Query'
import { Link, NavLink, useSearchParams,useNavigate } from "react-router-dom"
import ShopBy_categoryQuery from '../../shop_by_category/queries/ShopBy_categoryQuery'
import { getImageUrl } from '../../../utils/imageUrl'

function Sale() {



    const navigate = useNavigate()
    const { data: data_filter = [] } = ShopBy_categoryQuery()

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1140)
    const [showFilter, setShowFilter] = useState(false)

    const [searchParams] = useSearchParams()

    const filter = Object.fromEntries(searchParams.entries())

    const isOfferPage = searchParams.get("offer") === "true"

    const { data, isLoading, error } = Product_Query(filter)

    // Set first category as default
    useEffect(() => {
        if (data_filter.length > 0 && !selectedCategory) {
            setSelectedCategory(data_filter[0])
        }
    }, [data_filter, selectedCategory])

    // Mobile resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1140)

            if (window.innerWidth > 1140) {
                setShowFilter(false)
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        <div className='salePage-main' >
            {/* Header */}
            <div className="page_header">
                <div className="page_head">
                    <h1 className="page_title">
                        {isOfferPage
                            ? "Special Offers"
                            : "Shop All Collections"}
                    </h1>

                    <p className="title_description">
                        {isOfferPage
                            ? "Explore our exclusive discounted products."
                            : "Explore our curated collection of premium ethnic wear."}
                    </p>
                </div>

                <div className="salepage_button">
                    {isMobile && (
                        <span
                            className="product_count"
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            {showFilter ? "Close Filter" : "Filter"}
                        </span>
                    )}

                    <span className="product_count">
                        {data?.length} Products
                    </span>
                </div>
            </div>

            {/* SHOP CATEGORY FILTER */}
            {showFilter && (
                <div className="shop_category_filter">
                    {/* Categories */}
                    <div className="shop_filter_box">
                        <h3 className="shop_filter_title">
                            Categories
                        </h3>

                        <div className="shop_category_list">
                            {data_filter.map(category => (
                                <div  key={category.id}>
                                    <button
                                       
                                        className={`shop_category_item ${selectedCategory?.id === category.id
                                            ? "shop_category_active"
                                            : ""
                                            }`}
                                        onClick={() => setSelectedCategory(category)} >

                                        {category.name}
                                    </button>

                                </div>

                            ))}


                            <div onClick={ ()=> navigate('/shop')}>
                                <div className='shop_category_item' onClick={() => setShowFilter(false)} >
                                    see all
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subcategories */}
                    <div className="shop_filter_box">
                        <h3 className="shop_filter_title">
                            Subcategories
                        </h3>

                        <div className="shop_subcategory_list">
                            {selectedCategory?.subcategories?.map(sub => (
                                <NavLink
                                    key={sub.id}
                                    className="shop_subcategory_item"
                                    to={`/shop?category=${selectedCategory.id}&subcategory=${sub.id}`}
                                    onClick={() => setShowFilter(false)}
                                >
                                    {sub.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Category Image */}
                    <div className="shop_filter_box">
                        <h3 className="shop_filter_title">
                            Preview
                        </h3>

                        <div className="shop_category_preview">
                            {selectedCategory?.image && (
                                <img
                                    src={getImageUrl(selectedCategory.image)}
                                    alt={selectedCategory.name}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* PRODUCTS */}
            <div className="shop_page">
                <div>
                    <Product_card
                        products={data || []}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div >
    )
}

export default Sale
