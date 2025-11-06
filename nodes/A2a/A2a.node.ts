import {
	NodeConnectionTypes,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import type { SendMessageRequest, Task, TextPart, Message } from '../../types/a2a';

export class A2a implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'A2A',
		name: 'a2a',
		icon: 'file:../../icons/a2a.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '=Send Message',
		description: 'Send messages to AI agents via the A2A protocol',
		defaults: {
			name: 'A2A',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'a2aApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				description: 'The text message to send to the A2A agent',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Context ID',
				name: 'contextId',
				type: 'string',
				default: '',
				description: 'Optional context ID to maintain conversation threading across multiple messages',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const message = this.getNodeParameter('message', i) as string;
				const contextId = this.getNodeParameter('contextId', i, '') as string;
				const credentials = await this.getCredentials('a2aApi');

				const serverUrl = credentials.serverUrl as string;

				// Generate unique IDs
				const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
				const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;

				// Build text part according to A2A spec
				const textPart: TextPart = {
					kind: 'text',
					text: message,
				};

				// Build message according to A2A spec
				const a2aMessage: Message = {
					kind: 'message',
					messageId: messageId,
					parts: [textPart],
					role: 'user',
				};

				// Add contextId to message if provided
				if (contextId) {
					a2aMessage.contextId = contextId;
				}

				// Build JSON-RPC 2.0 request payload
				const requestBody: SendMessageRequest = {
					jsonrpc: '2.0',
					method: 'message/send',
					params: {
						message: a2aMessage,
					},
					id: requestId,
				};

				// Make HTTP request
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${serverUrl}`,
					headers: {
						'Content-Type': 'application/json',
					},
					body: requestBody,
					json: true,
				});

				// Extract the Task from the JSON-RPC response
				const task = response.result as Task;

				// Return the full task object
				// Note: Cast to unknown first to satisfy n8n's IDataObject type requirement
				returnData.push({
					json: task as unknown as typeof returnData[0]['json'],
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
