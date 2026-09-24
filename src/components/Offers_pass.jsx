import React from 'react'
import Offer_Query from '../hooks/offers/queries/Offer_Query'

function Offers_pass() {

  const { data } = Offer_Query()
  return (
    <div>
      <div style={{ height: '40px', background: '#fa9f26', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        offers pass as carousal
      </div>

    </div>
  )
}

export default Offers_pass
