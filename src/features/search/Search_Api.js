import client from "../../../lib/ApiClient";

export const searchProducts = async (
    params = {}
) => {

    const response = await client.get(
        "/search-products/",
        {
            params
        }
    );

    return response.data;

};