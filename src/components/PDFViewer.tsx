import { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PDFViewer({ pdfUrl, title = 'عرض الملف' }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // منع اختصارات لوحة المفاتيح للحفظ والطباعة
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // منع Ctrl+S, Ctrl+P, Ctrl+Shift+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // منع النقر بزر الماوس الأيمن
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    const container = containerRef.current;
    const fullscreen = fullscreenRef.current;
    
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }
    if (fullscreen) {
      fullscreen.addEventListener('contextmenu', handleContextMenu);
    }
    
    // إضافة مستمع لاختصارات لوحة المفاتيح
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      if (fullscreen) {
        fullscreen.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // رابط PDF مع تعطيل شريط الأدوات والتنزيل
  const pdfEmbedUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&statusbar=0&messages=0&download=0&print=0`;

  // أنماط CSS للحماية
  const protectionStyles: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  return (
    <>
      {/* Embedded Viewer */}
      <div 
        ref={containerRef} 
        className="relative rounded-xl overflow-hidden bg-muted border border-border"
        style={protectionStyles}
      >
        <div className="flex items-center justify-between p-3 bg-muted/80 border-b border-border">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4 ml-2" />
            عرض كامل
          </Button>
        </div>
        <div className="relative">
          <iframe
            src={pdfEmbedUrl}
            className="w-full h-[400px]"
            title={title}
            style={{ border: 'none' }}
          />
          {/* طبقة شفافة تمنع التفاعل مع أزرار PDF المخفية */}
          <div 
            className="absolute top-0 left-0 right-0 h-12 bg-transparent z-10"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="flex flex-col h-full" ref={fullscreenRef} style={protectionStyles}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <span className="font-semibold text-foreground">{title}</span>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div 
              className="flex-1 relative" 
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                src={pdfEmbedUrl}
                className="w-full h-full"
                title={title}
                style={{ border: 'none' }}
              />
              {/* طبقة شفافة في الأعلى لمنع الوصول لشريط الأدوات */}
              <div 
                className="absolute top-0 left-0 right-0 h-12 bg-transparent z-10"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
