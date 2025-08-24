'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Line = {
    id: number;
    type: 'command' | 'response';
    text: string;
}

const initialLines: Line[] = [
    { id: 1, type: 'response', text: 'Welcome to Remote Hub SSH Terminal.' },
    { id: 2, type: 'response', text: 'Type "help" to see available commands.' },
];

export function SshTerminal() {
    const [lines, setLines] = useState<Line[]>(initialLines);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentCommand, setCurrentCommand] = useState('');
    const [clientDate, setClientDate] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [host, setHost] = useState('remote-hub');
    const [port, setPort] = useState(22);
    const [username, setUsername] = useState('user');

    const [tempHost, setTempHost] = useState(host);
    const [tempPort, setTempPort] = useState(port);
    const [tempUsername, setTempUsername] = useState(username);

    useEffect(() => {
        setClientDate(new Date().toString());
    }, []);

    const commands: { [key: string]: string | ((args: string) => string) } = useMemo(() => ({
        help: 'Available commands: help, ls, pwd, whoami, date, echo [text], clear',
        ls: '-rw-r--r-- 1 user group 4.5K Jan 1 12:30 project-alpha\n-rwxr-xr-x 1 user group 1.2M Jan 2 09:00 app.exe\ndrwxr-xr-x 2 user group 4.0K Dec 28 15:00 documents',
        pwd: `/home/${username}/remote-hub`,
        whoami: username,
        date: clientDate,
        echo: (args: string) => args || 'Usage: echo [text]',
        clear: '',
    }), [clientDate, username]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [lines]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    const handleSettingsSave = () => {
        setHost(tempHost);
        setPort(tempPort);
        setUsername(tempUsername);
        setIsSettingsOpen(false);
        setLines(prev => [...prev, { id: Date.now(), type: 'response', text: `Connection settings updated for ${tempUsername}@${tempHost}:${tempPort}` }]);
    };

    const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmedCommand = currentCommand.trim();
            if (!trimmedCommand) {
                 setLines(prev => [...prev, { id: Date.now(), type: 'command', text: '' }]);
                 setCurrentCommand('');
                 return;
            }

            const [command, ...args] = trimmedCommand.split(' ');
            const newLines: Line[] = [...lines, { id: Date.now(), type: 'command', text: trimmedCommand }];

            if(command === 'clear') {
                setLines([]);
            } else if (command in commands) {
                const responseFn = commands[command];
                const response = typeof responseFn === 'function' ? responseFn(args.join(' ')) : responseFn;
                if (response) {
                    response.split('\n').forEach(line => {
                        newLines.push({ id: Date.now() + Math.random(), type: 'response', text: line });
                    });
                }
            } else {
                newLines.push({ id: Date.now() + Math.random(), type: 'response', text: `command not found: ${command}` });
            }

            setLines(newLines);
            if(trimmedCommand) setHistory(prev => [trimmedCommand, ...prev]);
            setHistoryIndex(-1);
            setCurrentCommand('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = Math.min(historyIndex + 1, history.length - 1);
                setHistoryIndex(newIndex);
                setCurrentCommand(history[newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > -1) {
                const newIndex = Math.max(historyIndex - 1, -1);
                setHistoryIndex(newIndex);
                setCurrentCommand(history[newIndex] || '');
            }
        }
    };
    
    const prompt = `${username}@${host}:~$`;

    return (
        <div className="flex flex-col h-full bg-black text-white" onClick={() => inputRef.current?.focus()}>
            <CardHeader className="flex flex-row items-center justify-between text-white border-b border-gray-800">
                <div>
                    <CardTitle>SSH Terminal</CardTitle>
                    <CardDescription className="text-gray-400">Execute commands on the remote server.</CardDescription>
                </div>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="w-5 h-5" />
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>SSH Connection Settings</DialogTitle>
                            <DialogDescription>Configure the connection details for your remote server.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="host" className="text-right">Host</Label>
                                <Input id="host" value={tempHost} onChange={(e) => setTempHost(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="port" className="text-right">Port</Label>
                                <Input id="port" type="number" value={tempPort} onChange={(e) => setTempPort(Number(e.target.value))} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">Username</Label>
                                <Input id="username" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSettingsSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 font-code text-sm">
                        {lines.map((line) => (
                            <div key={line.id}>
                                {line.type === 'command' && (
                                    <div className="flex">
                                        <span className="text-green-400">{prompt}</span>
                                        <span className="flex-1 pl-2">{line.text}</span>
                                    </div>
                                )}
                                {line.type === 'response' && (
                                    <p className="whitespace-pre-wrap">{line.text}</p>
                                )}
                            </div>
                        ))}
                         <div className="flex">
                            <span className="text-green-400">{prompt}</span>
                            <div className="relative flex-1">
                              <input
                                  ref={inputRef}
                                  type="text"
                                  value={currentCommand}
                                  onChange={(e) => setCurrentCommand(e.target.value)}
                                  onKeyDown={handleCommand}
                                  className="w-full pl-2 bg-transparent border-none outline-none caret-transparent"
                                  autoFocus
                                  spellCheck="false"
                              />
                              <div className="absolute top-0 left-0 flex items-center h-full pointer-events-none">
                                <span className="pl-2">{currentCommand}</span>
                                <span className="inline-block w-2 h-4 bg-green-400 animate-blink" />
                              </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </div>
    );
}
