import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from "../../hooks/use-toast";
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../utils/messageSlice';

const SocketHandler = () => {
  const { socket } = useSocket();
  const { toast } = useToast();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket || !user) {
      console.log("⚠️ SocketHandler: Socket or user not ready", { socket: !!socket, user: !!user });
      return;
    }

    console.log("🔌 SocketHandler initializing for user:", user._id);

    // Join user's room
    socket.emit('join', user._id);

    // Listen for connection requests
    socket.on('connection-request-received', (data) => {
      console.log("📬 Connection request received:", data);
      toast({
        title: "New Connection Request",
        description: data.message,
        duration: 5000,
      });
    });

    // Listen for accepted connections
    socket.on('connection-accepted', (data) => {
      console.log("✅ Connection accepted:", data);
      toast({
        title: "Connection Accepted!",
        description: data.message,
        duration: 5000,
      });
    });

    // Listen for incoming messages
    socket.on('receive-message', (data) => {
      console.log("📥 Message received in SocketHandler:", data);
      console.log(`   From: ${data.fromUserId}, To: ${user._id}`);
      
      // Convert both IDs to strings for consistency
      const fromUserId = data.fromUserId.toString();
      const toUserId = user._id.toString();
      
      console.log(`   📍 Storing as - From: ${fromUserId}, To: ${toUserId}`);
      
      dispatch(
        addMessage({
          fromUserId: fromUserId,
          toUserId: toUserId,
          message: data.message,
          timestamp: data.timestamp,
        })
      );

      toast({
        title: "New Message",
        description: `${data.message.substring(0, 50)}...`,
        duration: 3000,
      });
    });

    // Listen for message sent confirmation
    socket.on('message-sent', (data) => {
      console.log("✅ Message sent confirmation:", data);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error("❌ Socket error in SocketHandler:", error);
    });

    return () => {
      console.log("🧹 Cleaning up SocketHandler listeners");
      socket.off('connection-request-received');
      socket.off('connection-accepted');
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('error');
    };
  }, [socket, user, toast, dispatch]);

  return null;
};

export default SocketHandler;