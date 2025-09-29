import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '../../firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface CollaborationViewProps {
  currentUser: any;
  isSuperuser: boolean;
  superuserInfo: { organization: string } | null;
}

function CollaborationView({ currentUser, isSuperuser, superuserInfo }: CollaborationViewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const loggedInUserOrganization = isSuperuser
    ? superuserInfo?.organization
    : currentUser?.organization;

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loggedInUserOrganization) return;

    const q = query(collection(db, 'group-chats', loggedInUserOrganization, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [loggedInUserOrganization]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() && currentUser && loggedInUserOrganization) {
      await addDoc(collection(db, 'group-chats', loggedInUserOrganization, 'messages'), {
        text: message,
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: serverTimestamp(),
      });
      setMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)]">
      <div className="w-full bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-primary-900/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Group Chat</h3>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-md ${msg.senderId === currentUser.id ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-white'}`}>
                <p className="text-sm font-bold">{msg.senderName}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-primary-900/50 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-100 dark:bg-dark-800/50 border border-gray-300 dark:border-dark-700 rounded-lg p-2 text-gray-800 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollaborationView;
