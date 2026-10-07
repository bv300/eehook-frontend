import { getImageUrl } from "../../../utils/imageUrl";

function HomepageTrustBenefits({ benefits }) {
    const visibleBenefits = Array.isArray(benefits)
        ? benefits.filter((benefit) => benefit && (benefit.title || benefit.name || benefit.description || benefit.text))
        : [];

    if (!visibleBenefits.length) return null;

    return (
        <section className="homepage-benefits" aria-labelledby="homepage-trust-benefits">
            <div className="homepage-section-heading homepage-benefits-heading">
                <div>
                    <h2 id="homepage-trust-benefits">Trust &amp; benefits</h2>
                </div>
            </div>
            <div className="homepage-benefits-grid">
                {visibleBenefits.map((benefit, index) => (
                    <article className="homepage-benefit" key={benefit.id ?? `${benefit.title || benefit.name}-${index}`}>
                        {(benefit.icon || benefit.image) && (
                            benefit.image
                                ? <img src={getImageUrl(benefit.image)} alt="" className="homepage-benefit-icon" />
                                : <span className="homepage-benefit-icon homepage-benefit-icon-text" aria-hidden="true">{benefit.icon}</span>
                        )}
                        {(benefit.title || benefit.name) && <h3>{benefit.title || benefit.name}</h3>}
                        {(benefit.description || benefit.text) && <p>{benefit.description || benefit.text}</p>}
                    </article>
                ))}
            </div>
        </section>
    );
}

export default HomepageTrustBenefits;

