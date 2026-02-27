import { useState, useRef, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface SketchfabEmbedProps {
  modelId: string;
  title?: string;
  className?: string;
  height?: string;
}

export default function SketchfabEmbed({ 
  modelId, 
  title = '3D Model', 
  className = '',
  height = '400px'
}: SketchfabEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Sketchfab embed URL with parameters
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?` + new URLSearchParams({
    'autostart': '0',
    'ui_controls': '1',
    'ui_infos': '1',
    'ui_inspector': '1',
    'ui_stop': '1',
    'ui_watermark': '0',
    'ui_watermark_link': '0',
    'ui_settings': '0',
    'ui_help': '0',
    'ui_fullscreen': '1',
    'ui_annotations': '0',
    'ui_theme': 'dark',
  }).toString();

  const sketchfabLink = `https://sketchfab.com/3d-models/${modelId}`;

  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={`relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <p className="text-gray-400 mb-2">Não foi possível carregar o modelo 3D</p>
          <a 
            href={sketchfabLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-engine-blue hover:underline text-sm inline-flex items-center gap-1"
          >
            Ver no Sketchfab
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Loading State */}
      {(isLoading || !isVisible) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <Loader2 className="w-10 h-10 text-engine-blue animate-spin mb-3" />
          <p className="text-gray-400 text-sm">{isVisible ? 'Carregando modelo 3D...' : 'Aguardando...'}</p>
        </div>
      )}

      {/* Sketchfab Iframe */}
      {isVisible && (
        <iframe
          ref={iframeRef}
          title={title}
          src={embedUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Overlay Controls */}
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        <a
          href={sketchfabLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg text-white transition-colors"
          title="Abrir no Sketchfab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Model Label */}
      <div className="absolute bottom-3 left-3 z-20">
        <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          Modelo 3D Interativo
        </span>
      </div>
    </div>
  );
}
