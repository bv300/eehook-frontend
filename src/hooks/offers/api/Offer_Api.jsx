import client from "../../../lib/ApiClient"


export const OfferApi = async () => {
    try {
        const response = await client.get('offers/');

        return response.data
    }
    catch (error) {
        console.log(error)
    }
} 
