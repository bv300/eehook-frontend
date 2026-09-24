

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { GetcartProduct } from '../api/Cart_api'

function Cart_query() {
    return useQuery({
        queryKey : ['cartProduct'],
        queryFn :GetcartProduct
    })
}

export default Cart_query
