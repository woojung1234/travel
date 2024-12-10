import React from 'react';
import './Slider.css';

const Slider = () => {
    const images = [
        '/assets/image1.jpg',
        '/assets/image2.jpg',
        '/assets/image3.jpg',
        '/assets/image4.jpg',
    ];

    return (
        <div className="slider">
            <div className="slider-track">
                {images.map((image, index) => (
                    <div className="slide" key={index}>
                        <img src={image} alt={`Slide ${index + 1}`} />
                    </div>
                ))}
                {images.map((image, index) => (
                    <div className="slide" key={`duplicate-${index}`}>
                        <img src={image} alt={`Slide ${index + 1}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;
