import React, { useEffect, useRef, useState } from "react";
import "./../Navbar.css";
import { useLocation, NavLink, useNavigate } from "react-router-dom";

import { FaShoppingBag, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { AiOutlineDoubleRight } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

import amora from '../assets/AmoraLogo.jpeg'
import WishlistQuery from "../features/wishlist/queries/WishlistQuery.jsx";
import Offer_Query from "../hooks/offers/queries/Offer_Query.jsx";
import Cart_query from "../features/cart/queries/Cart_query.jsx";
import ShopBy_categoryQuery from "../features/shop_by_category/queries/ShopBy_categoryQuery.jsx";
import { getImageUrl } from "../utils/imageUrl.js";
function Navbar() {

    const { data = [], isLoading } = ShopBy_categoryQuery();


    const { data: offers = [] } = Offer_Query();
    const [offerActive, setOfferActive] = useState(false);

    useEffect(() => {
        const offer = offers[0];
        setOfferActive(Boolean(offer?.is_active));
    }, [offers]);



    const location = useLocation();

    const isHomePage = location.pathname === "/";
    const [showNavbar, setShowNavbar] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            setScrolled(current > 80);

            if (current > lastScrollY.current && current > 100) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            lastScrollY.current = current;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);




    const { data: wishdata = [] } = WishlistQuery();
    const wishLength = wishdata.length;
    const { data: cart = {} } = Cart_query();

const cartLength = cart.total_items ?? 0;

    const navlinks = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "Categories", dropdown: true },
        { name: "New Arrivals", path: "/shop?sort=new" },
        { name: "Offers", path: "/shop?offer=true", offer: offerActive },
        { name: "About", path: "/about" },
    ];

    const [menuOpen, setMenuOpen] = useState(false);

    const [categoryOpen, setCategoryOpen] = useState(false);

    // shop dropdown 
    const [showMega, setShowMega] = useState(false);

    const [activeCategory, setActiveCategory] = useState(null);
    useEffect(() => {
        if (data.length > 0 && !activeCategory) {
            setActiveCategory(data[0]);
        }
    }, [data]);



    // search 
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();

    const goToSearch = () => {
        if (searchText.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchText)}`);
            setSearchOpen(false);
            setSearchText("");
        }
    };

    const handleSearch = (e) => {
        if (e.key === "Enter") {
            goToSearch();
        }
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchText("");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* Top Navigation Wrapper    ${isHomePage && !scrolled ? "transparent" : "scrolled"}*/}
            <div className={`navbar ${showNavbar ? "show" : "hide"}`}>
                <div className="nav_main">
                    <div className="nav_toggle" onClick={() => setMenuOpen(true)}>
                        <AiOutlineDoubleRight size={30} />
                    </div>

                    <div className="nav_main2">
                        <NavLink to='/' className="logo-link">
                            <img src={amora} alt="Logo" className="navbar-logo" />
                        </NavLink>

                        <div className="link_flex">
                            <ul className="navLinks">
                                {navlinks.filter((item) => item.name !== "Offers" || item.offer).map((item) =>
                                    item.dropdown ? (

                                        <li key={item.name} className="nav_item dropdown" onMouseOver={() => setShowMega(true)} onMouseLeave={() => setShowMega(false)}>
                                            <NavLink to="/shop" className="nav_link">
                                                Categories
                                            </NavLink>

                                            <div className={`mega_menu ${showMega ? "show" : ""}`} onMouseOver={() => setShowMega(true)} onMouseLeave={() => setShowMega(false)}>

                                                <div className="mega_menu_content">

                                                    {/* Category Columns */}
                                                    <div className="mega_categories">
                                                        {data.map((category) => (
                                                            <div className="mega_column" key={category.id} className="mega_column" onMouseEnter={() => setActiveCategory(category)} >

                                                                <NavLink
                                                                    to={`/shop?category=${category.id}`}
                                                                    className="mega_title"
                                                                >
                                                                    {category.name}
                                                                </NavLink>

                                                                <ul>
                                                                    {category.subcategories.map((sub) => (
                                                                        <li key={sub.id} >
                                                                            <NavLink onClick={() => setShowMega(false)}
                                                                                to={`/shop?category=${category.id}&subcategory=${sub.id}`}
                                                                                className="mega_link"
                                                                            >
                                                                                {sub.name}
                                                                            </NavLink>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Image */}
                                                    {data.length > 0 && (
                                                        <div className="mega_image">
                                                            <img
                                                                src={getImageUrl(activeCategory?.image)}
                                                                alt={activeCategory?.name}
                                                            />
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </li>

                                    ) : (
                                        <li key={item.name}>
                                            <NavLink
                                                to={item.path}
                                                className={`nav_link ${location.pathname + location.search === item.path ? "nav_link active" : "nav_link"
                                                    }`}
                                            >
                                                {item.name}
                                            </NavLink>
                                        </li>

                                    )
                                )}
                            </ul>

                            <div className="search_main">

                                <div className="search_wrapper">
                                    <input
                                        className={`nav_search_input ${searchOpen ? "open" : ""}`}
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={handleSearch}
                                    />

                                    {searchOpen && (
                                        <LuSearch
                                            size={20}
                                            className="input_search_icon"
                                            onClick={goToSearch}
                                        />
                                    )}
                                </div>


                                {searchOpen ? (
                                    <div onClick={closeSearch}><IoClose size={30} /></div>
                                ) : (
                                    <LuSearch
                                        size={30}
                                        className="nav_icon search_icon"
                                        onClick={() => setSearchOpen(true)}
                                    />

                                )}


                                <NavLink to="profile" className="mobile_bottom_item">
                                    <div className="cart">
                                        <CgProfile size={22} />
                                    </div>
                                </NavLink>

                                <NavLink to="wishlist">
                                    <div className="cart">
                                        <FaHeart size={20} className="nav_icon" />
                                        <span>{wishLength}</span>
                                    </div>
                                </NavLink>

                                <NavLink to="checkout">
                                    <div className="cart">
                                        <FaShoppingBag size={20} className="nav_icon" />
                                        <span>{cartLength}</span>
                                    </div>
                                </NavLink>

                            </div>
                        </div>
                    </div>
                </div>


                {/* searchbar dropdown under 718px */}

                {searchOpen && (
                    <div className="search_dropdown">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleSearch}
                            autoFocus
                        />
                        {searchOpen && (
                            <LuSearch
                                size={20}
                                className="input_search_icon"
                                onClick={goToSearch}
                            />
                        )}
                    </div>
                )}

            </div>


            {/* Mobile Drawer Side Menu Overlay */}
            <div className={`mobile_menu ${menuOpen ? "show" : ""}`}>
                <div className="mobile_header">
                    <NavLink to='/' className="logo-link" style={{ marginTop: '5px' }}>
                        <img src={amora} alt="Logo" className="navbar-logo" />
                    </NavLink>
                    <IoClose size={25} onClick={() => setMenuOpen(false)} />
                </div>
                <ul>
                    <li onClick={closeMenu}><NavLink to="/">HOME</NavLink></li>
                    <li onClick={closeMenu}><NavLink to="/shop">SHOP</NavLink></li>
                    <li onClick={() => setCategoryOpen(!categoryOpen)}>
                        <span>CATEGORIES</span>
                        <span>{categoryOpen ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}
                        </span>
                    </li>
                    {categoryOpen && (
                        <div className="mobile_categories">
                            {data.map((cat) => (
                                <NavLink key={cat.id} to={`/shop?category=${cat.id}`} onClick={closeMenu}>
                                    {cat.name}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {offerActive && (

                        <li onClick={closeMenu}><NavLink to="/shop?offer=true">OFFERS</NavLink></li>
                    )}

                    <li onClick={closeMenu}><NavLink to="/shop?sort=new">NEW ARRIVALS</NavLink></li>

                    <li onClick={closeMenu}><NavLink to="/about">ABOUT US</NavLink></li>
                    <li onClick={closeMenu}><NavLink to="/contact">CONTACT US</NavLink></li>
                </ul>
            </div>

            {/* ISOLATED GLOBAL MOBILE BOTTOM NAV BAR (Always locked strictly to bottom window layer) */}
            <div className="mobile_bottom">
                <NavLink to="profile" className="mobile_bottom_item">
                    <CgProfile size={22} />
                </NavLink>

                <NavLink to="/wishlist" className="mobile_bottom_item">
                    <div className="bottom_icon">
                        <FaHeart size={20} />
                        <span>{wishLength}</span>
                    </div>
                </NavLink>
                <NavLink to="/checkout" className="mobile_bottom_item">
                    <div className="bottom_icon">
                        <FaShoppingBag size={20} />
                        <span>{cartLength}</span>
                    </div>
                </NavLink>
            </div>
        </>
    );
}

export default Navbar;