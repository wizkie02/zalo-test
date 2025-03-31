import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    zaloAccounts,
    findUser,
    getUserInfo,
    sendFriendRequest,
    sendMessage,
    createGroup,
    getGroupInfo,
    addUserToGroup,
    removeUserFromGroup,
    sendImageToUser,
    sendImagesToUser,
    sendImageToGroup,
    sendImagesToGroup,
    acceptFriendRequest,
    addGroupDeputy,
    addReaction,
    blockUser,
    changeFriendAlias,
    changeGroupAvatar,
    changeGroupName,
    changeGroupOwner,
    createNote,
    createPoll,
    deleteMessage,
    disperseGroup,
    editNote,
    getAllFriends,
    getAllGroups,
    getStickers,
    getStickersDetail,
    lockPoll,
    pinConversations,
    removeGroupDeputy,
    sendCard,
    sendReport,
    sendSticker,
    sendVoice,
    unblockUser,
    undo
} from './api/zalo/zalo.js';

const router = express.Router();

// Dành cho ES Module: xác định __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Existing routes
router.post('/findUser', findUser);
router.post('/getUserInfo', getUserInfo);
router.post('/sendFriendRequest', sendFriendRequest);
router.post('/sendmessage', sendMessage);
router.post('/createGroup', createGroup);
router.post('/getGroupInfo', getGroupInfo);
router.post('/addUserToGroup', addUserToGroup);
router.post('/removeUserFromGroup', removeUserFromGroup);
router.post('/sendImageToUser', sendImageToUser);
router.post('/sendImagesToUser', sendImagesToUser);
router.post('/sendImageToGroup', sendImageToGroup);
router.post('/sendImagesToGroup', sendImagesToGroup);

// New API routes
router.post('/acceptFriendRequest', acceptFriendRequest);
router.post('/addGroupDeputy', addGroupDeputy);
router.post('/addReaction', addReaction);
router.post('/blockUser', blockUser);
router.post('/changeFriendAlias', changeFriendAlias);
router.post('/changeGroupAvatar', changeGroupAvatar);
router.post('/changeGroupName', changeGroupName);
router.post('/changeGroupOwner', changeGroupOwner);
router.post('/createNote', createNote);
router.post('/createPoll', createPoll);
router.post('/deleteMessage', deleteMessage);
router.post('/disperseGroup', disperseGroup);
router.post('/editNote', editNote);
router.post('/getAllFriends', getAllFriends);
router.post('/getAllGroups', getAllGroups);
router.post('/getStickers', getStickers);
router.post('/getStickersDetail', getStickersDetail);
router.post('/lockPoll', lockPoll);
router.post('/pinConversations', pinConversations);
router.post('/removeGroupDeputy', removeGroupDeputy);
router.post('/sendCard', sendCard);
router.post('/sendReport', sendReport);
router.post('/sendSticker', sendSticker);
router.post('/sendVoice', sendVoice);
router.post('/unblockUser', unblockUser);
router.post('/undo', undo);

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const { ownId } = req.body;
        if (!ownId) {
            return res.status(400).json({ success: false, error: 'ownId is required' });
        }

        // Find and remove account
        const accountIndex = zaloAccounts.findIndex(acc => acc.ownId === ownId);
        if (accountIndex === -1) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }

        // Remove cookie file
        const cookiePath = path.join('./cookies', `cred_${ownId}.json`);
        if (fs.existsSync(cookiePath)) {
            fs.unlinkSync(cookiePath);
        }

        // Remove from accounts array
        zaloAccounts.splice(accountIndex, 1);

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;