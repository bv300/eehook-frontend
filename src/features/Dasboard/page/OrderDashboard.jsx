import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import client from "../../../lib/ApiClient";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";

export default function OrderDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({});

    const [orders, setOrders] = useState([]);

    const [lowStock, setLowStock] = useState([]);

    const [wishlistProducts, setWishlistProducts] = useState([]);

    const [activeTab, setActiveTab] = useState("All Orders");

    const [search, setSearch] = useState("");

    const [sort, setSort] = useState("newest");

    const [loading, setLoading] = useState(true);

    const [orderPage, setOrderPage] = useState(1);
    const [lowStockPage, setLowStockPage] = useState(1);
    const [wishlistPage, setWishlistPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    const getDashboard = async () => {

        try {

            const res = await client.get(
                "/admin-dashboard-cards/"
            );

            setDashboard(
                res.data
            );

        }

        catch (err) {

            console.log(err);

        }

    };

    const getOrders = async () => {

        try {

            let status = "";

            if (activeTab !== "All Orders") {

                status = activeTab;

            }

            const res = await client.get(

                `/admin-orders/?search=${search}&status=${status}&sort=${sort}`

            );

            setOrders(
                res.data
            );

        }

        catch (err) {

            console.log(err);

        }

    };

    const getLowStock = async () => {

        try {

            const res = await client.get(
                "/low-stock-products/"
            );

            setLowStock(
                res.data
            );

        }

        catch (err) {

            console.log(err);

        }

    };

    const getWishlistProducts = async () => {

        try {

            const res = await client.get(
                "/wishlist-products/"
            );

            setWishlistProducts(
                res.data
            );

        }

        catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([

                getDashboard(),

                getOrders(),

                getLowStock(),

                getWishlistProducts()

            ]);

            setLoading(false);

        };

        loadData();

    }, []);

    useEffect(() => {

        setOrderPage(1);
        getOrders();

    }, [
        search,
        sort,
        activeTab
    ]);
    const API_URL = import.meta.env.VITE_API_URL;
    const handleExport = async () => {

        try {

            const response = await client.get(
                "/export-orders-csv/",
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                "orders.csv"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "Export failed:",
                error
            );

            alert("Failed to export orders.");

        }

    };

    const handleSort = (e) => {

        setSort(

            e.target.value

        );

    };

    const handleOrderAction = (id) => {

        navigate(

            `/orderDashboard/details/${id}`

        );

    };

    const orderTotalPages = Math.ceil(
        orders.length / ITEMS_PER_PAGE
    );

    const orderStartIndex =
        (orderPage - 1) * ITEMS_PER_PAGE;

    const paginatedOrders = orders.slice(
        orderStartIndex,
        orderStartIndex + ITEMS_PER_PAGE
    );


    const lowStockTotalPages = Math.ceil(
        lowStock.length / ITEMS_PER_PAGE
    );

    const lowStockStartIndex =
        (lowStockPage - 1) * ITEMS_PER_PAGE;

    const paginatedLowStock = lowStock.slice(
        lowStockStartIndex,
        lowStockStartIndex + ITEMS_PER_PAGE
    );

    const wishlistTotalPages = Math.ceil(
        wishlistProducts.length / ITEMS_PER_PAGE
    );

    const wishlistStartIndex =
        (wishlistPage - 1) * ITEMS_PER_PAGE;

    const paginatedWishlist = wishlistProducts.slice(
        wishlistStartIndex,
        wishlistStartIndex + ITEMS_PER_PAGE
    );

    const getPageNumbers = (currentPage, totalPages) => {

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

    return (

        <div className="dashboard">

            <main className="content">

                <section className="page-header">

                    <div>

                        <h1>

                            Order Management

                        </h1>

                        <p>

                            Oversee your boutique's latest transactions and logistical status.

                        </p>

                    </div>

                    <button
                        className="secondary"
                        onClick={handleExport}
                    >

                        ↓ Export List

                    </button>

                </section>

                <section className="stats">

                    <div className="stat-card">

                        <p>

                            Total Orders

                        </p>

                        <h2>

                            {dashboard.total_orders || 0}

                        </h2>

                        <span>

                            All Orders

                        </span>

                    </div>

                    <div className="stat-card">

                        <p>

                            Pending Orders

                        </p>

                        <h2>

                            {dashboard.pending_orders || 0}

                        </h2>

                        <span>

                            Waiting for Action

                        </span>

                    </div>

                    <div className="stat-card">

                        <p>

                            Shipped Orders

                        </p>

                        <h2>

                            {dashboard.shipped_orders || 0}

                        </h2>

                        <span>

                            In Transit

                        </span>

                    </div>

                    <div className="stat-card">

                        <p>

                            Revenue

                        </p>

                        <h2>

                            NZ$

                            {

                                dashboard.revenue || 0

                            }

                        </h2>

                        <span>

                            Paid Orders

                        </span>

                    </div>

                </section>

                <section className="orders-box">

                    <div className="tabs">
                        <div className="tabs">

                            {

                                [

                                    "All Orders",

                                    "Pending",

                                    "Processing",

                                    "Shipped",

                                    "Delivered",

                                    "Cancelled"

                                ].map((tab) => (

                                    <button
                                        key={tab}
                                        className={
                                            activeTab === tab
                                                ? "tab-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setActiveTab(tab)
                                        }
                                    >

                                        {tab}

                                    </button>

                                ))

                            }

                            <input
                                type="text"
                                className="order-search"
                                placeholder="Search Order ID / Customer"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <select
                                value={sort}
                                onChange={handleSort}
                            >

                                <option value="newest">

                                    Newest

                                </option>

                                <option value="oldest">

                                    Oldest

                                </option>

                                <option value="high_amount">

                                    Highest Amount

                                </option>

                                <option value="low_amount">

                                    Lowest Amount

                                </option>

                            </select>

                        </div>

                        <table>

                            <thead>

                                <tr>

                                    <th>ORDER ID</th>

                                    <th>CUSTOMER</th>

                                    <th>DATE</th>

                                    <th>AMOUNT</th>

                                    <th>STATUS</th>

                                    <th>ACTION</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    loading

                                        ?

                                        (

                                            <tr>

                                                <td
                                                    colSpan="6"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "40px"
                                                    }}
                                                >

                                                    Loading...

                                                </td>

                                            </tr>

                                        )

                                        :

                                        orders.length === 0

                                            ?

                                            (

                                                <tr>

                                                    <td
                                                        colSpan="6"
                                                        style={{
                                                            textAlign: "center",
                                                            padding: "40px"
                                                        }}
                                                    >

                                                        No Orders Found

                                                    </td>

                                                </tr>

                                            )

                                            :

                                            paginatedOrders.map((order) => (

                                                <tr
                                                    key={order.id}
                                                >

                                                    <td>

                                                        <strong>

                                                            {`ORD-${String(order.id).padStart(3, "0")}`}

                                                        </strong>

                                                    </td>

                                                    <td className="customer">

                                                        <div>

                                                            {

                                                                order.customer_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()

                                                            }

                                                        </div>

                                                        <section>

                                                            {

                                                                order.customer_name

                                                            }

                                                            <small>

                                                                {

                                                                    order.customer_email

                                                                }

                                                            </small>

                                                        </section>

                                                    </td>

                                                    <td>

                                                        {

                                                            new Date(

                                                                order.created_at

                                                            ).toLocaleDateString()

                                                        }

                                                    </td>

                                                    <td>

                                                        <strong>

                                                            NZ$

                                                            {

                                                                order.total_amount

                                                            }

                                                        </strong>

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`status ${order.status}`}
                                                        >

                                                            {order.status}

                                                        </span>

                                                    </td>

                                                    <td>

                                                        <button
                                                            className="admin-view-btn"
                                                            onClick={() =>
                                                                handleOrderAction(
                                                                    order.id
                                                                )
                                                            }
                                                        >

                                                            👁

                                                        </button>

                                                    </td>

                                                </tr>

                                            ))

                                }

                            </tbody>

                        </table>
                        <div className="pagination">

                            <span>
                                Showing {
                                    orders.length === 0
                                        ? 0
                                        : orderStartIndex + 1
                                } - {
                                    Math.min(
                                        orderStartIndex + ITEMS_PER_PAGE,
                                        orders.length
                                    )
                                } of {orders.length} Orders
                            </span>

                            <div>

                                <button
                                    disabled={orderPage === 1}
                                    onClick={() =>
                                        setOrderPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                >
                                    ‹
                                </button>

                                {getPageNumbers(
                                    orderPage,
                                    orderTotalPages
                                ).map((page, index) => (

                                    page === "..." ? (

                                        <span
                                            className="pagination-dots"
                                            key={`dots-${index}`}
                                        >
                                            ...
                                        </span>

                                    ) : (

                                        <button
                                            key={page}
                                            className={
                                                orderPage === page
                                                    ? "page-active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setOrderPage(page)
                                            }
                                        >
                                            {page}
                                        </button>

                                    )

                                ))}

                                <button
                                    disabled={
                                        orderPage === orderTotalPages ||
                                        orderTotalPages === 0
                                    }
                                    onClick={() =>
                                        setOrderPage((prev) =>
                                            Math.min(
                                                prev + 1,
                                                orderTotalPages
                                            )
                                        )
                                    }
                                >
                                    ›
                                </button>

                            </div>

                        </div>
                    </div>

                </section>

                <section className="low-stock-box">

                    <div className="low-stock-header">

                        <h2>

                            Low Stock Products

                        </h2>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>PRODUCT</th>

                                <th>CATEGORY</th>

                                <th>COLOR</th>

                                <th>SIZE</th>

                                <th>STOCK</th>

                                <th>STATUS</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                lowStock.length === 0

                                    ?

                                    (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "35px"
                                                }}
                                            >

                                                No Low Stock Products

                                            </td>

                                        </tr>

                                    )

                                    :

                                    paginatedLowStock.map((item) => (

                                        <tr key={item.id}>

                                            <td>
                                                <strong>
                                                    {item.product_name}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.category || "—"}
                                            </td>

                                            <td>
                                                {item.color || "—"}
                                            </td>

                                            <td>
                                                {item.size || "—"}
                                            </td>

                                            <td>
                                                {item.stock}
                                            </td>

                                            <td>

                                                <span className="stock-low">
                                                    Low Stock
                                                </span>

                                            </td>

                                        </tr>

                                    ))

                            }

                        </tbody>

                    </table>
                    <div className="pagination">

                        <span>
                            Showing {
                                lowStock.length === 0
                                    ? 0
                                    : lowStockStartIndex + 1
                            } - {
                                Math.min(
                                    lowStockStartIndex + ITEMS_PER_PAGE,
                                    lowStock.length
                                )
                            } of {lowStock.length} Products
                        </span>

                        <div>

                            <button
                                disabled={lowStockPage === 1}
                                onClick={() =>
                                    setLowStockPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                            >
                                ‹
                            </button>

                            {getPageNumbers(
                                lowStockPage,
                                lowStockTotalPages
                            ).map((page, index) => (

                                page === "..." ? (

                                    <span
                                        className="pagination-dots"
                                        key={`dots-${index}`}
                                    >
                                        ...
                                    </span>

                                ) : (

                                    <button
                                        key={page}
                                        className={
                                            lowStockPage === page
                                                ? "page-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setLowStockPage(page)
                                        }
                                    >
                                        {page}
                                    </button>

                                )

                            ))}

                            <button
                                disabled={
                                    lowStockPage === lowStockTotalPages ||
                                    lowStockTotalPages === 0
                                }
                                onClick={() =>
                                    setLowStockPage((prev) =>
                                        Math.min(
                                            prev + 1,
                                            lowStockTotalPages
                                        )
                                    )
                                }
                            >
                                ›
                            </button>

                        </div>

                    </div>

                </section>

                <section className="wishlist-box">

                    <div className="wishlist-header">

                        <h2>

                            Wishlist Products

                        </h2>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>IMAGE</th>

                                <th>PRODUCT</th>

                                <th>COLOR</th>

                                <th>CATEGORY</th>

                                <th>WISHLIST COUNT</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                wishlistProducts.length === 0

                                    ?

                                    (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "35px"
                                                }}
                                            >

                                                No Wishlist Products

                                            </td>

                                        </tr>

                                    )

                                    :

                                    paginatedWishlist.map((item) => (

                                        <tr key={item.variant_id}>

                                            <td>

                                                {
                                                    item.image
                                                        ?
                                                        <img
                                                            src={item.image}
                                                            alt={item.product_name}
                                                            className="wishlist-product-image"
                                                        />
                                                        :
                                                        <div className="wishlist-no-image">
                                                            No Image
                                                        </div>
                                                }

                                            </td>

                                            <td>

                                                <strong>
                                                    {item.product_name}
                                                </strong>

                                            </td>

                                            <td>

                                                {item.color || "—"}

                                            </td>

                                            <td>

                                                {item.category || "—"}

                                            </td>

                                            <td>

                                                <span className="wishlist-count">
                                                    {item.wishlist_count}
                                                </span>

                                            </td>

                                        </tr>

                                    ))

                            }

                        </tbody>

                    </table>
                    <div className="pagination">

                        <span>
                            Showing {
                                wishlistProducts.length === 0
                                    ? 0
                                    : wishlistStartIndex + 1
                            } - {
                                Math.min(
                                    wishlistStartIndex + ITEMS_PER_PAGE,
                                    wishlistProducts.length
                                )
                            } of {wishlistProducts.length} Products
                        </span>

                        <div>

                            <button
                                disabled={wishlistPage === 1}
                                onClick={() =>
                                    setWishlistPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                            >
                                ‹
                            </button>

                            {getPageNumbers(
                                wishlistPage,
                                wishlistTotalPages
                            ).map((page, index) => (

                                page === "..." ? (

                                    <span
                                        className="pagination-dots"
                                        key={`dots-${index}`}
                                    >
                                        ...
                                    </span>

                                ) : (

                                    <button
                                        key={page}
                                        className={
                                            wishlistPage === page
                                                ? "page-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setWishlistPage(page)
                                        }
                                    >
                                        {page}
                                    </button>

                                )

                            ))}

                            <button
                                disabled={
                                    wishlistPage === wishlistTotalPages ||
                                    wishlistTotalPages === 0
                                }
                                onClick={() =>
                                    setWishlistPage((prev) =>
                                        Math.min(
                                            prev + 1,
                                            wishlistTotalPages
                                        )
                                    )
                                }
                            >
                                ›
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

}