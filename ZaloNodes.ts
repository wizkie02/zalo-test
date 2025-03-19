// ZaloNodes.ts

import { IExecuteFunctions } from 'n8n-core';
import * as zaloService from './zaloService';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

/**
 * Node: Find User
 * Endpoint: POST /findUser
 */
export class FindUser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Find User',
		name: 'findUser',
		group: ['transform'],
		version: 1,
		description: 'Find a user via Zalo API',
		defaults: {
			name: 'Find User',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: 'Enter phone number',
				description: 'Phone number of the user to search',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const phone = this.getNodeParameter('phone', 0) as string;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { phone, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/findUser`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Get User Info
 * Endpoint: POST /getUserInfo
 */
export class GetUserInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Get User Info',
		name: 'getUserInfo',
		group: ['transform'],
		version: 1,
		description: 'Retrieve information of a user via Zalo API',
		defaults: {
			name: 'Get User Info',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'ID of the user',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const userId = this.getNodeParameter('userId', 0) as string;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { userId, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/getUserInfo`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Send Friend Request
 * Endpoint: POST /sendFriendRequest
 */
export class SendFriendRequest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Send Friend Request',
		name: 'sendFriendRequest',
		group: ['transform'],
		version: 1,
		description: 'Send a friend request via Zalo API',
		defaults: {
			name: 'Send Friend Request',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'ID of the user to send request to',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const userId = this.getNodeParameter('userId', 0) as string;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { userId, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/sendFriendRequest`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Send Message
 * Endpoint: POST /sendmessage
 */
export class SendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Send Message',
		name: 'sendMessage',
		group: ['transform'],
		version: 1,
		description: 'Send a message via Zalo API',
		defaults: {
			name: 'Send Message',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				description: 'Content of the message',
			},
			{
				displayName: 'Thread ID',
				name: 'threadId',
				type: 'string',
				default: '',
				description: 'ID of the thread to send the message to',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Type of thread (e.g. User or Group)',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const message = this.getNodeParameter('message', 0) as string;
		const threadId = this.getNodeParameter('threadId', 0) as string;
		const type = this.getNodeParameter('type', 0) as string;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { message, threadId, type, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/sendmessage`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Create Group
 * Endpoint: POST /createGroup
 */
export class CreateGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Create Group',
		name: 'createGroup',
		group: ['transform'],
		version: 1,
		description: 'Create a new group via Zalo API',
		defaults: {
			name: 'Create Group',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				default: '',
				placeholder: 'Comma-separated member IDs',
				description: 'Member IDs separated by commas (excluding yourself)',
			},
			{
				displayName: 'Group Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the group',
			},
			{
				displayName: 'Avatar Path',
				name: 'avatarPath',
				type: 'string',
				default: '',
				description: 'Path to the group avatar image',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const membersInput = this.getNodeParameter('members', 0) as string;
		const members = membersInput.split(',').map(s => s.trim());
		const name = this.getNodeParameter('name', 0) as string;
		const avatarPath = this.getNodeParameter('avatarPath', 0) as string;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { members, name, avatarPath, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/createGroup`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Get Group Info
 * Endpoint: POST /getGroupInfo
 */
export class GetGroupInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Get Group Info',
		name: 'getGroupInfo',
		group: ['transform'],
		version: 1,
		description: 'Retrieve information of a group via Zalo API',
		defaults: {
			name: 'Get Group Info',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				placeholder: 'Enter group ID (or comma-separated for multiple)',
				description: 'Group ID(s)',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const groupIdInput = this.getNodeParameter('groupId', 0) as string;
		const groupId = groupIdInput.includes(',')
			? groupIdInput.split(',').map(s => s.trim())
			: groupIdInput;
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { groupId, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/getGroupInfo`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Add User To Group
 * Endpoint: POST /addUserToGroup
 */
export class AddUserToGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Add User To Group',
		name: 'addUserToGroup',
		group: ['transform'],
		version: 1,
		description: 'Add one or multiple users to a group via Zalo API',
		defaults: {
			name: 'Add User To Group',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'ID of the group',
			},
			{
				displayName: 'Member ID(s)',
				name: 'memberId',
				type: 'string',
				default: '',
				placeholder: 'Comma-separated member IDs',
				description: 'ID(s) of the member(s) to add',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const groupId = this.getNodeParameter('groupId', 0) as string;
		const memberIdInput = this.getNodeParameter('memberId', 0) as string;
		const memberId = memberIdInput.split(',').map(s => s.trim());
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { groupId, memberId, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/addUserToGroup`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}

/**
 * Node: Remove User From Group
 * Endpoint: POST /removeUserFromGroup
 */
export class RemoveUserFromGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Remove User From Group',
		name: 'removeUserFromGroup',
		group: ['transform'],
		version: 1,
		description: 'Remove one or multiple users from a group via Zalo API',
		defaults: {
			name: 'Remove User From Group',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'ID of the group',
			},
			{
				displayName: 'Member ID(s)',
				name: 'memberId',
				type: 'string',
				default: '',
				placeholder: 'Comma-separated member IDs',
				description: 'ID(s) of the member(s) to remove',
			},
			{
				displayName: 'Account Index',
				name: 'accountIndex',
				type: 'number',
				default: 0,
				description: 'Index of the account to use',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:3000',
				description: 'Base URL of the Zalo API server',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const groupId = this.getNodeParameter('groupId', 0) as string;
		const memberIdInput = this.getNodeParameter('memberId', 0) as string;
		const memberId = memberIdInput.split(',').map(s => s.trim());
		const accountIndex = this.getNodeParameter('accountIndex', 0) as number;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		const body = { groupId, memberId, accountIndex };

		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await this.helpers.request(`${baseUrl}/removeUserFromGroup`, options);
		const result = JSON.parse(response);
		return this.helpers.returnJsonArray(result);
	}
}
