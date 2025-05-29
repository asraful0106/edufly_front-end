import React from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';

import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';


const GalleryCompnent = () => {
    const items = [
        {
            src: 'https://example.com/images/pic1.jpg',
            thumb: 'https://example.com/images/thumb1.jpg',
        },
        {
            src: 'https://www.youtube.com/watch?v=ttLu7ygaN6I',
            poster: 'https://img.youtube.com/vi/ttLu7ygaN6I/hqdefault.jpg',
        },
        {
            src: 'https://example.com/images/pic2.jpg',
            thumb: 'https://example.com/images/thumb2.jpg',
        },
        {
            src: 'https://vimeo.com/123456789',
            poster: 'https://example.com/images/vimeo-thumb.jpg',
        },
      ];

    return (
        <LightGallery
            plugins={[lgThumbnail, lgVideo]}
            dynamic
            dynamicEl={items}
        />
    );
};

export default GalleryCompnent;