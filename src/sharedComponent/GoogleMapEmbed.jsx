import React from 'react';

const GoogleMapEmbed = ({ latitude, longitude, width, height }) => {
    const mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&t=k&output=embed`;

    return (
        <iframe
            title="Google Map"
            width= {width}
            height={height}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
        />
    );
};

export default GoogleMapEmbed;
