


import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { NewArrivals } from '../api/New_Arrivals'

function Newarrival_Query() {
  return useQuery({
    queryKey : ['NewArrivals'],
    queryFn : NewArrivals
  })
}

export default Newarrival_Query
