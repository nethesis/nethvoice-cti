import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface SliderCarouselProps {
  cards: any
}

const SliderCarousel: React.FC<SliderCarouselProps> = ({ cards }) => {
  const spacedCards = cards.map((card: any, index: any) => (
    <div key={index} className=''>
      {card}
    </div>
  ))

  const settings = {
    className: 'pl-5',
    centerMode: false,
    // centerMode: true,
    centerPadding: '10px',
    slidesToShow: 3,
    speed: 500,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    infinite: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 780,
        settings: {
          arrows: true,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          arrows: true,
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 320,
        settings: {
          arrows: true,
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <Slider {...settings} 
    //
    variableWidth={true} adaptiveHeight={true}
    //
    >
      {spacedCards}
    </Slider>
  )
}

export default SliderCarousel
