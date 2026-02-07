/**
 * Voice Demos V2 Page
 * 
 * This is a wrapper component that lazy-loads the VoiceDemosV2Page.
 * It provides a standalone entry point for the Voice Demos V2 feature.
 */
import { Suspense, lazy } from 'react';
import { Spinner } from '@fluentui/react-components';

// Lazy load the main VoiceDemosV2 component
const VoiceDemosV2 = lazy(() => import('../demos/voice-demos-v2/VoiceDemosV2Page'));

const VoiceDemosV2Page = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spinner size="large" />
        <p>Loading Voice Demos V2...</p>
      </div>
    }>
      <VoiceDemosV2 />
    </Suspense>
  );
};

export default VoiceDemosV2Page;
