
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { ShopBy_categoryGet } from '../api/ShopBy_categoryApi'

function ShopBy_categoryQuery() {
  return useQuery({
    queryKey : ['shopBycategory'],
    queryFn : ShopBy_categoryGet
  })

}

export default ShopBy_categoryQuery
