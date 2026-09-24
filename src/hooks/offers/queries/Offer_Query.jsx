import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { OfferApi } from '../api/Offer_Api'

function Offer_Query() {
    return useQuery({
        queryKey:['offer_Products'],
        queryFn: OfferApi
    })
}

export default Offer_Query
