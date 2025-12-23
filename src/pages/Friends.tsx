import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, MessageCircle, X, Check, MapPin, Sparkles, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useToast } from "@/hooks/use-toast";

type TabType = "friends" | "requests" | "sent";

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    friends, 
    receivedRequests, 
    sentRequests, 
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<TabType>("friends");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleAccept = async (requestId: string, senderId: string, senderName: string) => {
    const { error } = await acceptFriendRequest(requestId, senderId);
    if (!error) {
      toast({
        title: "Sekarang berteman! 🎉",
        description: `Kamu dan ${senderName} sekarang berteman`,
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await rejectFriendRequest(requestId);
    if (!error) {
      toast({
        title: "Permintaan ditolak",
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    const { error } = await cancelFriendRequest(requestId);
    if (!error) {
      toast({
        title: "Permintaan dibatalkan",
      });
    }
  };

  const handleRemoveFriend = async (friendUserId: string, friendName: string) => {
    const { error } = await removeFriend(friendUserId);
    if (!error) {
      toast({
        title: "Teman dihapus",
        description: `${friendName} telah dihapus dari daftar teman`,
      });
    }
  };

  const tabs = [
    { id: "friends" as TabType, label: "Teman", count: friends.length },
    { id: "requests" as TabType, label: "Permintaan", count: receivedRequests.length },
    { id: "sent" as TabType, label: "Terkirim", count: sentRequests.length },
  ];

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">
              Teman 💫
            </h1>
            <p className="text-muted-foreground text-sm">
              Kelola pertemanan kamu
            </p>
          </div>
          <Link to="/find-friends">
            <Button variant="gradient" size="sm" className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Cari Teman
            </Button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex p-1 bg-muted/50 rounded-2xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge 
                  className={`ml-1 text-xs px-1.5 ${
                    activeTab === tab.id 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Friends Tab */}
              {activeTab === "friends" && (
                friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Belum ada teman</p>
                    <Link to="/find-friends">
                      <Button variant="gradient" className="rounded-xl">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Cari Teman Sekarang
                      </Button>
                    </Link>
                  </div>
                ) : (
                  friends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                            {friend.friend?.avatar_url ? (
                              <img 
                                src={friend.friend.avatar_url} 
                                alt={friend.friend.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {friend.friend?.is_online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-mint rounded-full border-2 border-background" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {friend.friend?.full_name || "Unknown"}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          @{friend.friend?.username}
                        </p>
                        {friend.friend?.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {friend.friend.city}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/chat/${friend.friend?.user_id}`}>
                          <Button size="icon" variant="soft" className="rounded-xl h-10 w-10">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="rounded-xl h-10 w-10 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveFriend(friend.friend?.user_id || "", friend.friend?.full_name || "")}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                receivedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada permintaan pertemanan</p>
                  </div>
                ) : (
                  receivedRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {request.sender?.avatar_url ? (
                            <img 
                              src={request.sender.avatar_url} 
                              alt={request.sender.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.sender?.full_name || "Unknown"}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          @{request.sender?.username}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="gradient" 
                          className="rounded-xl h-10 w-10"
                          onClick={() => handleAccept(request.id, request.sender_id, request.sender?.full_name || "")}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="rounded-xl h-10 w-10"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {/* Sent Tab */}
              {activeTab === "sent" && (
                sentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada permintaan yang terkirim</p>
                  </div>
                ) : (
                  sentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {request.receiver?.avatar_url ? (
                            <img 
                              src={request.receiver.avatar_url} 
                              alt={request.receiver.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.receiver?.full_name || "Unknown"}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          @{request.receiver?.username}
                        </p>
                        <Badge className="mt-1 bg-sky/20 text-sky text-xs">
                          Menunggu respon
                        </Badge>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={() => handleCancel(request.id)}
                      >
                        Batalkan
                      </Button>
                    </motion.div>
                  ))
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
