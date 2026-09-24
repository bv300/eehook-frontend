import client from "../../../lib/ApiClient"



export const NewArrivals =async () =>{
    try{
        const response = await client.get('new-arrivals/')
        return response.data
    }
    catch(error){
        consolelog(error)
    }
}