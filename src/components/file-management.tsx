'use client';

import { useState, useCallback, useTransition } from 'react';
import { UploadCloud, Plus, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { generateFileDescription } from '@/ai/flows/generate-file-description';
import type { FileData, FileType } from '@/types';
import { FileIcon } from './file-icon';

const getFileType = (fileName: string): FileType => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(extension!)) return 'text';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension!)) return 'image';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension!)) return 'archive';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension!)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension!)) return 'audio';
    if (['pdf'].includes(extension!)) return 'pdf';
    return 'unknown';
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function FileManagement() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateDescription = useCallback(async (fileId: string, fileName: string) => {
    try {
      const result = await generateFileDescription({
        fileName: fileName,
        fileContent: `This is a mock content for file ${fileName}. In a real app, this would be the actual file content.`,
      });
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, description: result.description, status: 'complete' } : f
        )
      );
    } catch (error) {
      console.error('Error generating description:', error);
      setFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'error', description: 'Failed to generate description.' } : f))
      );
    }
  }, []);
  
  const addFile = useCallback((file: Omit<FileData, 'id' | 'description' | 'status'>) => {
    const newFile: FileData = {
      ...file,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      description: '',
      status: 'uploading',
    };
    setFiles(prev => [newFile, ...prev]);

    setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === newFile.id ? {...f, status: 'describing'} : f));
        startTransition(() => {
            handleGenerateDescription(newFile.id, newFile.name);
        });
    }, 1500); // Simulate upload time
  }, [handleGenerateDescription]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        addFile({
            name: file.name,
            size: formatBytes(file.size),
            type: getFileType(file.name),
            source: 'local',
        });
      });
      e.dataTransfer.clearData();
    }
  };

  const handleRemoteDownload = () => {
    if (!remoteUrl) {
      toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
      return;
    }
    const fileName = remoteUrl.split('/').pop() || 'remote_file';
    addFile({
        name: fileName,
        size: 'N/A',
        type: getFileType(fileName),
        source: 'remote',
    });
    setRemoteUrl('');
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>File Management</CardTitle>
        <CardDescription>Upload, download, and manage your files.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
        <div 
          className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-accent/20' : 'border-border'}`}
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to select files</p>
          <input id="file-upload-input" type="file" multiple className="hidden" onChange={(e) => {
              if (e.target.files) {
                  Array.from(e.target.files).forEach(file => {
                      addFile({ name: file.name, size: formatBytes(file.size), type: getFileType(file.name), source: 'local' });
                  });
              }
          }} />
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <Input 
            placeholder="https://example.com/file.zip"
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!remoteUrl}>
                <Plus className="w-4 h-4 mr-2" />
                Remote Download
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Remote Download</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to download the file from this URL?
                  <p className="mt-2 font-mono text-sm break-all">{remoteUrl}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoteDownload}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Separator />
        <p className="text-sm font-medium text-muted-foreground">Uploaded Files</p>
        <ScrollArea className="flex-1">
          <div className="pr-4 space-y-4">
            {files.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No files yet.</p>
            ) : (
                files.map(file => (
                  <Card key={file.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                        <FileIcon type={file.type} className="w-8 h-8 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{file.size}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        {file.status === 'uploading' && <><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-sm text-muted-foreground">Uploading...</span></>}
                        {file.status === 'describing' && <><Sparkles className="w-4 h-4 text-primary animate-pulse" /> <span className="text-sm text-muted-foreground">Generating...</span></>}
                        {file.status === 'error' && <><AlertCircle className="w-4 h-4 text-destructive" /> <span className="text-sm text-destructive">Error</span></>}
                        </div>
                    </CardContent>
                    {(file.status === 'complete' || file.status === 'error') && file.description && (
                        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground border-t">
                            {file.description}
                        </CardFooter>
                    )}
                  </Card>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
}
