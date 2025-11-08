'use client';

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard-header';
import type { Chat } from '@/lib/types';
import { Users } from 'lucide-react';

export default function ChatsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Conversations" />
      <Card>
        <CardHeader>
          <CardTitle>My Chats</CardTitle>
          <CardDescription>Click on a chat to view messages.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-center">Loading chats...</div>}
          {!isLoading && (!chats || chats.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="mx-auto h-12 w-12" />
              <p className="mt-4">No conversations yet.</p>
              <p className="text-sm">When a doctor starts a chat with you, it will appear here.</p>
            </div>
          )}
          <div className="space-y-2">
            {chats?.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <Avatar>
                  <AvatarFallback>{chat.participants.length}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">Chat with {chat.participants.filter(p => p !== user?.uid)[0]?.substring(0,6) || 'User'}...</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {chat.updatedAt ? new Date(chat.updatedAt.seconds * 1000).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
