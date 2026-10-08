import "./Home.css";
import Heropage from "./components/Heropage";
import Shop_by_category from "./components/Shop_by_category";
import New_Arrival_Home from "./components/New_Arrival_Home";
import HomepageProductSection from "./components/HomepageProductSection";
import HomepageBrandSection from "./components/HomepageBrandSection";
import HomepageTrustBenefits from "./components/HomepageTrustBenefits";
import Homepage_Query from "./queries/Homepage_Query";
import Product_Query from "../sale/queries/Product_Query";
import Offer_poster from "../../hooks/offers/page/Offer_poster";
import ContactUs from "../../components/Contact";
import vedio1 from "../../assets/eehook-video-one.mp4";
import vedio2 from "../../assets/eehook-video-two.mp4";

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.items)) return value.items;
    return [];
};

const brandsFromProducts = (products) => {
    const brands = new Map();

    asArray(products).forEach((product) => {
        const brand = product?.brand;
        const id = brand?.id ?? brand?.pk;
        if (id === null || id === undefined) return;

        const current = brands.get(String(id));
        brands.set(String(id), {
            ...brand,
            id,
            product_count: (current?.product_count || 0) + 1,
        });
    });

    return [...brands.values()];
};

const withDemoFallback = (section, demoProducts) => {
    if (asArray(section).length || !demoProducts.length) return { section, isDemo: false };
    return { section: { results: demoProducts }, isDemo: true };
};

function HomeLoading() {
    return (
        <main className="homepage-discovery homepage-loading" aria-busy="true" aria-label="Loading homepage">
            <div className="homepage-loading-hero skeleton" />
            <div className="homepage-loading-section">
                <div className="skeleton skeleton-text" />
                <div className="homepage-loading-grid">{Array.from({ length: 8 }).map((_, index) => <div className="homepage-loading-card skeleton" key={index} />)}</div>
            </div>
        </main>
    );
}

function Home() {
    const { data: homepageData = {}, isLoading, isError, error, refetch } = Homepage_Query();
    const homepageBrands = asArray(homepageData.shop_by_brand);
    const { data: brandProducts } = Product_Query(
        { page_size: 100 },
        { enabled: !isLoading && !isError && homepageBrands.length === 0 }
    );
    const topDealsEmpty = asArray(homepageData.top_deals).length === 0;
    const bestSellersEmpty = asArray(homepageData.best_sellers).length === 0;
    const shouldLoadSectionDemos = import.meta.env.DEV && !isLoading && !isError && (topDealsEmpty || bestSellersEmpty);
    const { data: demoCatalog } = Product_Query(
        { page_size: 8 },
        { enabled: shouldLoadSectionDemos }
    );

    if (isLoading) return <HomeLoading />;

    if (isError) {
        return (
            <main className="homepage-discovery homepage-state" role="alert">
                <h1>We couldn&apos;t load the home page</h1>
                <p>{error?.response?.data?.detail || "Please try again in a moment."}</p>
                <button type="button" onClick={() => refetch()}>Try again</button>
            </main>
        );
    }

    const categories = asArray(homepageData.categories);
    const heroBanners = asArray(homepageData.hero_banners);
    const newArrivals = homepageData.new_arrivals;
    const trendingNow = homepageData.trending_now;
    const topDeals = homepageData.top_deals;
    const bestSellers = homepageData.best_sellers;
    const justForYou = homepageData.just_for_you;
    const recentlyViewed = homepageData.recently_viewed;
    const shopByBrand = homepageBrands.length ? homepageBrands : brandsFromProducts(brandProducts);
    const demoProducts = asArray(demoCatalog);
    const topDealsDisplay = withDemoFallback(topDeals, demoProducts);
    const bestSellersDisplay = withDemoFallback(bestSellers, demoProducts.slice().reverse());

    return (
        <main className="homepage-discovery">
            <Heropage heroBanners={heroBanners} />

            {categories.length > 0 && (
                <div className="category-section-wrapper" style={{ background: "#F8F9F3", padding: "15px 15px 45px" }}>
                    <Shop_by_category categories={categories} />
                </div>
            )}

            <New_Arrival_Home products={asArray(newArrivals)} totalCount={newArrivals?.count} showNewBadge />
            <Offer_poster />
            <HomepageProductSection title="Trending now" eyebrow="Popular right now" section={trendingNow} />
            <HomepageProductSection title="Top deals" eyebrow={topDealsDisplay.isDemo ? "Demo preview · Best value" : "Best value"} section={topDealsDisplay.section} />
            <HomepageProductSection title="Best sellers" eyebrow={bestSellersDisplay.isDemo ? "Demo preview · Customer favourites" : "Customer favourites"} section={bestSellersDisplay.section} />
            <HomepageProductSection title="Just for you" eyebrow="Picked for your next find" section={justForYou} />

            <HomepageBrandSection brands={shopByBrand} />

            <HomepageProductSection title="Recently viewed" eyebrow="Pick up where you left off" section={recentlyViewed} />

            <HomepageTrustBenefits benefits={asArray(homepageData.trust_benefits)} />

            <section className="section-heritage">
                <div className="section-heritage-text">
                    <span className="heritage-tag">OUR PROMISE</span>
                    <h2>Innovation Meets Premium Lifestyle</h2>
                    <p>At eehook, every product is selected with a focus on quality, performance, and modern design. From powerful electronics to top-tier cosmetics, our collections are thoughtfully curated for customers who value excellence.</p>
                    <p>Blending the latest tech trends with lifestyle essentials, we create a shopping experience that elevates your everyday life.</p>
                </div>

                <div className="section-heritage-gallery">
                    <video className="heritage-video" autoPlay muted loop playsInline>
                        <source src={vedio1} type="video/mp4" />
                    </video>
                    <video className="heritage-video" autoPlay muted loop playsInline>
                        <source src={vedio2} type="video/mp4" />
                    </video>
                </div>
            </section>

            <ContactUs />
        </main>
    );
}

export default Home;
