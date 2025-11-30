import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Shield, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VerificationSidebar, Verification } from "@/components/VerificationSidebar";
import { VerificationResult } from "@/components/VerificationResult";
import { ChatInput } from "@/components/ChatInput";
import { UserMessage } from "@/components/UserMessage";
import { AssistantMessage } from "@/components/AssistantMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const API_URL = import.meta.env.VITE_API_URL ?? "https://truthspotter.onrender.com";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Verification[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentClaim, setCurrentClaim] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  const [isCasualQuery, setIsCasualQuery] = useState(false);
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // -------------------------------
  // AUTH
  // -------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // -------------------------------
  // LOAD CONVERSATIONS
  // -------------------------------
  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        title,
        updated_at,
        messages (
          verification_status,
          confidence,
          role,
          sources,
          created_at
        )
      `)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const mapped: Verification[] = data.map((conv: any) => {
        // Filter for assistant messages only and get the latest one
        const assistantMessages = (conv.messages || [])
          .filter((m: any) => m.role === "assistant")
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        const lastResponse = assistantMessages[0];
        
        // Count sources from the latest assistant message
        const sourcesCount = lastResponse?.sources 
          ? (Array.isArray(lastResponse.sources) ? lastResponse.sources.length : 0)
          : 0;

        return {
          id: conv.id,
          claim: conv.title || "New conversation",
          status: lastResponse?.verification_status ?? "unverified",
          confidence: lastResponse?.confidence ?? 0,
          timestamp: new Date(conv.updated_at),
          sources: sourcesCount,
        };
      });
      setConversations(mapped);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setCurrentClaim(null);
    setCurrentResult(null);
    setIsCasualQuery(false);
    setAgentSteps([]);
  };

  // -------------------------------
  // VERIFY CLAIM + STREAM SSE
  // -------------------------------
  const handleVerifyClaim = async (claim: string) => {
    if (!user) return;

    setIsVerifying(true);
    setCurrentClaim(claim);
    setCurrentResult(null);
    setIsCasualQuery(false);
    setAgentSteps([]);

    try {
      // Use existing conversation if available, otherwise create a new one
      let conversationId = currentConversationId;
      if (!conversationId) {
        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: claim.slice(0, 100) })
          .select()
          .single();

        if (convError) {
          throw convError;
        }

        conversationId = conv.id;
        setCurrentConversationId(conversationId);
      } else {
        // Update conversation title if it's a generic title
        await supabase
          .from("conversations")
          .update({ 
            title: claim.slice(0, 100),
            updated_at: new Date().toISOString()
          })
          .eq("id", conversationId);
      }

      // Insert user message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: claim,
      });

      const es = new EventSource(`${API_URL}/verify-stream?claim=${encodeURIComponent(claim)}`);

      es.addEventListener("step", (e) => {
        setAgentSteps((prev) => [...prev, JSON.parse(e.data)]);
      });

      es.addEventListener("final", async (e) => {
        const result = JSON.parse(e.data);
        es.close();
        setIsVerifying(false);
        
        // Check if this is a casual query (no evidence/sources means it's a casual conversation)
        const isCasual = !result.evidence || result.evidence.length === 0 || result.evidenceSources === 0;
        setIsCasualQuery(isCasual);
        setCurrentResult(result);

        // Store assistant message
        if (isCasual) {
          // For casual queries, store as a simple assistant message without verification data
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: result.factCheckSummary ?? "",
            verification_status: null,
            confidence: null,
            summary: null,
            sources: null,
          });
        } else {
          // For verification queries, store with verification data
          let verificationStatus: "true" | "false" | "unverified" = "unverified";
          if (result.isVerified === true) {
            verificationStatus = "true";
          } else if (result.isVerified === false) {
            verificationStatus = "false";
          }

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: result.factCheckSummary ?? "",
            verification_status: verificationStatus,
            confidence: Math.round(result.confidence ?? 0),
            summary: result.factCheckSummary ?? "",
            sources: result.evidence ?? [],
          });
        }

        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        loadConversations();
        toast.success(isCasual ? "Response complete" : "Verification complete");
      });

      es.addEventListener("error", () => {
        es.close();
        setIsVerifying(false);
        toast.error("Stream connection failed");
      });
    } catch {
      setIsVerifying(false);
      toast.error("Verification failed");
    }
  };

  // -------------------------------
  // LOAD PAST CONVERSATION
  // -------------------------------
  const handleSelectVerification = async (v: Verification) => {
    setCurrentConversationId(v.id);
    setIsVerifying(true);
    setAgentSteps([]);

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", v.id)
      .order("created_at", { ascending: true });

    const userMsg = messages?.find((m) => m.role === "user");
    const assistantMsg = messages?.find((m) => m.role === "assistant");

    if (userMsg) setCurrentClaim(userMsg.content);

    if (assistantMsg) {
      // Check if this is a casual query (no verification_status or no sources)
      const isCasual = !assistantMsg.verification_status && 
                       (!assistantMsg.sources || (Array.isArray(assistantMsg.sources) && assistantMsg.sources.length === 0));
      setIsCasualQuery(isCasual);
      
      setCurrentResult({
        verification_status: assistantMsg.verification_status,
        confidence: assistantMsg.confidence,
        summary: assistantMsg.summary,
        sources: assistantMsg.sources ?? [],
        factCheckSummary: assistantMsg.content, // Use content for casual queries
      });
    }

    setIsVerifying(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden border-r border-sidebar-border bg-sidebar`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Recent Chats</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" title="New Chat" onClick={handleNewChat}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <VerificationSidebar verifications={conversations} onSelectVerification={handleSelectVerification} />
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-6 gap-4">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">
              Truth<span className="text-primary">Spotter</span>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user && <span className="text-sm text-muted-foreground">{user.email}</span>}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {currentClaim && <UserMessage message={currentClaim} />}

            {/* Agent live stream */}
            {agentSteps.length > 0 && (
              <div className="bg-muted p-4 rounded-md border text-sm font-mono space-y-1 animate-in fade-in">
                {agentSteps.map((s, i) => (
                  <div key={i}>• {s}</div>
                ))}
              </div>
            )}

            {isVerifying && (
              <div className="flex items-center justify-center py-12 animate-pulse">
                <p className="text-muted-foreground">Processing claim...</p>
              </div>
            )}

            {/* Final result - Show verification UI only for verification queries */}
            {currentResult && !isVerifying && !isCasualQuery && (
              <VerificationResult
                status={
                  currentResult.verification_status ??
                  (currentResult.isVerified ? "true" : "false")
                }
                confidence={currentResult.confidence ?? 0}
                summary={currentResult.summary ?? currentResult.factCheckSummary ?? ""}
                sources={currentResult.sources ?? currentResult.evidence ?? []}
              />
            )}

            {/* Casual query response - Show as normal chat message */}
            {currentResult && !isVerifying && isCasualQuery && (
              <AssistantMessage message={currentResult.factCheckSummary ?? currentResult.summary ?? ""} />
            )}

            {!currentClaim && !isVerifying && (
              <div className="text-center py-20">
                <Shield className="h-20 w-20 text-primary mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-bold">Welcome to TruthSpotter</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter any claim to verify its accuracy using multi-agent fact-checking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-6">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSubmit={handleVerifyClaim} disabled={isVerifying} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
