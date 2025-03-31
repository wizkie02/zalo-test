// api/zalo/zalo.js
import { Zalo, ThreadType } from 'zca-js';
import { proxyService } from '../../proxyService.js';
import { setupEventListeners } from '../../eventListeners.js';
import { HttpsProxyAgent } from "https-proxy-agent";
import nodefetch from "node-fetch";
import fs from 'fs';

export const zaloAccounts = [];

export async function findUser(req, res) {
    try {
        const { phone, ownId } = req.body;
        if (!phone || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const userData = await account.api.findUser(phone);
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getUserInfo(req, res) {
    try {
        const { userId, ownId } = req.body;
        if (!userId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const info = await account.api.getUserInfo(userId);
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const { userId, ownId } = req.body;
        if (!userId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const result = await account.api.sendFriendRequest('Xin chào, hãy kết bạn với tôi!', userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendMessage(req, res) {
    try {
        const { message, threadId, type, ownId } = req.body;
        if (!message || !threadId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        console.log("Message: ", message);
        console.log("ThreadId: ", threadId);
        console.log("Type: ", type);
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const msgType = type || ThreadType.User;
        const result = await account.api.sendMessage(message, threadId, msgType);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Friend Management
export async function acceptFriendRequest(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.acceptFriendRequest(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function blockUser(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.blockUser(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function unblockUser(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.unblockUser(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Group Management
export async function createGroup(req, res) {
    try {
        const { ownId, name, members } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.createGroup(name, members);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function addUserToGroup(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.addUserToGroup(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function removeUserFromGroup(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.removeUserFromGroup(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Group Features
export async function createNote(req, res) {
    try {
        const { ownId, groupId, content } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.createNote(groupId, content);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Group Info
export async function getGroupInfo(req, res) {
    try {
        const { groupId, ownId } = req.body;
        // Kiểm tra dữ liệu: groupId phải tồn tại và nếu là mảng thì không rỗng
        if (!groupId || (Array.isArray(groupId) && groupId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API getGroupInfo từ zaloAccounts
        const result = await account.api.getGroupInfo(groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Avatar
export async function changeGroupAvatar(req, res) {
    try {
        const { ownId, groupId, avatarPath } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupAvatar(groupId, avatarPath);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Name
export async function changeGroupName(req, res) {
    try {
        const { ownId, groupId, name } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupName(groupId, name);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Owner
export async function changeGroupOwner(req, res) {
    try {
        const { ownId, groupId, newOwnerId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupOwner(groupId, newOwnerId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Add Group Deputy
export async function addGroupDeputy(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.addGroupDeputy(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Remove Group Deputy
export async function removeGroupDeputy(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.removeGroupDeputy(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Lock Poll
export async function lockPoll(req, res) {
    try {
        const { ownId, groupId, pollId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.lockPoll(groupId, pollId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete Message
export async function deleteMessage(req, res) {
    try {
        const { ownId, messageId, threadId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.deleteMessage(messageId, threadId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Add Reaction
export async function addReaction(req, res) {
    try {
        const { ownId, messageId, reaction } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.addReaction(messageId, reaction);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get All Friends
export async function getAllFriends(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getAllFriends();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get All Groups
export async function getAllGroups(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getAllGroups();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Stickers
export async function getStickers(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getStickers();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Stickers Detail
export async function getStickersDetail(req, res) {
    try {
        const { ownId, stickerId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getStickersDetail(stickerId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Sticker
export async function sendSticker(req, res) {
    try {
        const { ownId, threadId, stickerId, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendSticker(stickerId, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Voice
export async function sendVoice(req, res) {
    try {
        const { ownId, threadId, voicePath, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendVoice(voicePath, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Card
export async function sendCard(req, res) {
    try {
        const { ownId, threadId, userId, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendCard(userId, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Pin Conversations
export async function pinConversations(req, res) {
    try {
        const { ownId, threadIds } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.pinConversations(threadIds);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Report
export async function sendReport(req, res) {
    try {
        const { ownId, threadId, reason } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendReport(threadId, reason);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Undo Action
export async function undo(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.undo();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Disperse Group
export async function disperseGroup(req, res) {
    try {
        const { ownId, groupId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.disperseGroup(groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}