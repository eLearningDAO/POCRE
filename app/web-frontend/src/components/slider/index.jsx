/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect } from 'react';
import { Button } from 'react-materialize';
import M from 'materialize-css';
import RightIcon from 'assets/images/right.png';
import LeftIcon from 'assets/images/left.png';
import './index.css';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';

export default function Slider({ handleSlideClick, slideImageList }) {
  const [car, setCar] = React.useState(null);
  useEffect(() => {
    if (slideImageList) {
      const options = {
        duration: 300,
        indicators: true,
        dragged: false,
        onCycleTo: () => {},
      };
      M.Carousel.init(car, options);
    }
  }, [car, slideImageList]);

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
          slideImageList && slideImageList.map((slide, index) => (
            <a
              key={index}
              className="carousel-item"
              {...accessibleOnClick(handleSlideClick, slide.id)}
            >
              <img src={slide.imageUrl} alt={slide.id} />
            </a>
          ))
        }
      </div>
      <Button className="rightIcon" onClick={next}><img src={RightIcon} /></Button>
      <Button className="leftIcon" onClick={previous}><img src={LeftIcon} /></Button>
    </div>
  );
}
