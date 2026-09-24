import React from 'react'
import { useQuery } from "@tanstack/react-query";
import { prodectGet } from "../api/ProductApi";

function Product_Query(filter) {

    return useQuery({

        queryKey: ["products", filter],

        queryFn: () => prodectGet(filter),
        
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export default Product_Query


