

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Wishlist_get } from '../api/Wishlisht_Api'

function WishlistQuery() {

    return useQuery({
        queryKey: ['wishlist'],
        queryFn: Wishlist_get
    })
}

export default WishlistQuery
