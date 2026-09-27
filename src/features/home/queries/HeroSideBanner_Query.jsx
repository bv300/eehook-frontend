import { useQuery } from "@tanstack/react-query";
import { getHeroSideBanner } from "../api/HeroSideBannerApi";

function HeroSideBanner_Query() {
    return useQuery({
        queryKey: ["hero-side-banner"],
        queryFn: getHeroSideBanner,
        staleTime: 1000 * 60 * 5,
    });
}

export default HeroSideBanner_Query;
