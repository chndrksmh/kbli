import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function IndonesiaMap({ className = '', style = {}, hoveredProvince, onProvinceHover }) {
    const [geojsonData, setGeojsonData] = useState(null);
    const [viewBox, setViewBox] = useState('95 -11 50 25');
    const [yFlipOffset, setYFlipOffset] = useState(0);

    useEffect(() => {
        fetch('/maps/indonesia-prov.geojson')
            .then(res => res.json())
            .then(data => {
                setGeojsonData(data);
                if (data.features && data.features.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    data.features.forEach(feature => {
                        const processCoords = coordArray => {
                            if (typeof coordArray[0] === 'number') {
                                minX = Math.min(minX, coordArray[0]);
                                maxX = Math.max(maxX, coordArray[0]);
                                minY = Math.min(minY, coordArray[1]);
                                maxY = Math.max(maxY, coordArray[1]);
                            } else { coordArray.forEach(processCoords); }
                        };
                        processCoords(feature.geometry.coordinates);
                    });
                    const width = maxX - minX;
                    const height = maxY - minY;
                    const padding = Math.max(width, height) * 0.04;
                    setYFlipOffset(minY + maxY);
                    setViewBox(`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`);
                }
            })
            .catch(err => console.error('Failed to load GeoJSON:', err));
    }, []);

    const renderPath = coordinates => {
        if (!coordinates || coordinates.length === 0) return '';
        const projectPoint = point => `${point[0]},${yFlipOffset - point[1]}`;
        const renderCoords = coords => {
            if (typeof coords[0] === 'number') return projectPoint(coords);
            if (coords[0] && typeof coords[0][0] === 'number') {
                const [first, ...rest] = coords;
                const lineTo = rest.map(projectPoint).join(' L ');
                return `M ${projectPoint(first)}${lineTo ? ` L ${lineTo}` : ''} Z`;
            }
            return coords.map(renderCoords).join(' ');
        };
        return renderCoords(coordinates);
    };

    if (!geojsonData) {
        return (
            <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={className}
            style={{ position: 'relative', width: '100%', height: '100%', ...style }}
        >
            <svg viewBox={viewBox} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="provGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="provHover" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <filter id="provShadow" x="-5%" y="-5%" width="110%" height="110%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#065f46" floodOpacity="0.2" />
                    </filter>
                </defs>
                {geojsonData.features.map((feature, idx) => {
                    const name = feature.properties?.PROVINSI || feature.properties?.name || '';
                    const isHovered = hoveredProvince === name;
                    const renderFeature = (polygon, polyIdx) => (
                        <motion.path
                            key={`${idx}-${polyIdx}`}
                            d={renderPath(polygon)}
                            fill={isHovered ? 'url(#provHover)' : 'url(#provGradient)'}
                            fillRule="evenodd"
                            stroke="#065f46"
                            strokeWidth="0.08"
                            filter="url(#provShadow)"
                            style={{ cursor: 'default', transition: 'fill 0.2s ease' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.003 }}
                            onMouseEnter={() => onProvinceHover && onProvinceHover(name)}
                            onMouseLeave={() => onProvinceHover && onProvinceHover(null)}
                        />
                    );
                    if (feature.geometry.type === 'Polygon') return renderFeature(feature.geometry.coordinates, 0);
                    if (feature.geometry.type === 'MultiPolygon') return feature.geometry.coordinates.map((poly, pi) => renderFeature(poly, pi));
                    return null;
                })}
            </svg>
        </motion.div>
    );
}
