import React, { ReactNode } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface SliderCarouselProps {
  children: ReactNode
}

function SampleNextArrow(props: any) {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{ ...style, display: 'block', background: 'transparent', cursor: 'pointer' }}
      onClick={onClick}
    ></div>
  )
}

function SamplePrevArrow(props: any) {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{ ...style, display: 'block', background: 'transparent', cursor: 'pointer' }}
      onClick={onClick}
    ></div>
  )
}

const SliderCarousel: React.FC<SliderCarouselProps> = ({ children }) => {
  const settings = {
    className: 'center',
    centerPadding: '60px',
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    appendDots: (dots: any) => (
      <div
        style={{
          padding: '10px',
        }}
      >
        <ul style={{ margin: '0px' }}> {dots} </ul>
      </div>
    ),
    afterChange: function (index: any) {
      console.log(`Slider Changed to: ${index + 1}, background: #222; color: #bada55`)
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <Slider {...settings}>
      {children}
      <div style={{ textAlign: 'center' }}>
        {' '}
      </div>
    </Slider>
  )
}

export default SliderCarousel
