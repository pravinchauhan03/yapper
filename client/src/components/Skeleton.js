import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Skeleton = ({ width, height, borderRadius, style }) => {
  const { darkMode } = useTheme();

  return (
    <div style={{
      width: width || '100%',
      height: height || '16px',
      borderRadius: borderRadius || '8px',
      backgroundColor: darkMode ? '#0f3460' : '#e0e0e0',
      backgroundImage: darkMode
        ? 'linear-gradient(90deg, #0f3460 25%, #1a4a7a 50%, #0f3460 75%)'
        : 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
};

export const ConversationSkeleton = () => {
  const { darkMode } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '12px',
      marginBottom: '4px',
      backgroundColor: darkMode ? '#1a1a2e' : '#fff',
    }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width="60%" height="14px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
  );
};

export const MessageSkeleton = ({ align = 'left' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      marginBottom: '8px',
    }}>
      <Skeleton
        width={`${Math.floor(Math.random() * 30) + 30}%`}
        height="40px"
        borderRadius="16px"
      />
    </div>
  );
};

export default Skeleton;