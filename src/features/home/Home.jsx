import "./Home.css";
import Heropage from "./components/Heropage";
import Shop_by_category from "./components/Shop_by_category";
import New_Arrival_Home from "./components/New_Arrival_Home";
import HomepageProductSection from "./components/HomepageProductSection";
import HomepageBrandSection from "./components/HomepageBrandSection";
import HomepageTrustBenefits from "./components/HomepageTrustBenefits";
import Homepage_Query from "./queries/Homepage_Query";
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
    const { data: homepage = {}, isLoading, isError, error, refetch } = Homepage_Query();

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

    const categories = asArray(homepage.categories);
    const heroBanners = asArray(homepage.hero_banners);
    const newArrivals = homepage.new_arrivals;
    const trendingNow = homepage.trending_now;
    const topDeals = homepage.top_deals;
    const bestSellers = homepage.best_sellers;
    const justForYou = homepage.just_for_you;
    const recentlyViewed = homepage.recently_viewed;

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
            <HomepageProductSection title="Top deals" eyebrow="Best value" section={topDeals} />
            <HomepageProductSection title="Best sellers" eyebrow="Customer favourites" section={bestSellers} />
            <HomepageProductSection title="Just for you" eyebrow="Picked for your next find" section={justForYou} />

            <HomepageBrandSection brands={asArray(homepage.shop_by_brand)} />

            <HomepageProductSection title="Recently viewed" eyebrow="Pick up where you left off" section={recentlyViewed} />

            <HomepageTrustBenefits benefits={asArray(homepage.trust_benefits)} />

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
