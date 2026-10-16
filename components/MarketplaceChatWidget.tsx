"use client";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Box, Button, Fab, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  sender: "visitor" | "assistant";
  text: string;
  link?: { href: string; label: string };
};

const quickQuestions = ["Find products", "Payment help", "Track an order", "I want to sell"];

function getAnswer(question: string): Omit<ChatMessage, "id" | "sender"> {
  const text = question.toLowerCase();

  if (/track|order|delivery|ship|shipped|where.*(buy|order)/.test(text)) {
    return {
      text: "I can guide you to order tracking. Enter the order reference from your payment confirmation and the email you used at checkout. I can’t look up order details inside this chat.",
      link: { href: "/track-order", label: "Track an order" },
    };
  }

  if (/pay|payment|checkout|card|opay|bank|secure|refund|return/.test(text)) {
    if (/refund|return/.test(text)) {
      return {
        text: "I don’t have published return or refund information to share here. For an order update, use the tracking page. Please don’t send card details or passwords in this chat.",
        link: { href: "/track-order", label: "Track an order" },
      };
    }
    return {
      text: "Checkout takes place on Paystack’s secure hosted page. Payment options shown there depend on the channels enabled for the marketplace account. Never send your card details or password in this chat.",
      link: { href: "/marketplace", label: "Browse the marketplace" },
    };
  }

  if (/sell|vendor|store|shop owner|register/.test(text)) {
    return {
      text: "Independent sellers can apply to join Cloudfund. After your vendor account is approved, you can add products from your dashboard.",
      link: { href: "/vendor/register", label: "Register your store" },
    };
  }

  if (/product|browse|search|shop|buy|catalog/.test(text)) {
    return {
      text: "You can browse approved shops and search or filter products in the marketplace.",
      link: { href: "/marketplace", label: "Browse products" },
    };
  }

  return {
    text: "I can help with browsing products, Paystack checkout, order tracking, or selling on Cloudfund. Try one of the suggested questions below.",
  };
}

export default function MarketplaceChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      sender: "assistant",
      text: "Hi! I’m Cloudfund’s automated helper. What can I help you with?",
    },
  ]);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (value: string) => {
    const question = value.trim();
    if (!question) return;
    const id = Date.now();
    const answer = getAnswer(question);
    setMessages((current) => [
      ...current,
      { id, sender: "visitor", text: question },
      { id: id + 1, sender: "assistant", ...answer },
    ]);
    setDraft("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <>
      {open && (
        <Paper
          component="section"
          aria-label="Cloudfund chat assistant"
          elevation={12}
          sx={{
            position: "fixed",
            zIndex: 1400,
            right: { xs: 12, sm: 24 },
            bottom: { xs: 188, sm: 96 },
            width: { xs: "calc(100vw - 24px)", sm: 360 },
            height: { xs: "min(520px, calc(100dvh - 112px))", sm: 520 },
            maxHeight: "calc(100dvh - 100px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e2e9e4",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 2, py: 1.5, color: "#fff", background: "#203c35" }}>
            <SupportAgentIcon />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>Cloudfund chat</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.75)", fontSize: 12 }}>Automated shopping help</Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} aria-label="Close chat" sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            ref={messageListRef}
            aria-live="polite"
            sx={{ flex: 1, overflowY: "auto", p: 1.75, background: "#f7f9f7" }}
          >
            <Stack spacing={1.5}>
              {messages.map((message) => (
                <Box key={message.id} sx={{ alignSelf: message.sender === "visitor" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                  <Box sx={{ px: 1.5, py: 1.15, borderRadius: message.sender === "visitor" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: message.sender === "visitor" ? "#203c35" : "#fff", border: message.sender === "visitor" ? "none" : "1px solid #e4e9e5", color: message.sender === "visitor" ? "#fff" : "#293630" }}>
                    <Typography sx={{ fontSize: 13.5, lineHeight: 1.55 }}>{message.text}</Typography>
                  </Box>
                  {message.link && (
                    <Button component={Link} href={message.link.href} size="small" sx={{ mt: 0.5, px: 0.5, fontWeight: 700, textTransform: "none", color: "#087b5d" }}>
                      {message.link.label}
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ px: 1.5, pt: 1.25, borderTop: "1px solid #e8ece9", background: "#fff" }}>
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.25 }}>
              {quickQuestions.map((question) => (
                <Button
                  key={question}
                  size="small"
                  onClick={() => sendMessage(question)}
                  sx={{ border: "1px solid #dbe4de", borderRadius: 5, px: 1.1, py: 0.4, color: "#355348", fontSize: 11, textTransform: "none", lineHeight: 1.35 }}
                >
                  {question}
                </Button>
              ))}
            </Stack>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1.5 }}>
              <TextField
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question…"
                aria-label="Type a question for the Cloudfund chat assistant"
                size="small"
                fullWidth
                inputProps={{ maxLength: 500 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5, fontSize: 13 } }}
              />
              <IconButton type="submit" aria-label="Send message" disabled={!draft.trim()} sx={{ width: 40, height: 40, flexShrink: 0, color: "#fff", background: "#00a57a", "&:hover": { background: "#008d68" }, "&.Mui-disabled": { background: "#e3e9e5", color: "#85928a" } }}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label={open ? "Close chat" : "Open chat with Cloudfund"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        sx={{ position: "fixed", zIndex: 1401, right: { xs: 16, sm: 24 }, bottom: { xs: 122, sm: 24 }, width: 58, height: 58, boxShadow: "0 8px 24px rgba(20,55,42,.28)" }}
      >
        {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </Fab>
    </>
  );
}
