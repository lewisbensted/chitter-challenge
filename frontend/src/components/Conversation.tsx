import React, { Fragment, useState } from "react";
import { IConversation } from "../utils/interfaces";
import ConversationIcon from "./ConversationIcon";
import { Box, IconButton, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";

interface Props {
    userId?: string;
    conversation: IConversation;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    reloadTrigger: boolean;
    toggleReloadTrigger: (arg: boolean) => void;
}

const Conversation: React.FC<Props> = ({
    userId,
    conversation,
    isComponentLoading,
    setComponentLoading,
    setConversations,
    reloadTrigger,
    toggleReloadTrigger,
}) => {
    return (
        <Box sx={{ display: "flex", paddingTop: "10px" }}>
            <Box>
                <Link href={`/users/${conversation.interlocutorId}`} variant="h6">
                    {conversation.interlocutorUsername}
                </Link>
                <ConversationIcon
                    userId={userId}
                    conversation={conversation}
                    isComponentLoading={isComponentLoading}
                    setComponentLoading={setComponentLoading}
                    setConversations={setConversations}
                    reloadTrigger={reloadTrigger}
                    toggleReloadTrigger={toggleReloadTrigger}
                />
                <Typography
                    sx={{
                        fontWeight:
                            !conversation.latestMessage!.isRead && conversation.latestMessage?.senderId != userId
                                ? "bold"
                                : "medium",
                    }}
                >
                    {conversation.latestMessage!.text}
                    {conversation.latestMessage!.isRead && conversation.latestMessage?.senderId == userId ? (
                        <IconButton style={{ pointerEvents: "none" }}>
                            <Done fontSize="small" />
                        </IconButton>
                    ) : null}
                </Typography>
            </Box>
        </Box>
    );
};

export default Conversation;
