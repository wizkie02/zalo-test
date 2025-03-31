import express from 'express';
import {
    acceptFriendRequest,
    addGroupDeputy,
    addReaction,
    addUserToGroup,
    blockUser,
    changeFriendAlias,
    changeGroupAvatar,
    changeGroupName,
    changeGroupOwner,
    createGroup,
    createNote,
    createPoll,
    deleteMessage,
    disperseGroup,
    editNote,
    fetchAccountInfo,
    findUser,
    getAllFriends,
    getAllGroups,
    getContext,
    getCookie,
    getGroupInfo,
    getOwnId,
    getQR,
    getStickers,
    getStickersDetail,
    getUserInfo,
    lockPoll,
    pinConversations,
    removeGroupDeputy,
    removeUserFromGroup,
    sendCard,
    sendFriendRequest,
    sendMessage,
    sendReport,
    sendSticker,
    sendVoice,
    unblockUser,
    undo
} from './api/zalo/zalo.js';

const router = express.Router();

// Friend Management
router.post('/acceptFriendRequest', acceptFriendRequest);
router.post('/blockUser', blockUser);
router.post('/unblockUser', unblockUser);
router.post('/changeFriendAlias', changeFriendAlias);
router.post('/sendFriendRequest', sendFriendRequest);

// Group Management
router.post('/createGroup', createGroup);
router.post('/addUserToGroup', addUserToGroup);
router.post('/removeUserFromGroup', removeUserFromGroup);
router.post('/addGroupDeputy', addGroupDeputy);
router.post('/removeGroupDeputy', removeGroupDeputy);
router.post('/changeGroupAvatar', changeGroupAvatar);
router.post('/changeGroupName', changeGroupName);
router.post('/changeGroupOwner', changeGroupOwner);
router.post('/disperseGroup', disperseGroup);

// Message & Media
router.post('/sendMessage', sendMessage);
router.post('/sendSticker', sendSticker);
router.post('/sendVoice', sendVoice);
router.post('/sendCard', sendCard);
router.post('/deleteMessage', deleteMessage);
router.post('/addReaction', addReaction);
router.post('/pinConversations', pinConversations);

// Group Features
router.post('/createNote', createNote);
router.post('/editNote', editNote);
router.post('/createPoll', createPoll);
router.post('/lockPoll', lockPoll);

// Info & Status
router.get('/getAllFriends', getAllFriends);
router.get('/getAllGroups', getAllGroups);
router.get('/getGroupInfo', getGroupInfo);
router.get('/getUserInfo', getUserInfo);
router.get('/getStickers', getStickers);
router.get('/getStickersDetail', getStickersDetail);
router.get('/getContext', getContext);
router.get('/getOwnId', getOwnId);
router.get('/getCookie', getCookie);

// Other
router.post('/sendReport', sendReport);
router.post('/undo', undo);
router.get('/fetchAccountInfo', fetchAccountInfo);
router.get('/findUser', findUser);
router.get('/getQR', getQR);

export default router;