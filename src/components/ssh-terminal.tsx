'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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

    useEffect(() => {
        setClientDate(new Date().toString());
    }, []);

    const commands: { [key: string]: string | ((args: string) => string) } = useMemo(() => ({
        help: 'Available commands: help, ls, pwd, whoami, date, echo [text], clear',
        ls: '-rw-r--r-- 1 user group 4.5K Jan 1 12:30 project-alpha\n-rwxr-xr-x 1 user group 1.2M Jan 2 09:00 app.exe\ndrwxr-xr-x 2 user group 4.0K Dec 28 15:00 documents',
        pwd: '/home/user/remote-hub',
        whoami: 'user',
        date: clientDate,
        echo: (args: string) => args || 'Usage: echo [text]',
        clear: '',
    }), [clientDate]);

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
    
    return (
        <div className="flex flex-col h-full bg-black text-white" onClick={() => inputRef.current?.focus()}>
            <CardHeader className="text-white border-b border-gray-800">
                <CardTitle>SSH Terminal</CardTitle>
                <CardDescription className="text-gray-400">Execute commands on the remote server.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 font-code text-sm">
                        {lines.map((line) => (
                            <div key={line.id}>
                                {line.type === 'command' && (
                                    <div className="flex">
                                        <span className="text-green-400">user@remote-hub:~$</span>
                                        <span className="flex-1 pl-2">{line.text}</span>
                                    </div>
                                )}
                                {line.type === 'response' && (
                                    <p className="whitespace-pre-wrap">{line.text}</p>
                                )}
                            </div>
                        ))}
                         <div className="flex">
                            <span className="text-green-400">user@remote-hub:~$</span>
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
