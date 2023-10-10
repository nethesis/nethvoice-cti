import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface SliderCarouselProps {
  cards: any
  numberOfParkingNotEmpty: number
}

const SliderCarousel: React.FC<SliderCarouselProps> = ({ cards, numberOfParkingNotEmpty }) => {
  const spacedCards = cards.map((card: any, index: any) => (
    <div key={index} className=''>
      {card}
    </div>
  ))

  const numToShow = window.innerWidth > 1024 ? 4 : window.innerWidth > 780 ? 2 : 1

  const settings = {
    className: 'pl-5',
    centerMode: false,
    centerPadding: '10px',
    slidesToShow: numToShow,
    speed: 500,
    slidesToScroll: 1,
    arrows: numToShow < numberOfParkingNotEmpty ? true : false,
    dots: false,
    infinite: false,
    initialSlide: 0,
    swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
    draggable: numToShow < numberOfParkingNotEmpty ? true : false,
    touchMove: numToShow < numberOfParkingNotEmpty ? true : false,
    swipe: numToShow < numberOfParkingNotEmpty ? true : false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: numToShow < numberOfParkingNotEmpty ? true : false,
          slidesToShow: numToShow,
          swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
        },
      },
      {
        breakpoint: 900,
        settings: {
          arrows: numToShow < numberOfParkingNotEmpty ? true : false,
          slidesToShow: numToShow,
          swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
        },
      },
      {
        breakpoint: 780,
        settings: {
          arrows: numToShow < numberOfParkingNotEmpty ? true : false,
          slidesToShow: numToShow,
          swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          arrows: numToShow < numberOfParkingNotEmpty ? true : false,
          slidesToShow: numToShow,
          swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
        },
      },
      {
        breakpoint: 320,
        settings: {
          arrows: numToShow < numberOfParkingNotEmpty ? true : false,
          slidesToShow: numToShow,
          swipeToSlide: numToShow < numberOfParkingNotEmpty ? true : false,
        },
      },
    ],
  }

  return (
    <Slider
      {...settings}
      //
      variableWidth={true}
      //
    >
      {spacedCards}
    </Slider>
  )
}

export default SliderCarousel
