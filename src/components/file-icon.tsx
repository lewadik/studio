import type { FileType } from '@/types';
import { FileText, ImageIcon, FileArchive, Video, Music, FileQuestion, FileType as PdfIcon } from 'lucide-react';

type FileIconProps = {
  type: FileType;
  className?: string;
};

export function FileIcon({ type, className }: FileIconProps) {
  switch (type) {
    case 'text':
      return <FileText className={className} />;
    case 'image':
      return <ImageIcon className={className} />;
    case 'archive':
      return <FileArchive className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'audio':
        return <Music className={className} />;
    case 'pdf':
        return <PdfIcon className={className} />;
    default:
      return <FileQuestion className={className} />;
  }
}
