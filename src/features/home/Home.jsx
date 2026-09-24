import React from 'react'
import './Home.css'

import vedio1 from '../../assets/vedio1.mp4'

import vedio2 from '../../assets/vedio2.mp4'
import poster1 from '../../assets/poster1.png'
import poster2 from '../../assets/poster2.png'


import Our_speciality from './components/Our_speciality';
import Shop_by_category from './components/Shop_by_category';
import New_Arrival_Home from './components/New_Arrival_Home';
import Offer_poster from '../../hooks/offers/page/Offer_poster';
import { NavLink } from 'react-router-dom'
import Category_hooks from '../../hooks/Category_hooks'
import Offer_Query from '../../hooks/offers/queries/Offer_Query'
import Heropage from './components/Heropage'
import Navbar from '../../components/Navbar'
import ContactUs from '../../components/Contact'

function Home() {

    const sections = [
        {
            title: "Our Heritage",
            text: "Rooted in tradition and refined through generations, Amora represents timeless craftsmanship where every creation carries a story of elegance and dedication."
        }
    ];

    return (

        <div>


            {/* hero page  */}
            <div>
                <Heropage />
                {/* <HeroSlider /> */}
            </div>

            {/* our speciality  */}
            <div>
                <Our_speciality />
            </div>

            {/* category */}
            <div style={{ background: '#fff', padding: '45px 4% 0px' }}>
                <Shop_by_category />
            </div>
            {/* new arivals */}
            <div>
                <New_Arrival_Home />
            </div>


            <div>
                <section className="section-heritage">

                    <div className="section-heritage-text">

                        <span className="heritage-tag">
                            OUR HERITAGE
                        </span>

                        <h2>
                            Timeless Elegance, Crafted With Tradition
                        </h2>

                        <p>
                            At Amora, every saree tells a story of heritage, artistry, and timeless beauty. Inspired by traditional craftsmanship, our collections are thoughtfully curated for women who value elegance in every detail.
                        </p>

                        <p>
                            Blending classic techniques with modern sophistication, we create pieces that honour tradition while becoming a cherished part of today's wardrobe.
                        </p>

                    </div>

                    <div className="section-heritage-gallery">

                        <video
                            className="heritage-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={poster2}
                        >
                            <source src={vedio1} type="video/mp4" />
                        </video>

                        <video
                            className="heritage-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={poster1}
                        >
                            <source src={vedio2} type="video/mp4" />
                        </video>

                    </div>

                </section>
            </div>


            <div >
                <Offer_poster />
                
                <ContactUs />
            </div>

        </div>
    )
}

export default Home
