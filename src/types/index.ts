export type FileType = 'text' | 'image' | 'archive' | 'video' | 'audio' | 'pdf' | 'unknown';

export type FileData = {
  id: string;
  name: string;
  size: string;
  type: FileType;
  description: string;
  status: 'uploading' | 'describing' | 'complete' | 'error';
  source: 'local' | 'remote';
};
