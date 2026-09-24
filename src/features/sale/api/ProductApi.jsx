
// import client from "../../../lib/ApiClient";


// export const prodectGet = async (filter = {}) => {

//     let response;

//     if (filter.offer === true || filter.offer === "true") {

//         response = await client.get(
//             "offer-products/"
//         );


//         return response.data.products || [];

//     }

//     response = await client.get(
//         "products/",
//         {
//             params: filter
//         }
//     );

//     return response.data;
// };

import client from "../../../lib/ApiClient";

export const prodectGet = async (filter = {}) => {

    let response;

    if (filter.offer === true || filter.offer === "true") {

        response = await client.get("offer-products/");

        return response.data.products || [];
    }

    response = await client.get(
        "search-products/",
        {
            params: filter
        }
    );

    return response.data;
};