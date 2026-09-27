import { useQuery } from "@tanstack/react-query";
import { getPromoBanners } from "../api/PromoBannersApi";

function PromoBanners_Query() {
    return useQuery({
        queryKey: ["promo-banners"],
        queryFn: getPromoBanners,
        staleTime: 1000 * 60 * 5,
    });
}

export default PromoBanners_Query;
