/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Button } from 'react-materialize';
import M from 'materialize-css';
import RightIcon from '../../../assets/right.png';
import LeftIcon from '../../../assets/left.png';

import SliderImage1 from '../../../assets/slider/slider-01.jpg';
import SliderImage2 from '../../../assets/slider/slider-02.jpg';
import SliderImage3 from '../../../assets/slider/slider-03.jpg';
import SliderImage4 from '../../../assets/slider/slider-04.jpg';
import SliderImage5 from '../../../assets/slider/slider-05.jpg';

import './materialize.css';

const slides = [
  <img src={SliderImage1} alt="1" />,
  <img src={SliderImage2} alt="2" />,
  <img src={SliderImage3} alt="3" />,
  <img src={SliderImage4} alt="4" />,
  <img src={SliderImage5} alt="5" />,
];

export default function Slider() {
  const [car, setCar] = React.useState(null);

  React.useEffect(() => {
    const options = {
      duration: 300,
      indicators: true,
      dragged: false,
      onCycleTo: () => {
        // console.log('New Slide');
      },
    };
    M.Carousel.init(car, options);
  }, [car]);

  const next = () => {
    const instance = M.Carousel.getInstance(car);
    instance.next();
  };

  const previous = () => {
    const instance = M.Carousel.getInstance(car);
    instance.prev();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={(Carousel) => {
          setCar(Carousel);
        }}
        className="carousel"
      >
        {
          slides.map((slide) => (
            <a className="carousel-item">
              {slide}
            </a>
          ))
        }
      </div>
      <Button className="rightIcon" onClick={next}><img src={RightIcon} /></Button>
      <Button className="leftIcon" onClick={previous}><img src={LeftIcon} /></Button>
    </div>
  );
}
