'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User as UserIcon } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { cn } from '@/lib/utils';
import type { Message, Chat } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const chatId = params.chatId as string;
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatRef = useMemoFirebase(() => {
    if (!chatId) return null;
    return doc(firestore, 'chats', chatId);
  }, [firestore, chatId]);

  const {data: chat, isLoading: isLoadingChat } = useDoc<Chat>(chatRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!chatId) return null;
    return query(collection(firestore, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));
  }, [firestore, chatId]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatRef) return;

    const messagesColRef = collection(firestore, `chats/${chatId}/messages`);
    
    addDocumentNonBlocking(messagesColRef, {
        chatId: chatId,
        senderId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
    });
    
    // Non-blocking update for the last message
    updateDoc(chatRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
    }).catch(err => console.error("Failed to update last message", err));


    setNewMessage('');
  };
  
  const getParticipantName = (senderId: string) => {
    if (!chat) return 'User';
    // This is a simple implementation. A real app would fetch user profiles.
    if (senderId === user?.uid) return "You";
    return `Participant ${senderId.substring(0, 4)}`;
  }


  return (
    <main className="flex flex-col h-screen">
       <div className="p-4 md:p-8 pt-6">
        <DashboardHeader title={`Chat with ${chat ? `Participant` : '...'} `} />
       </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {isLoadingMessages && <div className="text-center">Loading messages...</div>}
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-end gap-2',
              msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.senderId !== user?.uid && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><UserIcon size={20}/></AvatarFallback>
                </Avatar>
            )}
            <div
              className={cn(
                'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2',
                msg.senderId === user?.uid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm font-bold mb-1">{getParticipantName(msg.senderId)}</p>
              <p>{msg.text}</p>
              <p className="text-xs text-right opacity-70 mt-1">
                {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : 'Sending...'}
              </p>
            </div>
             {msg.senderId === user?.uid && (
                <Avatar className="h-8 w-8">
                     <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-8 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </main>
  );
}
