import React from 'react'
import './Home.css'

import vedio1 from '../../assets/eehook-video-one.mp4'

import vedio2 from '../../assets/eehook-video-two.mp4'

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
            title: "Our Vision",
            text: "Rooted in a passion for innovation, eehook represents cutting-edge technology and premium lifestyle products curated for the modern world."
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
            <div style={{ background: '#F8F8F8', padding: '45px 4% 0px' }}>
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
                            OUR PROMISE
                        </span>

                        <h2>
                            Innovation Meets Premium Lifestyle
                        </h2>

                        <p>
                            At eehook, every product is selected with a focus on quality, performance, and modern design. From powerful electronics to top-tier cosmetics, our collections are thoughtfully curated for customers who value excellence.
                        </p>

                        <p>
                            Blending the latest tech trends with lifestyle essentials, we create a shopping experience that elevates your everyday life.
                        </p>

                    </div>

                    <div className="section-heritage-gallery">

                        <video
                            className="heritage-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                        >
                            <source src={vedio1} type="video/mp4" />
                        </video>

                        <video
                            className="heritage-video"
                            autoPlay
                            muted
                            loop
                            playsInline
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
