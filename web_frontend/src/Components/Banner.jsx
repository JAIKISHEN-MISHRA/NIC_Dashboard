import React from 'react';
import Slider from 'react-slick';
import '../css/BannerSlider.css';

import banner1 from '../assets/banner1.jpg';
 import banner2 from '../assets/Banner.jpeg';
 import banner3 from "../assets/DSC_0194-1500x520-2.jpg"
// import bannerVideo from '../assets/banner3.mp4';

const BannerSlider = () => {
  const settings = {
  dots: true,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 4000,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  pauseOnHover: false,
  pauseOnFocus: false,
  pauseOnDotsHover: false,
};


  return (
    <div className="banner-slider">
      <Slider {...settings}>
        <div className="banner-slide">
          <img src={banner1} alt="Banner 1" />
        </div>
        <div className="banner-slide">
          <img src={banner2} alt="Banner 2" />
        </div>
        <div className="banner-slide">
          <img src={banner3} alt="Banner 3" />
        </div>
        {/* <div className="banner-slide video-slide">
          <video autoPlay loop muted>
            <source src={bannerVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div> */}
      </Slider>
    </div>
  );
};

export default BannerSlider;
